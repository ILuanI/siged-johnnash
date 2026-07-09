<?php

namespace App\Http\Controllers\Matriculas;

use App\Enums\EstadoCuota;
use App\Enums\EstadoMatricula;
use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAlumnoRequest;
use App\Http\Requests\Matriculas\UpdateAlumnoCarreraRequest;
use App\Http\Resources\Matriculas\AlumnoResource;
use App\Http\Resources\Matriculas\AreaResource;
use App\Http\Resources\Matriculas\CarreraResource;
use App\Http\Resources\Matriculas\ColegioProcedenciaResource;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Carrera;
use App\Models\ColegioProcedencia;
use App\Services\Matriculas\AlumnoRegistroService;
use App\Services\Matriculas\ConsolidadoAlumnoService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class EstudianteWebController extends Controller
{
    public function __construct(
        private readonly ConsolidadoAlumnoService $consolidadoAlumnoService,
        private readonly AlumnoRegistroService $alumnoRegistroService,
    ) {}

    public function index(Request $request): Response
    {
        $busqueda = $request->string('q')->trim()->toString();
        $filtroEstado = $request->string('filtro')->toString();
        $sort = $request->input('sort', 'asc');

        $estudiantes = Alumno::query()
            ->when($busqueda !== '', function ($query) use ($busqueda): void {
                $query->where(function ($q) use ($busqueda): void {
                    $q->where('nombres', 'like', "%{$busqueda}%")
                        ->orWhere('apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('dni', 'like', "%{$busqueda}%");
                });
            })
            ->when($filtroEstado === 'matriculados', function (Builder $query): void {
                $query->whereHas('matriculas', fn ($q) => $q->where('estado', EstadoMatricula::Vigente));
            })
            ->when($filtroEstado === 'activos', function (Builder $query): void {
                $query->where('estado', 'ACTIVO');
            })
            ->when($filtroEstado === 'al_dia', function (Builder $query): void {
                $query->whereHas('matriculas', fn ($q) => $q->where('estado', EstadoMatricula::Vigente))
                    ->whereDoesntHave('matriculas.comprobantePago.cuotas', function ($q) {
                        $q->where('estado', EstadoCuota::Vencida)
                            ->orWhere(function ($sq) {
                                $sq->where('estado', EstadoCuota::Pendiente)
                                    ->where('fecha_vencimiento', '<', now()->startOfDay());
                            });
                    });
            })
            ->when($filtroEstado === 'vencidos', function (Builder $query): void {
                $query->whereHas('matriculas', fn ($q) => $q->where('estado', EstadoMatricula::Vigente))
                    ->whereHas('matriculas.comprobantePago.cuotas', function ($q) {
                        $q->where('estado', EstadoCuota::Vencida)
                            ->orWhere(function ($sq) {
                                $sq->where('estado', EstadoCuota::Pendiente)
                                    ->where('fecha_vencimiento', '<', now()->startOfDay());
                            });
                    });
            })
            ->orderBy('apellidos', $sort)
            ->orderBy('nombres', $sort)
            ->with(['matriculas' => function ($q) {
                $q->latest('fecha_matricula')->with(['comprobantePago.cuotas']);
            }])
            ->get(['id_alumno', 'nombres', 'apellidos', 'dni', 'estado', 'telefono']);

        $consolidado = null;
        $alumnoId = $request->integer('alumno') ?: null;

        if ($alumnoId) {
            $consolidado = $this->consolidadoAlumnoService->obtener($alumnoId);
        }

        return Inertia::render('matriculas/estudiantes/index', [
            'estudiantes' => AlumnoResource::collection($estudiantes)->resolve(),
            'consolidado' => $consolidado,
            'alumnoId' => $alumnoId,
            'carreras' => CarreraResource::collection(Carrera::query()->with('area')->orderBy('nombre')->get())->resolve(),
            'areas' => AreaResource::collection(Area::query()->orderBy('codigo')->get())->resolve(),
            'colegios' => ColegioProcedenciaResource::collection(ColegioProcedencia::query()->orderBy('nombre')->get())->resolve(),
            'filters' => (object) $request->only(['q', 'filtro', 'sort']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('matriculas/estudiantes/create', [
            'carreras' => CarreraResource::collection(Carrera::query()->with('area')->orderBy('nombre')->get())->resolve(),
            'areas' => AreaResource::collection(Area::query()->orderBy('codigo')->get())->resolve(),
            'colegios' => ColegioProcedenciaResource::collection(ColegioProcedencia::query()->orderBy('nombre')->get())->resolve(),
        ]);
    }

    public function store(StoreAlumnoRequest $request): RedirectResponse
    {
        $alumno = $this->alumnoRegistroService->registrar($request->validated());

        return redirect()
            ->route('matriculas.estudiantes.index', ['alumno' => $alumno->id_alumno])
            ->with('success', 'Estudiante registrado correctamente.');
    }

    public function updateCarrera(UpdateAlumnoCarreraRequest $request, Alumno $alumno): RedirectResponse
    {
        $alumno->update($request->validated());

        return redirect()->back()->with('success', 'Carrera del alumno actualizada correctamente.');
    }

    public function downloadPdf(Alumno $alumno)
    {
        $consolidado = $this->consolidadoAlumnoService->obtener($alumno->id_alumno);
        
        $pdf = Pdf::loadView('reports.perfil360_pdf', compact('consolidado'));
        
        return $pdf->download("perfil_360_{$alumno->dni}.pdf");
    }
}
