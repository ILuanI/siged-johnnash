<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $search = request('search');

        $query = User::query()
            ->select(['id', 'name', 'email', 'estado', 'id_rol', 'created_at'])
            ->with('rol:id_rol,nombre')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return Inertia::render('usuarios/index', [
            'usuarios' => $query->paginate(10)->withQueryString(),
            'roles' => Rol::query()
                ->select(['id_rol', 'nombre'])
                ->orderBy('nombre')
                ->get(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): void
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return redirect()->back()->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user): void
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): void
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->user()?->is($user) && $validated['estado'] === 'INACTIVO') {
            return redirect()->back()->withErrors([
                'estado' => 'No puedes desactivar tu propio usuario.',
            ]);
        }

        if (blank($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if (request()->user()?->is($user)) {
            return redirect()->back()->withErrors([
                'usuario' => 'No puedes eliminar tu propio usuario.',
            ]);
        }

        if ($user->rol?->nombre === 'Administrador') {
            return redirect()->back()->withErrors([
                'usuario' => 'No puedes eliminar a un usuario con el rol de Administrador.',
            ]);
        }

        $user->delete();

        return redirect()->back()->with('success', 'Usuario eliminado exitosamente.');
    }
}
