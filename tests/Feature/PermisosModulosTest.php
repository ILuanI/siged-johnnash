<?php

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

test('cajero no puede acceder a notas sin permiso academico', function () {
    $cajero = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Cajero')->value('id_rol'),
    ]);

    $this->actingAs($cajero)
        ->get(route('notas.index'))
        ->assertForbidden();
});

test('cajero puede acceder a tesoreria con permiso pagos', function () {
    $this->withoutVite();

    $cajero = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Cajero')->value('id_rol'),
    ]);

    $this->actingAs($cajero)
        ->get(route('tesoreria.estado-cuenta.index'))
        ->assertOk();
});

test('docente no puede acceder a tesoreria', function () {
    $docente = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Docente')->value('id_rol'),
    ]);

    $this->actingAs($docente)
        ->get(route('tesoreria.estado-cuenta.index'))
        ->assertForbidden();
});

test('admin puede actualizar y desactivar un estudiante', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
    $alumno = Alumno::factory()->create([
        'nombres' => 'Ana',
        'apellidos' => 'Lopez',
        'dni' => '45678901',
        'estado' => EstadoAlumno::Activo,
    ]);

    $this->actingAs($admin)
        ->put(route('matriculas.estudiantes.update', $alumno), [
            'nombres' => 'Ana Maria',
            'apellidos' => 'Lopez Ruiz',
            'dni' => '45678901',
            'telefono' => '999888777',
            'estado' => EstadoAlumno::Activo->value,
        ])
        ->assertRedirect();

    expect($alumno->refresh()->nombres)->toBe('Ana Maria')
        ->and($alumno->telefono)->toBe('999888777');

    $this->actingAs($admin)
        ->patch(route('matriculas.estudiantes.desactivar', $alumno))
        ->assertRedirect(route('matriculas.estudiantes.index'));

    expect($alumno->refresh()->estado)->toBe(EstadoAlumno::Retirado);
});
