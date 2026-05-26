<?php

namespace App\Http\Controllers\Matriculas;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAlumnoRequest;
use App\Http\Requests\Matriculas\StoreMatriculaRequest;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Carrera;
use App\Models\Ciclo;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use App\Services\Matriculas\AlumnoRegistroService;
use App\Services\Matriculas\ConsolidadoAlumnoService;
use App\Services\Matriculas\MatriculaFormalizacionService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DemoController extends Controller
{
    public function __construct(
        private readonly AlumnoRegistroService $alumnoRegistroService,
        private readonly MatriculaFormalizacionService $matriculaFormalizacionService,
        private readonly ConsolidadoAlumnoService $consolidadoAlumnoService,
    ) {}

    public function index(): View
    {
        return view('matriculas.demo.index', [
            'alumnos' => Alumno::query()->orderByDesc('id_alumno')->limit(10)->get(),
        ]);
    }

    public function createEstudiante(): View
    {
        return view('matriculas.demo.estudiante', [
            'carreras' => Carrera::query()->with('area')->orderBy('nombre')->get(),
        ]);
    }

    public function storeEstudiante(StoreAlumnoRequest $request): RedirectResponse
    {
        try {
            $alumno = $this->alumnoRegistroService->registrar($request->validated());

            return redirect()
                ->route('demo.matriculas.estudiante')
                ->with('success', "Alumno registrado: {$alumno->codigo} — {$alumno->nombres} {$alumno->apellidos}");
        } catch (BusinessRuleException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }
    }

    public function createMatricula(): View
    {
        return view('matriculas.demo.matricula', [
            'alumnos' => Alumno::query()->orderBy('apellidos')->orderBy('nombres')->get(),
            'periodos' => PeriodoAcademico::query()->where('estado', 'ABIERTO')->orderBy('nombre')->get(),
            'ciclos' => Ciclo::query()->with('periodo')->orderBy('nombre')->get(),
            'turnos' => Turno::query()->orderBy('nombre')->get(),
            'aulas' => Aula::query()->orderBy('nombre')->get(),
        ]);
    }

    public function storeMatricula(StoreMatriculaRequest $request): RedirectResponse
    {
        try {
            $matricula = $this->matriculaFormalizacionService->formalizar($request->validated());

            return redirect()
                ->route('demo.matriculas.consolidado', $matricula->id_alumno)
                ->with('success', 'Matrícula formalizada correctamente.');
        } catch (BusinessRuleException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }
    }

    public function consolidado(Request $request, ?int $id = null): View
    {
        $alumnos = Alumno::query()->orderBy('apellidos')->orderBy('nombres')->get();
        $idAlumno = $id ?? $request->integer('id_alumno');
        $consolidado = null;
        $error = null;

        if ($idAlumno) {
            try {
                $consolidado = $this->consolidadoAlumnoService->obtener($idAlumno);
            } catch (ModelNotFoundException) {
                $error = 'No se encontró el alumno indicado.';
            }
        }

        return view('matriculas.demo.consolidado', compact('alumnos', 'idAlumno', 'consolidado', 'error'));
    }
}
