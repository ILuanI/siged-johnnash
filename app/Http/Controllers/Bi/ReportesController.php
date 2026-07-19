<?php

namespace App\Http\Controllers\Bi;

use App\Exports\AlumnosReportExport;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Curso;
use App\Models\Turno;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportesController extends Controller
{
    private function queryAlumnos(Request $request)
    {
        $query = Alumno::query()
            ->with([
                'carrera.area',
                'matriculaVigente.turno',
            ])
            ->whereHas('matriculaVigente')
            ->select('alumno.*');

        // Text Search
        if ($request->filled('q')) {
            $search = $request->string('q')->trim()->toString();
            $query->where(function ($q) use ($search) {
                $q->where('alumno.nombres', 'like', "%{$search}%")
                    ->orWhere('alumno.apellidos', 'like', "%{$search}%")
                    ->orWhere('alumno.dni', 'like', "{$search}%");
            });
        }

        // Filter by Turno
        if ($request->filled('id_turno')) {
            $query->whereHas('matriculaVigente', function ($q) use ($request) {
                $q->where('id_turno', $request->integer('id_turno'));
            });
        }

        // Filter by Area
        if ($request->filled('id_area')) {
            $query->whereHas('carrera', function ($q) use ($request) {
                $q->where('id_area', $request->integer('id_area'));
            });
        }

        $fechaInicio = $request->input('fecha_inicio');
        $fechaFin = $request->input('fecha_fin');
        $tipoReporte = $request->input('tipo_reporte', 'general');

        // Count attendance states
        $query->withCount([
            'asistencias as total_asistencias' => function ($q) use ($fechaInicio, $fechaFin, $request) {
                $q->where('asistencia.estado', 'ASISTIO');
                if ($fechaInicio) {
                    $q->whereDate('fecha', '>=', $fechaInicio);
                }
                if ($fechaFin) {
                    $q->whereDate('fecha', '<=', $fechaFin);
                }
                if ($request->filled('id_curso')) {
                    $q->whereHas('asignacionDocente', fn ($ad) => $ad->where('id_curso', $request->integer('id_curso')));
                }
            },
            'asistencias as total_tardanzas' => function ($q) use ($fechaInicio, $fechaFin, $request) {
                $q->where('asistencia.estado', 'TARDANZA');
                if ($fechaInicio) {
                    $q->whereDate('fecha', '>=', $fechaInicio);
                }
                if ($fechaFin) {
                    $q->whereDate('fecha', '<=', $fechaFin);
                }
                if ($request->filled('id_curso')) {
                    $q->whereHas('asignacionDocente', fn ($ad) => $ad->where('id_curso', $request->integer('id_curso')));
                }
            },
            'asistencias as total_faltas' => function ($q) use ($fechaInicio, $fechaFin, $request) {
                $q->where('asistencia.estado', 'FALTO');
                if ($fechaInicio) {
                    $q->whereDate('fecha', '>=', $fechaInicio);
                }
                if ($fechaFin) {
                    $q->whereDate('fecha', '<=', $fechaFin);
                }
                if ($request->filled('id_curso')) {
                    $q->whereHas('asignacionDocente', fn ($ad) => $ad->where('id_curso', $request->integer('id_curso')));
                }
            },
            'asistencias as total_clases' => function ($q) use ($fechaInicio, $fechaFin, $request) {
                if ($fechaInicio) {
                    $q->whereDate('fecha', '>=', $fechaInicio);
                }
                if ($fechaFin) {
                    $q->whereDate('fecha', '<=', $fechaFin);
                }
                if ($request->filled('id_curso')) {
                    $q->whereHas('asignacionDocente', fn ($ad) => $ad->where('id_curso', $request->integer('id_curso')));
                }
            },
        ]);

        $query->withAvg(['resultadosExamen as promedio_notas' => function ($q) use ($fechaInicio, $fechaFin) {
            if ($fechaInicio || $fechaFin) {
                $q->whereHas('examen', function ($eq) use ($fechaInicio, $fechaFin) {
                    if ($fechaInicio) {
                        $eq->whereDate('fecha', '>=', $fechaInicio);
                    }
                    if ($fechaFin) {
                        $eq->whereDate('fecha', '<=', $fechaFin);
                    }
                });
            }
        }], 'puntaje_total');

        // Having filters
        if ($request->filled('tardanzas_count')) {
            $query->having('total_tardanzas', '>=', $request->integer('tardanzas_count'));
        }

        if ($request->filled('faltas_count')) {
            $query->having('total_faltas', '>=', $request->integer('faltas_count'));
        }

        if ($request->filled('nota_min')) {
            $query->having('promedio_notas', '>=', $request->float('nota_min'));
        }

        if ($request->filled('nota_max')) {
            $query->having('promedio_notas', '<=', $request->float('nota_max'));
        }

        return $query;
    }

    private function mapAlumnosForReport($alumnosCollection, $tipoReporte = 'general')
    {
        return $alumnosCollection->map(function ($alumno) {
            $tasaAsistencia = null;
            if ($alumno->total_clases > 0) {
                $tasaAsistencia = (($alumno->total_asistencias + $alumno->total_tardanzas) / $alumno->total_clases) * 100;
            }

            return [
                'id_alumno' => $alumno->id_alumno,
                'dni' => $alumno->dni,
                'nombres' => $alumno->nombres,
                'apellidos' => $alumno->apellidos,
                'nombre_completo' => "{$alumno->apellidos}, {$alumno->nombres}",
                'carrera' => $alumno->carrera?->nombre ?? 'N/A',
                'area' => $alumno->carrera?->area?->nombre ?? 'N/A',
                'turno' => $alumno->matriculaVigente?->turno?->nombre ?? 'N/A',
                'total_asistencias' => $alumno->total_asistencias ?? 0,
                'total_tardanzas' => $alumno->total_tardanzas ?? 0,
                'total_faltas' => $alumno->total_faltas ?? 0,
                'total_clases' => $alumno->total_clases ?? 0,
                'tasa_asistencia' => $tasaAsistencia,
                'promedio_notas' => $alumno->promedio_notas !== null ? floatval($alumno->promedio_notas) : null,
            ];
        });
    }

    public function index(Request $request): Response
    {
        $query = $this->queryAlumnos($request);
        $tipoReporte = $request->input('tipo_reporte', 'general');

        $paginator = $query->paginate(15);
        $mappedItems = $this->mapAlumnosForReport(collect($paginator->items()), $tipoReporte);

        $estudiantesPaginated = [
            'data' => $mappedItems,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];

        return Inertia::render('reportes/index', [
            'estudiantes' => $estudiantesPaginated,
            'turnos' => Turno::all(),
            'areas' => Area::all(),
            'cursos' => Curso::all(),
            'filters' => [
                'tipo_reporte' => $tipoReporte,
                'q' => $request->string('q')->trim()->toString(),
                'id_turno' => $request->string('id_turno')->toString(),
                'id_area' => $request->string('id_area')->toString(),
                'id_curso' => $request->string('id_curso')->toString(),
                'tardanzas_count' => $request->string('tardanzas_count')->toString(),
                'faltas_count' => $request->string('faltas_count')->toString(),
                'nota_min' => $request->string('nota_min')->toString(),
                'nota_max' => $request->string('nota_max')->toString(),
                'fecha_inicio' => $request->string('fecha_inicio')->toString(),
                'fecha_fin' => $request->string('fecha_fin')->toString(),
            ],
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $tipoReporte = $request->input('tipo_reporte', 'general');
        $alumnos = $this->queryAlumnos($request)->get();
        $mapped = $this->mapAlumnosForReport($alumnos, $tipoReporte);

        return Excel::download(new AlumnosReportExport($mapped), 'reporte_'.$tipoReporte.'.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $tipoReporte = $request->input('tipo_reporte', 'general');
        $alumnos = $this->queryAlumnos($request)->get();
        $mapped = $this->mapAlumnosForReport($alumnos, $tipoReporte);

        $pdf = Pdf::loadView('reports.alumnos_pdf', [
            'alumnos' => $mapped,
            'tipo_reporte' => $tipoReporte,
            'filters' => [
                'q' => $request->string('q')->trim()->toString(),
                'turno' => $request->filled('id_turno') ? Turno::find($request->integer('id_turno'))?->nombre : 'Todos',
                'area' => $request->filled('id_area') ? Area::find($request->integer('id_area'))?->nombre : 'Todas',
                'tardanzas_count' => $request->string('tardanzas_count')->toString(),
                'faltas_count' => $request->string('faltas_count')->toString(),
            ],
            'fecha' => now()->format('d/m/Y H:i'),
        ]);

        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('reporte_'.$tipoReporte.'.pdf');
    }
}
