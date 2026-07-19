<?php

namespace App\Services\Ia;

use App\Enums\EstadoMatricula;
use App\Models\Cuota;
use App\Models\Matricula;
use App\Models\PrediccionDesercion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class DesercionRiskService
{
    public function recalcularTodos(): int
    {
        $procesados = 0;

        Matricula::query()
            ->where('estado', EstadoMatricula::Vigente->value)
            ->with(['alumno', 'turno'])
            ->orderBy('id_matricula')
            ->chunkById(100, function (Collection $matriculas) use (&$procesados): void {
                $payload = [];
                $matriculaMap = [];

                foreach ($matriculas as $matricula) {
                    $metricas = $this->metricas($matricula);

                    $course = $matricula->alumno->id_carrera ?? 1;
                    $turnoNombre = $matricula->turno?->nombre ?? '';
                    $daytimeEveningAttendance = (stripos($turnoNombre, 'mañana') !== false) ? 1 : 0;

                    $promedio = $metricas['promedio_examenes'];
                    $grade = 14.0;
                    if ($promedio !== null) {
                        $grade = ($promedio > 20) ? min(20.0, ($promedio / 100) * 20) : (float) $promedio;
                    }

                    $debtor = $metricas['cuotas_vencidas'] > 0 ? 1 : 0;
                    $tuitionFeesUpToDate = $metricas['cuotas_vencidas'] === 0 ? 1 : 0;

                    $fechaNac = $matricula->alumno->fecha_nac;
                    $fechaMatricula = $matricula->fecha_matricula ?? now();
                    $ageAtEnrollment = $fechaNac ? (int) $fechaNac->diffInYears($fechaMatricula) : 18;

                    $payload[] = [
                        'application_mode' => 1,
                        'course' => (int) $course,
                        'daytime_evening_attendance' => (int) $daytimeEveningAttendance,
                        'previous_qualification' => 1,
                        'previous_qualification_grade' => (float) $grade,
                        'admission_grade' => (float) $grade,
                        'debtor' => (int) $debtor,
                        'tuition_fees_up_to_date' => (int) $tuitionFeesUpToDate,
                        'scholarship_holder' => 0,
                        'age_at_enrollment' => (int) $ageAtEnrollment,
                    ];

                    $matriculaMap[] = [
                        'matricula' => $matricula,
                        'metricas' => $metricas,
                    ];
                }

                $predictions = [];
                try {
                    $response = Http::timeout(5)->post('http://127.0.0.1:8001/predict/bulk', [
                        'students' => $payload,
                    ]);

                    if ($response->successful()) {
                        $predictions = $response->json()['predictions'] ?? [];
                    }
                } catch (\Exception $e) {
                    logger()->warning('Microservicio de deserción inaccesible en bulk: '.$e->getMessage());
                }

                foreach ($matriculaMap as $index => $item) {
                    $matricula = $item['matricula'];
                    $metricas = $item['metricas'];

                    $riesgo = null;
                    $nivelRiesgo = null;

                    if (isset($predictions[$index])) {
                        $riesgo = (float) $predictions[$index]['dropout_probability'];
                        $nivelRiesgo = $predictions[$index]['risk_level'];
                    } else {
                        // Fallback a heurística
                        $riesgo = $this->calcularRiesgo(
                            $metricas['tasa_asistencia'],
                            $metricas['promedio_examenes'],
                            $metricas['cuotas_vencidas'],
                        );
                        $nivelRiesgo = $this->nivelRiesgo($riesgo);
                    }

                    PrediccionDesercion::query()->updateOrCreate(
                        ['id_matricula' => $matricula->id_matricula],
                        [
                            'fecha_calculo' => now(),
                            'riesgo_pct' => $riesgo,
                            'nivel_riesgo' => $nivelRiesgo,
                            'tasa_asistencia' => $metricas['tasa_asistencia'],
                            'promedio_examenes' => $metricas['promedio_examenes'],
                            'cuotas_vencidas' => $metricas['cuotas_vencidas'],
                        ],
                    );

                    $procesados++;
                }
            }, 'id_matricula', 'id_matricula');

        return $procesados;
    }

    public function calcularParaMatricula(Matricula $matricula): PrediccionDesercion
    {
        $metricas = $this->metricas($matricula);

        $course = $matricula->alumno->id_carrera ?? 1;
        $turnoNombre = $matricula->turno?->nombre ?? '';
        $daytimeEveningAttendance = (stripos($turnoNombre, 'mañana') !== false) ? 1 : 0;

        $promedio = $metricas['promedio_examenes'];
        $grade = 14.0;
        if ($promedio !== null) {
            $grade = ($promedio > 20) ? min(20.0, ($promedio / 100) * 20) : (float) $promedio;
        }

        $debtor = $metricas['cuotas_vencidas'] > 0 ? 1 : 0;
        $tuitionFeesUpToDate = $metricas['cuotas_vencidas'] === 0 ? 1 : 0;

        $fechaNac = $matricula->alumno->fecha_nac;
        $fechaMatricula = $matricula->fecha_matricula ?? now();
        $ageAtEnrollment = $fechaNac ? (int) $fechaNac->diffInYears($fechaMatricula) : 18;

        $riesgo = null;
        $nivelRiesgo = null;

        try {
            $response = Http::timeout(3)->post('http://127.0.0.1:8001/predict', [
                'application_mode' => 1,
                'course' => (int) $course,
                'daytime_evening_attendance' => (int) $daytimeEveningAttendance,
                'previous_qualification' => 1,
                'previous_qualification_grade' => (float) $grade,
                'admission_grade' => (float) $grade,
                'debtor' => (int) $debtor,
                'tuition_fees_up_to_date' => (int) $tuitionFeesUpToDate,
                'scholarship_holder' => 0,
                'age_at_enrollment' => (int) $ageAtEnrollment,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $riesgo = (float) $data['dropout_probability'];
                $nivelRiesgo = $data['risk_level'];
            }
        } catch (\Exception $e) {
            logger()->warning('Microservicio de deserción inaccesible: '.$e->getMessage());
        }

        if ($riesgo === null || $nivelRiesgo === null) {
            $riesgo = $this->calcularRiesgo(
                $metricas['tasa_asistencia'],
                $metricas['promedio_examenes'],
                $metricas['cuotas_vencidas'],
            );
            $nivelRiesgo = $this->nivelRiesgo($riesgo);
        }

        $prediccion = PrediccionDesercion::query()->updateOrCreate(
            ['id_matricula' => $matricula->id_matricula],
            [
                'fecha_calculo' => now(),
                'riesgo_pct' => $riesgo,
                'nivel_riesgo' => $nivelRiesgo,
                'tasa_asistencia' => $metricas['tasa_asistencia'],
                'promedio_examenes' => $metricas['promedio_examenes'],
                'cuotas_vencidas' => $metricas['cuotas_vencidas'],
            ],
        );

        return $prediccion->refresh();
    }

    /**
     * @return array{total: int, promedio_riesgo: float, alto: int, medio: int, bajo: int, prioritarios: int, ultima_actualizacion: string|null}
     */
    public function resumen(): array
    {
        $query = PrediccionDesercion::query();

        return [
            'total' => (int) $query->clone()->count(),
            'promedio_riesgo' => round((float) $query->clone()->avg('riesgo_pct'), 2),
            'alto' => (int) $query->clone()->where('nivel_riesgo', 'ALTO')->count(),
            'medio' => (int) $query->clone()->where('nivel_riesgo', 'MEDIO')->count(),
            'bajo' => (int) $query->clone()->where('nivel_riesgo', 'BAJO')->count(),
            'prioritarios' => (int) $query->clone()->where('riesgo_pct', '>', 75)->count(),
            'ultima_actualizacion' => $query->clone()->max('fecha_calculo'),
        ];
    }

    /**
     * @return list<array{nivel: string, total: int}>
     */
    public function distribucion(): array
    {
        $conteos = PrediccionDesercion::query()
            ->select('nivel_riesgo', DB::raw('COUNT(*) as total'))
            ->groupBy('nivel_riesgo')
            ->pluck('total', 'nivel_riesgo');

        return collect(['BAJO', 'MEDIO', 'ALTO'])
            ->map(fn (string $nivel) => [
                'nivel' => $nivel,
                'total' => (int) ($conteos[$nivel] ?? 0),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function prioritarios(int $limit = 25): array
    {
        return PrediccionDesercion::query()
            ->with([
                'matricula.alumno.carrera.area',
                'matricula.ciclo',
                'matricula.turno',
                'matricula.aula',
            ])
            ->where('riesgo_pct', '>', 75)
            ->orderByDesc('riesgo_pct')
            ->limit($limit)
            ->get()
            ->map(fn (PrediccionDesercion $prediccion) => $this->mapearPrediccion($prediccion))
            ->values()
            ->all();
    }

    /**
     * @return array{tasa_asistencia: float|null, promedio_examenes: float|null, cuotas_vencidas: int}
     */
    private function metricas(Matricula $matricula): array
    {
        $asistencia = $matricula->asistencias()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN estado IN ('ASISTIO', 'TARDANZA', 'JUSTIFICADO') THEN 1 ELSE 0 END) as favorables")
            ->first();

        $totalAsistencias = (int) ($asistencia?->total ?? 0);
        $favorables = (int) ($asistencia?->favorables ?? 0);
        $tasaAsistencia = $totalAsistencias > 0
            ? round(($favorables / $totalAsistencias) * 100, 2)
            : null;

        $promedioExamenes = $matricula->resultadosExamen()->avg('puntaje_total');

        $cuotasVencidas = Cuota::query()
            ->whereHas('comprobantePago', fn ($query) => $query->where('id_matricula', $matricula->id_matricula))
            ->where('estado', '!=', 'PAGADA')
            ->whereDate('fecha_vencimiento', '<', today())
            ->count();

        return [
            'tasa_asistencia' => $tasaAsistencia,
            'promedio_examenes' => $promedioExamenes !== null ? round((float) $promedioExamenes, 3) : null,
            'cuotas_vencidas' => min(255, (int) $cuotasVencidas),
        ];
    }

    private function calcularRiesgo(?float $tasaAsistencia, ?float $promedioExamenes, int $cuotasVencidas): float
    {
        $riesgoAsistencia = $tasaAsistencia === null
            ? 18.0
            : max(0, 100 - $tasaAsistencia) * 0.45;

        $riesgoNotas = match (true) {
            $promedioExamenes === null => 14.0,
            $promedioExamenes <= 20 => max(0, (14 - $promedioExamenes) / 14 * 100) * 0.30,
            default => max(0, (65 - $promedioExamenes) / 65 * 100) * 0.30,
        };

        $riesgoFinanzas = min(100, $cuotasVencidas * 35) * 0.25;

        return round(min(100, $riesgoAsistencia + $riesgoNotas + $riesgoFinanzas), 2);
    }

    private function nivelRiesgo(float $riesgo): string
    {
        return match (true) {
            $riesgo >= 75 => 'ALTO',
            $riesgo >= 40 => 'MEDIO',
            default => 'BAJO',
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function mapearPrediccion(PrediccionDesercion $prediccion): array
    {
        $matricula = $prediccion->matricula;
        $alumno = $matricula?->alumno;

        return [
            'id_prediccion' => $prediccion->id_prediccion,
            'id_matricula' => $prediccion->id_matricula,
            'riesgo_pct' => $prediccion->riesgo_pct,
            'nivel_riesgo' => $prediccion->nivel_riesgo,
            'prioritario' => $prediccion->riesgo_pct > 75,
            'tasa_asistencia' => $prediccion->tasa_asistencia,
            'promedio_examenes' => $prediccion->promedio_examenes,
            'cuotas_vencidas' => $prediccion->cuotas_vencidas,
            'fecha_calculo' => $prediccion->fecha_calculo?->toDateTimeString(),
            'alumno' => $alumno ? [
                'id_alumno' => $alumno->id_alumno,
                'dni' => $alumno->dni,
                'nombre_completo' => trim("{$alumno->nombres} {$alumno->apellidos}"),
                'telefono' => $alumno->telefono,
                'carrera' => $alumno->carrera ? [
                    'id_carrera' => $alumno->carrera->id_carrera,
                    'nombre' => $alumno->carrera->nombre,
                    'area' => $alumno->carrera->area ? [
                        'codigo' => $alumno->carrera->area->codigo,
                        'nombre' => $alumno->carrera->area->nombre,
                    ] : null,
                ] : null,
            ] : null,
            'matricula' => $matricula ? [
                'ciclo' => $matricula->ciclo?->nombre,
                'turno' => $matricula->turno?->nombre,
                'aula' => $matricula->aula?->nombre,
            ] : null,
        ];
    }
}
