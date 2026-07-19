<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRolRequest;
use App\Http\Requests\UpdateRolRequest;
use App\Models\Rol;
use App\Support\ModulosSistema;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RolController extends Controller
{
    public function index(): Response
    {
        $search = request('search');

        $query = Rol::query()
            ->select(['id_rol', 'nombre', 'descripcion', 'created_at'])
            ->with('permisos')
            ->withCount('usuarios')
            ->orderBy('nombre');

        if ($search) {
            $query->where('nombre', 'like', "%{$search}%")
                ->orWhere('descripcion', 'like', "%{$search}%");
        }

        return Inertia::render('roles/index', [
            'roles' => $query->paginate(10)
                ->through(fn (Rol $rol) => [
                    'id_rol' => $rol->id_rol,
                    'nombre' => $rol->nombre,
                    'descripcion' => $rol->descripcion,
                    'usuarios_count' => $rol->usuarios_count,
                    'created_at' => $rol->created_at,
                    'permisos' => $rol->permisosPorModulo(),
                ])
                ->withQueryString(),
            'modulos' => ModulosSistema::labels(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreRolRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $rol = Rol::create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        $rol->sincronizarPermisos($validated['permisos']);

        return redirect()->back()->with('success', 'Rol creado exitosamente.');
    }

    public function update(UpdateRolRequest $request, Rol $rol): RedirectResponse
    {
        $validated = $request->validated();

        $rol->update([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
        ]);

        $rol->sincronizarPermisos($validated['permisos']);

        return redirect()->back()->with('success', 'Rol actualizado exitosamente.');
    }

    public function destroy(Rol $rol): RedirectResponse
    {
        if ($rol->usuarios()->exists()) {
            return redirect()->back()->withErrors([
                'rol' => 'No puedes eliminar un rol asignado a usuarios.',
            ]);
        }

        $rol->delete();

        return redirect()->back()->with('success', 'Rol eliminado exitosamente.');
    }
}
