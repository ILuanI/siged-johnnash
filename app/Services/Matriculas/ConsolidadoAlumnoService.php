<?php

namespace App\Services\Matriculas;

use App\Models\Alumno;
use App\Models\ExamenMetrica;
use App\Services\Ia\DesercionRiskService;

class ConsolidadoAlumnoService
{
    public function __construct(
        private readonly DesercionRiskService $desercionRiskService,
    ) {}

    public function obtener(int $idAlumno): array
    {
        $alumno = Alumno::query()
            ->with([
                'carrera.area',
                'apoderado',
                'colegioProcedencia',
                'matriculaVigente.ciclo',
                'matriculaVigente.periodo',
                'matriculaVigente.turno',
                'matriculaVigente.aula',
            ])
            ->findOrFail($idAlumno);

        $matricula = $alumno->matriculaVigente;
        $prediccion = $matricula ? $this->desercionRiskService->calcularParaMatricula($matricula) : null;

        return [
            'perfil' => [
                'id_alumno' => $alumno->id_alumno,
                'nombres' => $alumno->nombres,
                'apellidos' => $alumno->apellidos,
                'nombre_completo' => trim("{$alumno->nombres} {$alumno->apellidos}"),
                'dni' => $alumno->dni,
                'fecha_nac' => $alumno->fecha_nac?->toDateString(),
                'sexo' => $alumno->sexo,
                'telefono' => $alumno->telefono,
                'colegio_procedencia' => $alumno->colegioProcedencia ? [
                    'id_colegio_procedencia' => $alumno->colegioProcedencia->id_colegio_procedencia,
                    'nombre' => $alumno->colegioProcedencia->nombre,
                ] : null,
                'estado' => $alumno->estado?->value,
                'carrera' => $alumno->carrera ? [
                    'id_carrera' => $alumno->carrera->id_carrera,
                    'nombre' => $alumno->carrera->nombre,
                    'area' => $alumno->carrera->area ? [
                        'id_area' => $alumno->carrera->area->id_area,
                        'codigo' => $alumno->carrera->area->codigo,
                        'nombre' => $alumno->carrera->area->nombre,
                    ] : null,
                ] : null,
                'apoderado' => $alumno->apoderado ? [
                    'id_apoderado' => $alumno->apoderado->id_apoderado,
                    'nombres' => $alumno->apoderado->nombres,
                    'telefono' => $alumno->apoderado->telefono,
                ] : null,
            ],
            'matricula_actual' => $matricula ? [
                'id_matricula' => $matricula->id_matricula,
                'estado' => $matricula->estado?->value,
                'fecha_matricula' => $matricula->fecha_matricula?->toDateString(),
                'modalidad' => $matricula->modalidad?->value,
                'tipo_pago' => $matricula->tipo_pago?->value,
                'costo_total' => $matricula->costo_total,
                'periodo' => [
                    'id_periodo' => $matricula->periodo?->id_periodo,
                    'nombre' => $matricula->periodo?->nombre,
                    'anio' => $matricula->periodo?->anio,
                ],
                'ciclo' => [
                    'id_ciclo' => $matricula->ciclo?->id_ciclo,
                    'nombre' => $matricula->ciclo?->nombre,
                    'tipo_ciclo' => $matricula->ciclo?->tipo_ciclo,
                    'fecha_inicio' => $matricula->ciclo?->fecha_inicio?->toDateString(),
                    'fecha_fin' => $matricula->ciclo?->fecha_fin?->toDateString(),
                ],
                'turno' => [
                    'id_turno' => $matricula->turno?->id_turno,
                    'nombre' => $matricula->turno?->nombre,
                ],
                'aula' => [
                    'id_aula' => $matricula->aula?->id_aula,
                    'nombre' => $matricula->aula?->nombre,
                    'capacidad' => $matricula->aula?->capacidad,
                ],
            ] : null,
            'riesgo_desercion' => $prediccion ? [
                'riesgo_pct' => $prediccion->riesgo_pct,
                'nivel_riesgo' => $prediccion->nivel_riesgo,
                'prioritario' => $prediccion->riesgo_pct > 75,
                'tasa_asistencia' => $prediccion->tasa_asistencia,
                'promedio_examenes' => $prediccion->promedio_examenes,
                'cuotas_vencidas' => $prediccion->cuotas_vencidas,
                'fecha_calculo' => $prediccion->fecha_calculo?->toDateTimeString(),
            ] : null,
            'asistencia' => [
                'resumen' => (function () use ($matricula) {
                    if (! $matricula) {
                        return null;
                    }
                    $asistencias = $matricula->asistencias;
                    $total = $asistencias->count();
                    $asistio = $asistencias->where('estado', 'ASISTIO')->count();
                    $tardanza = $asistencias->where('estado', 'TARDANZA')->count();
                    $falto = $asistencias->where('estado', 'FALTO')->count();
                    $justificado = $asistencias->where('estado', 'JUSTIFICADO')->count();
                    $tasa = $total > 0 ? (($asistio + $tardanza) / $total) * 100 : null;

                    return [
                        'total_clases' => $total,
                        'total_asistencias' => $asistio,
                        'total_tardanzas' => $tardanza,
                        'total_faltas' => $falto,
                        'total_justificadas' => $justificado,
                        'tasa_asistencia' => $tasa,
                    ];
                })(),
                'detalle' => $matricula ? $matricula->asistencias()->with('asignacionDocente.curso')->orderBy('fecha', 'desc')->get()->map(fn ($asist) => [
                    'fecha' => $asist->fecha?->toDateString(),
                    'estado' => $asist->estado,
                    'curso' => $asist->asignacionDocente?->curso?->nombre ?? 'Desconocido',
                ])->toArray() : [],
                '_meta' => [
                    'modulo' => 'asistencia',
                    'disponible' => true,
                    'mensaje' => 'Ok',
                ],
            ],
            'notas' => [
                'promedio_general' => $matricula ? floatval($matricula->resultadosExamen()->avg('puntaje_total')) : null,
                'examenes' => $matricula ? $matricula->resultadosExamen()->with('examen')->get()->map(function ($res) use ($alumno) {
                    $areaId = $alumno->carrera->id_area ?? null;
                    $metricas = ExamenMetrica::where('id_examen', $res->id_examen)
                        ->where('id_area', $areaId)
                        ->first();

                    return [
                        'id_resultado' => $res->id_resultado,
                        'tipo' => $res->examen->tipo,
                        'numero' => $res->examen->numero,
                        'fecha' => $res->examen->fecha?->toDateString(),
                        'descripcion' => $res->examen->descripcion,
                        'puntaje_aptitud' => floatval($res->puntaje_aptitud),
                        'puntaje_conocimiento' => floatval($res->puntaje_conocimiento),
                        'puntaje_total' => floatval($res->puntaje_total),
                        'puesto' => $res->puesto,
                        'max_area' => $metricas ? floatval($metricas->puntaje_max) : null,
                        'min_area' => $metricas ? floatval($metricas->puntaje_min) : null,
                    ];
                })->sortBy('fecha')->values()->toArray() : [],
                '_meta' => [
                    'modulo' => 'rendimiento',
                    'disponible' => true,
                    'mensaje' => 'Ok',
                ],
            ],
            'finanzas' => (function () use ($matricula) {
                if (! $matricula) {
                    return [
                        'saldo_pendiente' => 0.0,
                        'costo_total' => 0.0,
                        'tipo_pago' => null,
                        'estado_pago' => 'PENDIENTE',
                        'cuotas' => [],
                        'pagos' => [],
                        '_meta' => [
                            'modulo' => 'pagos',
                            'disponible' => true,
                            'mensaje' => 'Ok',
                        ],
                    ];
                }
                $comprobante = $matricula->comprobantePago()->with(['cuotas.pagos'])->first();
                $saldoPendiente = $comprobante ? floatval($comprobante->saldo_pendiente) : 0.0;
                $costoTotal = floatval($matricula->costo_total);

                $cuotasMapped = [];
                $pagosMapped = [];
                $tieneDeudaVencida = false;

                if ($comprobante) {
                    foreach ($comprobante->cuotas as $cuota) {
                        $estadoCuota = $cuota->estado;
                        $vencida = $estadoCuota !== 'PAGADA' && $cuota->fecha_vencimiento->lt(today());
                        if ($vencida) {
                            $estadoCuota = 'VENCIDA';
                            $tieneDeudaVencida = true;
                        }

                        $cuotasMapped[] = [
                            'id_cuota' => $cuota->id_cuota,
                            'numero_cuota' => $cuota->numero_cuota,
                            'monto' => floatval($cuota->monto),
                            'fecha_vencimiento' => $cuota->fecha_vencimiento?->toDateString(),
                            'estado' => $estadoCuota,
                        ];

                        foreach ($cuota->pagos as $pago) {
                            $pagosMapped[] = [
                                'id_pago' => $pago->id_pago,
                                'numero_cuota' => $cuota->numero_cuota,
                                'monto' => floatval($pago->monto),
                                'fecha_pago' => $pago->fecha_pago?->toDateTimeString(),
                                'metodo_pago' => $pago->metodo_pago,
                            ];
                        }
                    }
                }

                $estadoPago = 'PENDIENTE';
                if ($matricula->tipo_pago?->value === 'CONTADO') {
                    $estadoPago = $saldoPendiente <= 0 ? 'PAGADO' : 'PENDIENTE';
                } else {
                    if ($saldoPendiente <= 0) {
                        $estadoPago = 'PAGADO';
                    } elseif ($tieneDeudaVencida) {
                        $estadoPago = 'DEUDOR';
                    } else {
                        $estadoPago = 'AL_DIA';
                    }
                }

                return [
                    'saldo_pendiente' => $saldoPendiente,
                    'costo_total' => $costoTotal,
                    'tipo_pago' => $matricula->tipo_pago?->value,
                    'estado_pago' => $estadoPago,
                    'cuotas' => $cuotasMapped,
                    'pagos' => $pagosMapped,
                    '_meta' => [
                        'modulo' => 'pagos',
                        'disponible' => true,
                        'mensaje' => 'Ok',
                    ],
                ];
            })(),
        ];
    }
}
