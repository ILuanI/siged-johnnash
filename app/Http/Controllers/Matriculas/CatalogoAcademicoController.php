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
}
