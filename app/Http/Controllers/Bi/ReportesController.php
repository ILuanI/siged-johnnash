<?php

namespace App\Http\Controllers\Bi;

use App\Exports\AlumnosReportExport;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Area;
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

        // Count attendance states and average notes
        $query->withCount([
            'asistencias as total_asistencias' => fn ($q) => $q->where('asistencia.estado', 'ASISTIO'),
            'asistencias as total_tardanzas' => fn ($q) => $q->where('asistencia.estado', 'TARDANZA'),
            'asistencias as total_faltas' => fn ($q) => $q->where('asistencia.estado', 'FALTO'),
            'asistencias as total_clases',
        ]);

        $query->withAvg('resultadosExamen as promedio_notas', 'puntaje_total');

        // Having filters for tardanzas / faltas counts
        if ($request->filled('tardanzas_count')) {
            $query->having('total_tardanzas', '>=', $request->integer('tardanzas_count'));
        }

        if ($request->filled('faltas_count')) {
            $query->having('total_faltas', '>=', $request->integer('faltas_count'));
        }

        return $query;
    }

    private function mapAlumnosForReport($alumnosCollection)
    {
        return $alumnosCollection->map(function ($alumno) {
            $tasaAsistencia = null;
            if ($alumno->total_clases > 0) {
                // Asistencia rate = (asistio + tardanza) / total
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
                'total_asistencias' => $alumno->total_asistencias,
                'total_tardanzas' => $alumno->total_tardanzas,
                'total_faltas' => $alumno->total_faltas,
                'total_clases' => $alumno->total_clases,
                'tasa_asistencia' => $tasaAsistencia,
                'promedio_notas' => $alumno->promedio_notas !== null ? floatval($alumno->promedio_notas) : null,
            ];
        });
    }

    public function index(Request $request): Response
    {
        $query = $this->queryAlumnos($request);

        // Paginate using custom collection mapping
        $paginator = $query->paginate(15);
        $mappedItems = $this->mapAlumnosForReport(collect($paginator->items()));

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
            'filters' => [
                'q' => $request->string('q')->trim()->toString(),
                'id_turno' => $request->string('id_turno')->toString(),
                'id_area' => $request->string('id_area')->toString(),
                'tardanzas_count' => $request->string('tardanzas_count')->toString(),
                'faltas_count' => $request->string('faltas_count')->toString(),
            ],
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $alumnos = $this->queryAlumnos($request)->get();
        $mapped = $this->mapAlumnosForReport($alumnos);

        return Excel::download(new AlumnosReportExport($mapped), 'reporte_alumnos.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $alumnos = $this->queryAlumnos($request)->get();
        $mapped = $this->mapAlumnosForReport($alumnos);

        $pdf = Pdf::loadView('reports.alumnos_pdf', [
            'alumnos' => $mapped,
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

        return $pdf->download('reporte_alumnos.pdf');
    }
}
