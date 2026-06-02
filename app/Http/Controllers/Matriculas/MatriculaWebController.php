<?php

namespace App\Http\Controllers\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreMatriculaRequest;
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
        return Inertia::render('matriculas/nueva', [
            'alumnos' => Alumno::query()->orderBy('apellidos')->orderBy('nombres')->get([
                'id_alumno', 'codigo', 'nombres', 'apellidos', 'estado',
            ]),
            'periodos' => PeriodoAcademico::query()->where('estado', 'ABIERTO')->orderBy('nombre')->get(),
            'ciclos' => Ciclo::query()->with('periodo')->orderBy('nombre')->get(),
            'turnos' => Turno::query()->orderBy('nombre')->get(),
            'aulas' => Aula::query()->orderBy('nombre')->get(),
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
