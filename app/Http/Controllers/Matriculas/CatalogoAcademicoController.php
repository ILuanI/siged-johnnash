<?php

namespace App\Http\Controllers\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAreaRequest;
use App\Http\Requests\Matriculas\StoreCarreraRequest;
use App\Http\Requests\Matriculas\StoreCursoRequest;
use App\Http\Requests\Matriculas\UpdateAreaRequest;
use App\Http\Requests\Matriculas\UpdateCarreraRequest;
use App\Http\Requests\Matriculas\UpdateCursoRequest;
use App\Http\Resources\Matriculas\AreaResource;
use App\Http\Resources\Matriculas\CarreraResource;
use App\Http\Resources\Matriculas\CursoResource;
use App\Models\Area;
use App\Models\Carrera;
use App\Models\Curso;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CatalogoAcademicoController extends Controller
{
    public function index(): Response
    {
        $areas = Area::query()
            ->with(['carreras' => fn ($query) => $query->orderBy('nombre')])
            ->withCount('carreras')
            ->orderBy('codigo')
            ->get();

        $cursos = Curso::query()
            ->orderBy('nombre')
            ->get();

        return Inertia::render('matriculas/catalogo', [
            'areas' => AreaResource::collection($areas)->resolve(),
            'carreras' => CarreraResource::collection(
                Carrera::query()->with('area')->orderBy('nombre')->get()
            )->resolve(),
            'cursos' => CursoResource::collection($cursos)->resolve(),
        ]);
    }

    public function storeArea(StoreAreaRequest $request): RedirectResponse
    {
        Area::query()->create($request->validated());

        return redirect()->back()->with('success', 'Area academica creada correctamente.');
    }

    public function updateArea(UpdateAreaRequest $request, Area $area): RedirectResponse
    {
        $area->update($request->validated());

        return redirect()->back()->with('success', 'Area academica actualizada correctamente.');
    }

    public function storeCarrera(StoreCarreraRequest $request): RedirectResponse
    {
        Carrera::query()->create($request->validated());

        return redirect()->back()->with('success', 'Carrera creada correctamente.');
    }

    public function updateCarrera(UpdateCarreraRequest $request, Carrera $carrera): RedirectResponse
    {
        $carrera->update($request->validated());

        return redirect()->back()->with('success', 'Carrera actualizada correctamente.');
    }

    public function storeCurso(StoreCursoRequest $request): RedirectResponse
    {
        Curso::query()->create($request->validated());

        return redirect()->back()->with('success', 'Curso creado correctamente.');
    }

    public function updateCurso(UpdateCursoRequest $request, Curso $curso): RedirectResponse
    {
        $curso->update($request->validated());

        return redirect()->back()->with('success', 'Curso actualizado correctamente.');
    }

    public function destroyArea(Area $area): RedirectResponse
    {
        if ($area->carreras()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar el área porque tiene carreras asociadas.');
        }

        $area->delete();

        return redirect()->back()->with('success', 'Área académica eliminada correctamente.');
    }

    public function destroyCarrera(Carrera $carrera): RedirectResponse
    {
        if ($carrera->alumnos()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar la carrera porque tiene alumnos registrados.');
        }

        $carrera->delete();

        return redirect()->back()->with('success', 'Carrera eliminada correctamente.');
    }

    public function destroyCurso(Curso $curso): RedirectResponse
    {
        if ($curso->asignaciones()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar el curso porque tiene asignaciones de docentes.');
        }

        $curso->delete();

        return redirect()->back()->with('success', 'Curso eliminado correctamente.');
    }
}
