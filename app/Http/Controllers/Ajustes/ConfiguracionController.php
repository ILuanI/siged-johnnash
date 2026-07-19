<?php

namespace App\Http\Controllers\Ajustes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ajustes\AulaRequest;
use App\Http\Requests\Ajustes\ColegioRequest;
use App\Http\Requests\Ajustes\PeriodoRequest;
use App\Http\Requests\Ajustes\TurnoRequest;
use App\Http\Resources\Ajustes\AulaResource;
use App\Http\Resources\Ajustes\ColegioResource;
use App\Http\Resources\Ajustes\PeriodoResource;
use App\Http\Resources\Ajustes\TurnoResource;
use App\Models\Aula;
use App\Models\ColegioProcedencia;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ajustes/index', [
            'aulas' => AulaResource::collection(
                Aula::query()->withCount('matriculas')->orderBy('nombre')->get()
            )->resolve(),
            'turnos' => TurnoResource::collection(
                Turno::query()->withCount('matriculas')->orderBy('nombre')->get()
            )->resolve(),
            'periodos' => PeriodoResource::collection(
                PeriodoAcademico::query()->withCount(['ciclos', 'matriculas'])->orderByDesc('anio')->orderBy('nombre')->get()
            )->resolve(),
            'colegios' => ColegioResource::collection(
                ColegioProcedencia::query()->withCount('alumnos')->orderBy('nombre')->get()
            )->resolve(),
        ]);
    }

    // ---------------------------------------------------------------- Aulas
    public function storeAula(AulaRequest $request): RedirectResponse
    {
        Aula::query()->create($request->validated());

        return back()->with('success', 'Aula creada correctamente.');
    }

    public function updateAula(AulaRequest $request, Aula $aula): RedirectResponse
    {
        $aula->update($request->validated());

        return back()->with('success', 'Aula actualizada correctamente.');
    }

    public function destroyAula(Aula $aula): RedirectResponse
    {
        if ($aula->matriculas()->exists() || $aula->asignaciones()->exists()) {
            return back()->with('error', 'No se puede eliminar: el aula tiene matrículas o asignaciones asociadas.');
        }

        $aula->delete();

        return back()->with('success', 'Aula eliminada correctamente.');
    }

    // --------------------------------------------------------------- Turnos
    public function storeTurno(TurnoRequest $request): RedirectResponse
    {
        Turno::query()->create($request->validated());

        return back()->with('success', 'Turno creado correctamente.');
    }

    public function updateTurno(TurnoRequest $request, Turno $turno): RedirectResponse
    {
        $turno->update($request->validated());

        return back()->with('success', 'Turno actualizado correctamente.');
    }

    public function destroyTurno(Turno $turno): RedirectResponse
    {
        if ($turno->matriculas()->exists()) {
            return back()->with('error', 'No se puede eliminar: el turno tiene matrículas asociadas.');
        }

        $turno->delete();

        return back()->with('success', 'Turno eliminado correctamente.');
    }

    // ------------------------------------------------------------- Periodos
    public function storePeriodo(PeriodoRequest $request): RedirectResponse
    {
        PeriodoAcademico::query()->create($request->validated());

        return back()->with('success', 'Periodo académico creado correctamente.');
    }

    public function updatePeriodo(PeriodoRequest $request, PeriodoAcademico $periodo): RedirectResponse
    {
        $periodo->update($request->validated());

        return back()->with('success', 'Periodo académico actualizado correctamente.');
    }

    public function destroyPeriodo(PeriodoAcademico $periodo): RedirectResponse
    {
        if ($periodo->ciclos()->exists() || $periodo->matriculas()->exists()) {
            return back()->with('error', 'No se puede eliminar: el periodo tiene ciclos o matrículas asociadas.');
        }

        $periodo->delete();

        return back()->with('success', 'Periodo académico eliminado correctamente.');
    }

    // ------------------------------------------------------------- Colegios
    public function storeColegio(ColegioRequest $request): RedirectResponse
    {
        ColegioProcedencia::query()->create($request->validated());

        return back()->with('success', 'Colegio de procedencia creado correctamente.');
    }

    public function updateColegio(ColegioRequest $request, ColegioProcedencia $colegio): RedirectResponse
    {
        $colegio->update($request->validated());

        return back()->with('success', 'Colegio de procedencia actualizado correctamente.');
    }

    public function destroyColegio(ColegioProcedencia $colegio): RedirectResponse
    {
        if ($colegio->alumnos()->exists()) {
            return back()->with('error', 'No se puede eliminar: el colegio tiene alumnos asociados.');
        }

        $colegio->delete();

        return back()->with('success', 'Colegio de procedencia eliminado correctamente.');
    }
}
