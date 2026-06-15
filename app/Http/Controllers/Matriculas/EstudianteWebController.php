<?php

namespace App\Http\Controllers\Matriculas;

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
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EstudianteWebController extends Controller
{
    public function __construct(
        private readonly ConsolidadoAlumnoService $consolidadoAlumnoService,
        private readonly AlumnoRegistroService $alumnoRegistroService,
    ) {}

    public function index(Request $request): Response
    {
        $busqueda = $request->string('q')->trim()->toString();

        $estudiantes = Alumno::query()
            ->when($busqueda !== '', function ($query) use ($busqueda): void {
                $query->where(function ($q) use ($busqueda): void {
                    $q->where('nombres', 'like', "%{$busqueda}%")
                        ->orWhere('apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('dni', 'like', "%{$busqueda}%")
                        ->orWhere('codigo', 'like', "%{$busqueda}%");
                });
            })
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->get(['id_alumno', 'codigo', 'nombres', 'apellidos', 'dni', 'estado', 'telefono']);

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
            'filters' => ['q' => $busqueda],
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
}
