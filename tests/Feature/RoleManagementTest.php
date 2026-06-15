<?php

use App\Models\Rol;
use App\Models\User;
use App\Support\ModulosSistema;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

function permisosSoloDashboard(): array
{
    return ModulosSistema::normalizar([
        'dashboard' => ['puede_ver' => true],
    ]);
}

test('guests are redirected from roles index', function () {
    $this->get(route('roles.index'))
        ->assertRedirect(route('login'));
});

test('home redirects guests to login', function () {
    $this->get(route('home'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view roles index', function () {
    $this->withoutVite();

    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->get(route('roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('roles/index')
            ->has('roles.data', 5)
            ->has('modulos', count(ModulosSistema::keys())));
});

test('authenticated users can create roles with permissions', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('roles.store'), [
            'nombre' => 'Coordinador',
            'descripcion' => 'Coordina actividades académicas',
            'permisos' => ModulosSistema::normalizar([
                'dashboard' => ['puede_ver' => true],
                'docentes' => ['puede_ver' => true, 'puede_editar' => true],
            ]),
        ])
        ->assertRedirect();

    $rol = Rol::where('nombre', 'Coordinador')->firstOrFail();

    expect($rol->descripcion)->toBe('Coordina actividades académicas')
        ->and($rol->permisos()->where('modulo', 'dashboard')->first()->puede_ver)->toBeTrue()
        ->and($rol->permisos()->where('modulo', 'docentes')->first()->puede_editar)->toBeTrue();
});

test('authenticated users can update roles with permissions', function () {
    $admin = User::factory()->create();
    $rol = Rol::query()->where('nombre', 'Tutor')->firstOrFail();

    $this->actingAs($admin)
        ->put(route('roles.update', $rol), [
            'nombre' => 'Tutor Académico',
            'descripcion' => 'Seguimiento personalizado',
            'permisos' => ModulosSistema::normalizar([
                'dashboard' => ['puede_ver' => true],
                'estudiantes' => ['puede_ver' => true, 'puede_editar' => true, 'puede_eliminar' => true],
            ]),
        ])
        ->assertRedirect();

    $rol->refresh();

    expect($rol->nombre)->toBe('Tutor Académico')
        ->and($rol->permisos()->where('modulo', 'estudiantes')->first()->puede_eliminar)->toBeTrue();
});

test('authenticated users cannot delete roles assigned to users', function () {
    $rol = Rol::query()->where('nombre', 'Administrador')->firstOrFail();
    $admin = User::factory()->create(['id_rol' => $rol->id_rol]);

    $this->actingAs($admin)
        ->delete(route('roles.destroy', $rol))
        ->assertSessionHasErrors('rol');

    $this->assertModelExists($rol);
});

test('authenticated users can delete unused roles', function () {
    $admin = User::factory()->create();
    $rol = Rol::factory()->create([
        'nombre' => 'Temporal',
        'descripcion' => 'Rol de prueba',
    ]);
    $rol->sincronizarPermisos(permisosSoloDashboard());

    $this->actingAs($admin)
        ->delete(route('roles.destroy', $rol))
        ->assertRedirect();

    $this->assertModelMissing($rol);
});

test('docente role cannot access usuarios module', function () {
    $rol = Rol::query()->where('nombre', 'Docente')->firstOrFail();
    $docente = User::factory()->create(['id_rol' => $rol->id_rol]);

    $this->actingAs($docente)
        ->get(route('usuarios.index'))
        ->assertForbidden();
});

test('administrador role has full access to usuarios', function () {
    $rol = Rol::query()->where('nombre', 'Administrador')->firstOrFail();
    $admin = User::factory()->create(['id_rol' => $rol->id_rol]);

    $this->withoutVite();

    $this->actingAs($admin)
        ->get(route('usuarios.index'))
        ->assertOk();
});
