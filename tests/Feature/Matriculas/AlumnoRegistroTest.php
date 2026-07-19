<?php

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    Sanctum::actingAs(User::factory()->create());
});

test('registra un alumno nuevo', function () {
    $response = $this->postJson('/api/matriculas/estudiantes', [
        'nombres' => 'Juan Carlos',
        'apellidos' => 'Pérez López',
        'dni' => '72345678',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.nombres', 'Juan Carlos')
        ->assertJsonPath('data.estado', EstadoAlumno::Activo->value);

    $this->assertDatabaseHas('alumno', ['dni' => '72345678']);
});

test('rechaza el registro cuando el dni ya existe', function () {
    Alumno::factory()->create(['dni' => '12345678']);

    $response = $this->postJson('/api/matriculas/estudiantes', [
        'nombres' => 'María',
        'apellidos' => 'García',
        'dni' => '12345678',
    ]);

    $response->assertUnprocessable();
});

test('rechaza el registro sin nombres obligatorios', function () {
    $response = $this->postJson('/api/matriculas/estudiantes', [
        'apellidos' => 'Sin nombre',
    ]);

    $response->assertUnprocessable();
});

test('rechaza peticiones api sin autenticacion', function () {
    $this->app['auth']->forgetGuards();

    $response = $this->withHeaders([
        'Authorization' => '',
        'Accept' => 'application/json',
    ])->postJson('/api/matriculas/estudiantes', [
        'nombres' => 'Juan',
        'apellidos' => 'Perez',
        'dni' => '87654321',
    ]);

    expect($response->status())->toBeIn([401, 403]);
});
