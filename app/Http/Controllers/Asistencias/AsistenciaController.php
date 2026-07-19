<?php

namespace App\Http\Controllers\Asistencias;

use App\Http\Controllers\Controller;
use App\Http\Requests\Asistencias\UpsertAsistenciaRequest;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\AsignacionDocente;
use App\Models\Carrera;
use App\Models\Ciclo;
use App\Models\Curso;
use App\Services\Asistencias\AsistenciaBarcodeService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AsistenciaController extends Controller
{
    public function __construct(
        private readonly AsistenciaBarcodeService $asistenciaBarcodeService,
    ) {}

    public function index(Request $request): Response
    {
        $busqueda = $request->input('busqueda');
        $periodo = $request->input('periodo', 'semana');
        $fechaInicioReq = $request->input('fecha_inicio');
        $fechaFinReq = $request->input('fecha_fin');

        $idArea = $request->input('id_area');
        $idCarrera = $request->input('id_carrera');
        $idCiclo = $request->input('id_ciclo');
        $idCurso = $request->input('id_curso');

        if ($periodo === 'personalizado' && $fechaInicioReq && $fechaFinReq) {
            $fechaInicio = Carbon::parse($fechaInicioReq)->startOfDay();
            $fechaFin = Carbon::parse($fechaFinReq)->endOfDay();
        } else {
            $fechaInicio = now()->startOfWeek();
            $fechaFin = now()->endOfWeek();

            if ($periodo === 'dia') {
                $fechaInicio = now()->startOfDay();
                $fechaFin = now()->endOfDay();
            } elseif ($periodo === 'mes') {
                $fechaInicio = now()->startOfMonth();
                $fechaFin = now()->endOfMonth();
            }
        }

        $query = Alumno::query()
            ->with(['asistencias' => function ($q) use ($fechaInicio, $fechaFin, $idCurso) {
                $q->whereBetween('fecha', [$fechaInicio->format('Y-m-d'), $fechaFin->format('Y-m-d')]);
                if ($idCurso) {
                    $q->whereHas('asignacionDocente', function ($q2) use ($idCurso) {
                        $q2->where('id_curso', $idCurso);
                    });
                }
            }])
            ->whereHas('matriculaVigente', function ($q) use ($idCiclo) {
                if ($idCiclo) {
                    $q->where('id_ciclo', $idCiclo);
                }
            });

        if ($idArea) {
            $query->whereHas('carrera', function ($q) use ($idArea) {
                $q->where('id_area', $idArea);
            });
        }

        if ($idCarrera) {
            $query->where('id_carrera', $idCarrera);
        }

        if ($busqueda) {
            $query->where(function ($q) use ($busqueda) {
                $q->where('dni', 'like', "%{$busqueda}%")
                    ->orWhere('nombres', 'like', "%{$busqueda}%")
                    ->orWhere('apellidos', 'like', "%{$busqueda}%");
            });
        }

        $alumnos = $query->paginate(20)->withQueryString();

        $asignaciones = AsignacionDocente::query()
            ->with(['curso:id_curso,nombre', 'docente:id,nombres,apellidos', 'ciclo:id_ciclo,nombre'])
            ->latest('id_asignacion')
            ->limit(50)
            ->get()
            ->map(fn (AsignacionDocente $asignacion) => [
                'id_asignacion' => $asignacion->id_asignacion,
                'etiqueta' => trim(sprintf(
                    '%s — %s (%s)',
                    $asignacion->curso?->nombre ?? 'Curso',
                    trim(($asignacion->docente?->nombres ?? '').' '.($asignacion->docente?->apellidos ?? '')),
                    $asignacion->ciclo?->nombre ?? 'Sin ciclo',
                )),
            ]);

        return Inertia::render('asistencias/index', [
            'alumnos' => $alumnos,
            'catalogos' => [
                'areas' => Area::orderBy('nombre')->get(),
                'carreras' => Carrera::orderBy('nombre')->get(),
                'ciclos' => Ciclo::orderBy('nombre')->get(),
                'cursos' => Curso::orderBy('nombre')->get(),
                'asignaciones' => $asignaciones,
            ],
            'filtros' => [
                'busqueda' => $busqueda,
                'periodo' => $periodo,
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => $fechaFin->format('Y-m-d'),
                'id_area' => $idArea,
                'id_carrera' => $idCarrera,
                'id_ciclo' => $idCiclo,
                'id_curso' => $idCurso,
            ],
        ]);
    }

    public function upsert(UpsertAsistenciaRequest $request): RedirectResponse
    {
        $asistencia = $this->asistenciaBarcodeService->upsertManual($request->validated());

        return redirect()
            ->back()
            ->with('success', "Asistencia actualizada: {$asistencia->estado}.");
    }
}
