<?php

namespace App\Services\Ia;

use App\Enums\EstadoMatricula;
use App\Models\Cuota;
use App\Models\Matricula;
use App\Models\PrediccionDesercion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DesercionRiskService
{
    public function recalcularTodos(): int
    {
        $procesados = 0;

        Matricula::query()
            ->where('estado', EstadoMatricula::Vigente->value)
            ->orderBy('id_matricula')
            ->chunkById(100, function (Collection $matriculas) use (&$procesados): void {
                foreach ($matriculas as $matricula) {
                    $this->calcularParaMatricula($matricula);
                    $procesados++;
                }
            }, 'id_matricula', 'id_matricula');

        return $procesados;
    }

    public function calcularParaMatricula(Matricula $matricula): PrediccionDesercion
    {
        $metricas = $this->metricas($matricula);
        $riesgo = $this->calcularRiesgo(
            $metricas['tasa_asistencia'],
            $metricas['promedio_examenes'],
            $metricas['cuotas_vencidas'],
        );

        $prediccion = PrediccionDesercion::query()->updateOrCreate(
            ['id_matricula' => $matricula->id_matricula],
            [
                'fecha_calculo' => now(),
                'riesgo_pct' => $riesgo,
                'nivel_riesgo' => $this->nivelRiesgo($riesgo),
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
                'codigo' => $alumno->codigo,
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
