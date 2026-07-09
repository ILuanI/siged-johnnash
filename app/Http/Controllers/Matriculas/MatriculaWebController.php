<?php

namespace App\Http\Controllers\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreMatriculaRequest;
use App\Http\Resources\Matriculas\AlumnoResource;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use App\Services\Matriculas\MatriculaFormalizacionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MatriculaWebController extends Controller
{
    public function __construct(
        private readonly MatriculaFormalizacionService $matriculaFormalizacionService,
    ) {}

    public function create(): Response
    {
        $alumnos = Alumno::query()
            ->with('apoderado')
            ->where('estado', 'ACTIVO')
            ->doesntHave('matriculaVigente')
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->get(['id_alumno', 'nombres', 'apellidos', 'dni', 'estado', 'telefono']);

        return Inertia::render('matriculas/nueva', [
            'alumnos' => array_values(AlumnoResource::collection($alumnos)->resolve(request())),
            'periodos' => PeriodoAcademico::query()->where('estado', 'ABIERTO')->orderBy('nombre')->get()
                ->map(fn (PeriodoAcademico $periodo): array => [
                    'id_periodo' => $periodo->id_periodo,
                    'nombre' => $periodo->nombre,
                    'anio' => $periodo->anio,
                ])
                ->values()
                ->all(),
            'ciclos' => Ciclo::query()->with('periodo')->orderBy('nombre')->get()
                ->map(fn (Ciclo $ciclo): array => [
                    'id_ciclo' => $ciclo->id_ciclo,
                    'nombre' => $ciclo->nombre,
                    'costo_base' => $ciclo->costo_base,
                    'id_periodo' => $ciclo->id_periodo,
                    'periodo' => $ciclo->periodo ? ['nombre' => $ciclo->periodo->nombre] : null,
                ])
                ->values()
                ->all(),
            'turnos' => Turno::query()->orderBy('nombre')->get()
                ->map(fn (Turno $turno): array => [
                    'id_turno' => $turno->id_turno,
                    'nombre' => $turno->nombre,
                ])
                ->values()
                ->all(),
            'aulas' => Aula::query()->orderBy('nombre')->get()
                ->map(fn (Aula $aula): array => [
                    'id_aula' => $aula->id_aula,
                    'nombre' => $aula->nombre,
                    'capacidad' => $aula->capacidad,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreMatriculaRequest $request): RedirectResponse
    {
        $matricula = $this->matriculaFormalizacionService->formalizar($request->validated());

        return redirect()
            ->route('matriculas.estudiantes.index', ['alumno' => $matricula->id_alumno])
            ->with('success', 'Matrícula formalizada correctamente.');
    }
}
