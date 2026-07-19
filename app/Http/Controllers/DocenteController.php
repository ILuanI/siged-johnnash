<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocenteRequest;
use App\Http\Requests\UpdateDocenteRequest;
use App\Models\Docente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Docente::query();

        if ($request->filled('search')) {
            $query->where('dni', 'like', '%'.$request->search.'%');
        }

        $sort = $request->input('sort', 'asc');
        $query->orderBy('apellidos', $sort)->orderBy('nombres', $sort);

        return Inertia::render('docentes/index', [
            'docentes' => $query->paginate(10)->withQueryString(),
            'filters' => (object) $request->only(['search', 'sort']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDocenteRequest $request)
    {
        Docente::create($request->validated());

        return redirect()->back()->with('success', 'Docente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Docente $docente)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Docente $docente)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDocenteRequest $request, Docente $docente)
    {
        $docente->update($request->validated());

        return redirect()->back()->with('success', 'Docente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Docente $docente)
    {
        if ($docente->asignaciones()->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'No se puede eliminar el docente porque tiene cursos asignados actualmente.',
            ]);
        }

        try {
            $docente->delete();

            return redirect()->back()->with('success', 'Docente eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'Ocurrió un error al intentar eliminar el docente.',
            ]);
        }
    }
}
