<?php

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registra un alumno nuevo con código autogenerado', function () {
    $response = $this->postJson('/api/matriculas/estudiantes', [
        'nombres' => 'Juan Carlos',
        'apellidos' => 'Pérez López',
        'dni' => '72345678',
        'correo' => 'juan@example.com',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.nombres', 'Juan Carlos')
        ->assertJsonPath('data.estado', EstadoAlumno::Activo->value);

    expect($response->json('data.codigo'))->toStartWith('JOB-');
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
