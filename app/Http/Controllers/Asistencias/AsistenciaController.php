<?php

namespace App\Http\Controllers\Asistencias;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $busqueda = $request->input('busqueda');
        $periodo = $request->input('periodo', 'semana'); // dia, semana, mes, personalizado
        $fecha_inicio_req = $request->input('fecha_inicio');
        $fecha_fin_req = $request->input('fecha_fin');
        
        $id_area = $request->input('id_area');
        $id_carrera = $request->input('id_carrera');
        $id_ciclo = $request->input('id_ciclo');
        $id_curso = $request->input('id_curso');

        if ($periodo === 'personalizado' && $fecha_inicio_req && $fecha_fin_req) {
            $fechaInicio = \Carbon\Carbon::parse($fecha_inicio_req)->startOfDay();
            $fechaFin = \Carbon\Carbon::parse($fecha_fin_req)->endOfDay();
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

        $query = \App\Models\Alumno::query()
            ->with(['asistencias' => function ($q) use ($fechaInicio, $fechaFin, $id_curso) {
                $q->whereBetween('fecha', [$fechaInicio->format('Y-m-d'), $fechaFin->format('Y-m-d')]);
                if ($id_curso) {
                    $q->whereHas('asignacionDocente', function ($q2) use ($id_curso) {
                        $q2->where('id_curso', $id_curso);
                    });
                }
            }])
            ->whereHas('matriculaVigente', function ($q) use ($id_ciclo) {
                if ($id_ciclo) {
                    $q->where('id_ciclo', $id_ciclo);
                }
            });

        if ($id_area) {
            $query->whereHas('carrera', function ($q) use ($id_area) {
                $q->where('id_area', $id_area);
            });
        }

        if ($id_carrera) {
            $query->where('id_carrera', $id_carrera);
        }

        if ($busqueda) {
            $query->where(function ($q) use ($busqueda) {
                $q->where('dni', 'like', "%{$busqueda}%")
                  ->orWhere('nombres', 'like', "%{$busqueda}%")
                  ->orWhere('apellidos', 'like', "%{$busqueda}%");
            });
        }

        $alumnos = $query->paginate(20)->withQueryString();

        return \Inertia\Inertia::render('asistencias/index', [
            'alumnos' => $alumnos,
            'catalogos' => [
                'areas' => \App\Models\Area::orderBy('nombre')->get(),
                'carreras' => \App\Models\Carrera::orderBy('nombre')->get(),
                'ciclos' => \App\Models\Ciclo::orderBy('nombre')->get(),
                'cursos' => \App\Models\Curso::orderBy('nombre')->get(),
            ],
            'filtros' => [
                'busqueda' => $busqueda,
                'periodo' => $periodo,
                'fecha_inicio' => $fechaInicio->format('Y-m-d'),
                'fecha_fin' => $fechaFin->format('Y-m-d'),
                'id_area' => $id_area,
                'id_carrera' => $id_carrera,
                'id_ciclo' => $id_ciclo,
                'id_curso' => $id_curso,
            ],
        ]);
    }
}
