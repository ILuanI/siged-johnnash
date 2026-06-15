<?php

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use App\Models\Matricula;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('devuelve el consolidado del alumno con matrícula vigente', function () {
    $matricula = Matricula::factory()->create();
    $alumno = $matricula->alumno;
    $alumno->update(['estado' => EstadoAlumno::Matriculado]);

    $response = $this->getJson("/api/matriculas/estudiantes/{$alumno->id_alumno}/consolidado");

    $response
        ->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.perfil.id_alumno', $alumno->id_alumno)
        ->assertJsonPath('data.matricula_actual.id_matricula', $matricula->id_matricula)
        ->assertJsonPath('data.asistencia._meta.disponible', true)
        ->assertJsonPath('data.notas._meta.disponible', true)
        ->assertJsonPath('data.finanzas._meta.disponible', true);
});

test('devuelve 404 cuando el alumno no existe', function () {
    $response = $this->getJson('/api/matriculas/estudiantes/99999/consolidado');

    $response->assertNotFound();
});

test('devuelve consolidado sin matrícula cuando el alumno no está matriculado', function () {
    $alumno = Alumno::factory()->create();

    $response = $this->getJson("/api/matriculas/estudiantes/{$alumno->id_alumno}/consolidado");

    $response
        ->assertSuccessful()
        ->assertJsonPath('data.matricula_actual', null);
});
