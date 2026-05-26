<?php

namespace App\Services\Matriculas;

use App\Models\Alumno;

class ConsolidadoAlumnoService
{
    public function obtener(int $idAlumno): array
    {
        $alumno = Alumno::query()
            ->with([
                'carrera.area',
                'apoderado',
                'matriculaVigente.ciclo',
                'matriculaVigente.periodo',
                'matriculaVigente.turno',
                'matriculaVigente.aula',
            ])
            ->findOrFail($idAlumno);

        $matricula = $alumno->matriculaVigente;

        return [
            'perfil' => [
                'id_alumno' => $alumno->id_alumno,
                'codigo' => $alumno->codigo,
                'nombres' => $alumno->nombres,
                'apellidos' => $alumno->apellidos,
                'nombre_completo' => trim("{$alumno->nombres} {$alumno->apellidos}"),
                'dni' => $alumno->dni,
                'fecha_nac' => $alumno->fecha_nac?->toDateString(),
                'sexo' => $alumno->sexo,
                'telefono' => $alumno->telefono,
                'correo' => $alumno->correo,
                'direccion' => $alumno->direccion,
                'colegio_procedencia' => $alumno->colegio_proc,
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
                    'dni' => $alumno->apoderado->dni,
                    'telefono' => $alumno->apoderado->telefono,
                    'parentesco' => $alumno->apoderado->parentesco,
                    'correo' => $alumno->apoderado->correo,
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
            'asistencia' => [
                'resumen' => null,
                'detalle' => [],
                '_meta' => [
                    'modulo' => 'asistencia',
                    'disponible' => false,
                    'mensaje' => 'Pendiente de integración en sprint de asistencia (RI004).',
                ],
            ],
            'notas' => [
                'promedio_general' => null,
                'examenes' => [],
                '_meta' => [
                    'modulo' => 'rendimiento',
                    'disponible' => false,
                    'mensaje' => 'Pendiente de integración en sprint de notas (RI006).',
                ],
            ],
            'finanzas' => [
                'saldo_pendiente' => null,
                'cuotas' => [],
                'pagos' => [],
                '_meta' => [
                    'modulo' => 'pagos',
                    'disponible' => false,
                    'mensaje' => 'Pendiente de integración en sprint de pagos (RI005).',
                ],
            ],
        ];
    }
}
