<?php

namespace App\Http\Controllers\Bi;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Asistencia;
use App\Models\Ciclo;
use App\Models\Matricula;
use App\Models\Pago;
use App\Models\ResultadoExamen;
use App\Services\Bi\AreaMetricsService;
use App\Services\Matriculas\ConsolidadoAlumnoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardBiController extends Controller
{
    public function __construct(
        protected ConsolidadoAlumnoService $consolidadoAlumnoService,
        protected AreaMetricsService $areaMetricsService,
    ) {}

    public function index(Request $request): Response
    {
        // Cycles list
        $ciclos = Ciclo::query()
            ->orderBy('fecha_inicio', 'desc')
            ->get()
            ->map(fn (Ciclo $ciclo): array => [
                'id_ciclo' => $ciclo->id_ciclo,
                'nombre' => $ciclo->nombre,
            ]);

        // Active cycle or selected one
        $selectedCycleId = $request->integer('id_ciclo');
        if (! $selectedCycleId) {
            $activeCycle = Ciclo::where('estado', 'ABIERTO')->first() ?? Ciclo::latest('fecha_inicio')->first();
            $selectedCycleId = $activeCycle ? $activeCycle->id_ciclo : null;
        }

        // Global KPIs
        $totalMatriculados = 0;
        $tasaAsistenciaPromedio = 0.0;
        $promedioNotasGlobal = 0.0;
        $tasaRecaudacion = 0.0;

        if ($selectedCycleId) {
            $totalMatriculados = Matricula::where('id_ciclo', $selectedCycleId)
                ->where('estado', 'VIGENTE')
                ->count();

            // Attendance Average
            $totalAsistencias = Asistencia::whereHas('matricula', function ($q) use ($selectedCycleId) {
                $q->where('id_ciclo', $selectedCycleId)->where('estado', 'VIGENTE');
            })->count();

            if ($totalAsistencias > 0) {
                $asistioOrTardanza = Asistencia::whereHas('matricula', function ($q) use ($selectedCycleId) {
                    $q->where('id_ciclo', $selectedCycleId)->where('estado', 'VIGENTE');
                })->whereIn('estado', ['ASISTIO', 'TARDANZA'])->count();

                $tasaAsistenciaPromedio = ($asistioOrTardanza / $totalAsistencias) * 100;
            }

            // Grades Average
            $promedioNotasGlobal = ResultadoExamen::whereHas('matricula', function ($q) use ($selectedCycleId) {
                $q->where('id_ciclo', $selectedCycleId)->where('estado', 'VIGENTE');
            })->avg('puntaje_total') ?? 0.0;

            // Finance/Revenue Rate
            $totalCosto = Matricula::where('id_ciclo', $selectedCycleId)
                ->where('estado', 'VIGENTE')
                ->sum('costo_total');

            $totalPagado = Pago::whereHas('cuota.comprobantePago.matricula', function ($q) use ($selectedCycleId) {
                $q->where('id_ciclo', $selectedCycleId)->where('estado', 'VIGENTE');
            })->sum('monto');

            if ($totalCosto > 0) {
                $tasaRecaudacion = ($totalPagado / $totalCosto) * 100;
            }
        }

        // Student List Search (for autocomplete)
        $q = $request->string('q')->trim()->toString();
        $studentList = [];
        if ($q !== '') {
            $studentList = Alumno::query()
                ->where('nombres', 'like', "%{$q}%")
                ->orWhere('apellidos', 'like', "%{$q}%")
                ->orWhere('dni', 'like', "%{$q}%")
                ->orWhere('codigo', 'like', "%{$q}%")
                ->limit(8)
                ->get()
                ->map(fn ($std) => [
                    'id_alumno' => $std->id_alumno,
                    'label' => "{$std->apellidos}, {$std->nombres} ({$std->dni})",
                ]);
        }

        // Student 360 profile load
        $consolidado = null;
        $selectedAlumnoId = $request->integer('alumno');
        if ($selectedAlumnoId) {
            try {
                $consolidado = $this->consolidadoAlumnoService->obtener($selectedAlumnoId);
            } catch (\Exception $e) {
                // If student not found
            }
        }

        return Inertia::render('dashboard', [
            'kpis' => [
                'total_matriculados' => $totalMatriculados,
                'tasa_asistencia' => $tasaAsistenciaPromedio,
                'promedio_notas' => floatval($promedioNotasGlobal),
                'tasa_recaudacion' => $tasaRecaudacion,
            ],
            'studentList' => $studentList,
            'consolidado' => $consolidado,
            'ciclos' => $ciclos,
            'alumnosPorArea' => $this->areaMetricsService->alumnosActivosPorArea(),
            'selectedCycleId' => $selectedCycleId,
            'filters' => [
                'q' => $q,
                'alumno' => $selectedAlumnoId ?: '',
            ],
        ]);
    }
}
