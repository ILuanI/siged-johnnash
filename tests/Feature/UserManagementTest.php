<?php

use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

function defaultRolId(): int
{
    return Rol::query()->where('nombre', 'Administrador')->value('id_rol');
}

test('guests are redirected from usuarios index', function () {
    $this->get(route('usuarios.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view usuarios index', function () {
    $this->withoutVite();

    $rol = Rol::query()->where('nombre', 'Administrador')->firstOrFail();
    $admin = User::factory()->create(['id_rol' => $rol->id_rol]);
    User::factory()->create(['name' => 'Coordinador Académico', 'id_rol' => $rol->id_rol]);

    $this->actingAs($admin)
        ->get(route('usuarios.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('usuarios/index')
            ->has('usuarios.data', 2)
            ->has('roles', 5));
});

test('authenticated users can create usuarios', function () {
    $rolAdmin = Rol::query()->where('nombre', 'Administrador')->firstOrFail();
    $admin = User::factory()->create(['id_rol' => $rolAdmin->id_rol]);
    $rol = Rol::query()->where('nombre', 'Cajero')->firstOrFail();

    $this->actingAs($admin)
        ->post(route('usuarios.store'), [
            'name' => 'Caja Principal',
            'email' => 'caja@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'estado' => 'ACTIVO',
            'id_rol' => $rol->id_rol,
        ])
        ->assertRedirect();

    $usuario = User::where('email', 'caja@example.com')->firstOrFail();

    expect($usuario->name)->toBe('Caja Principal')
        ->and($usuario->estado)->toBe('ACTIVO')
        ->and($usuario->id_rol)->toBe($rol->id_rol)
        ->and(Hash::check('password', $usuario->password))->toBeTrue();
});

test('authenticated users can update usuarios without changing password', function () {
    $admin = User::factory()->create();
    $nuevoRol = Rol::query()->where('nombre', 'Director')->firstOrFail();
    $usuario = User::factory()->create([
        'name' => 'Tutor',
        'email' => 'tutor@example.com',
        'password' => 'original-password',
    ]);

    $this->actingAs($admin)
        ->put(route('usuarios.update', $usuario), [
            'name' => 'Tutor General',
            'email' => 'tutor.general@example.com',
            'password' => null,
            'password_confirmation' => null,
            'estado' => 'INACTIVO',
            'id_rol' => $nuevoRol->id_rol,
        ])
        ->assertRedirect();

    $usuario->refresh();

    expect($usuario->name)->toBe('Tutor General')
        ->and($usuario->email)->toBe('tutor.general@example.com')
        ->and($usuario->estado)->toBe('INACTIVO')
        ->and($usuario->id_rol)->toBe($nuevoRol->id_rol)
        ->and(Hash::check('original-password', $usuario->password))->toBeTrue();
});

test('authenticated users cannot deactivate themselves', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->put(route('usuarios.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'password' => null,
            'password_confirmation' => null,
            'estado' => 'INACTIVO',
            'id_rol' => $admin->id_rol,
        ])
        ->assertSessionHasErrors('estado');

    expect($admin->refresh()->estado)->toBe('ACTIVO');
});

test('authenticated users can delete usuarios but not themselves', function () {
    $admin = User::factory()->create();
    $usuario = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('usuarios.destroy', $usuario))
        ->assertRedirect();

    $this->assertModelMissing($usuario);

    $this->actingAs($admin)
        ->delete(route('usuarios.destroy', $admin))
        ->assertSessionHasErrors('usuario');

    $this->assertModelExists($admin);
});

test('inactive users cannot authenticate', function () {
    $usuario = User::factory()->inactive()->create();

    $this->post(route('login.store'), [
        'email' => $usuario->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
});
