<?php

namespace App\Http\Controllers\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAlumnoRequest;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Carrera;
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
            ->get(['id_alumno', 'codigo', 'nombres', 'apellidos', 'dni', 'estado', 'correo', 'telefono']);

        $consolidado = null;
        $alumnoId = $request->integer('alumno') ?: null;

        if ($alumnoId) {
            $consolidado = $this->consolidadoAlumnoService->obtener($alumnoId);
        }

        return Inertia::render('matriculas/estudiantes/index', [
            'estudiantes' => $estudiantes,
            'consolidado' => $consolidado,
            'alumnoId' => $alumnoId,
            'filters' => ['q' => $busqueda],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('matriculas/estudiantes/create', [
            'carreras' => Carrera::query()->with('area')->orderBy('nombre')->get(),
            'areas' => Area::orderBy('nombre')->get(),
        ]);
    }

    public function store(StoreAlumnoRequest $request): RedirectResponse
    {
        $alumno = $this->alumnoRegistroService->registrar($request->validated());

        return redirect()
            ->route('matriculas.estudiantes.index', ['alumno' => $alumno->id_alumno])
            ->with('success', 'Estudiante registrado correctamente.');
    }

    public function storeCarrera(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:120', 'unique:carrera,nombre'],
            'id_area' => ['required', 'integer', 'exists:area,id_area'],
            'puntaje_min' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'puntaje_max' => ['nullable', 'numeric', 'min:0', 'max:20'],
        ], [
            'nombre.required' => 'El nombre de la carrera es obligatorio.',
            'nombre.unique' => 'Esta carrera ya existe.',
            'id_area.required' => 'El área es obligatoria.',
            'id_area.exists' => 'El área seleccionada no es válida.',
            'puntaje_min.numeric' => 'El puntaje mínimo debe ser un número.',
            'puntaje_min.min' => 'El puntaje mínimo no puede ser menor a 0.',
            'puntaje_min.max' => 'El puntaje mínimo no puede ser mayor a 20.',
            'puntaje_max.numeric' => 'El puntaje máximo debe ser un número.',
            'puntaje_max.min' => 'El puntaje máximo no puede ser menor a 0.',
            'puntaje_max.max' => 'El puntaje máximo no puede ser mayor a 20.',
        ]);

        Carrera::create($validated);

        return redirect()->back()->with('success', 'Carrera añadida correctamente.');
    }
}
