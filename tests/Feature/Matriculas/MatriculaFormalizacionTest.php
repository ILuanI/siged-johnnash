<?php

use App\Enums\EstadoAlumno;
use App\Enums\EstadoCiclo;
use App\Enums\EstadoMatricula;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('formaliza una matrícula y cambia el estado del alumno a matriculado', function () {
    $periodo = PeriodoAcademico::factory()->create();
    $ciclo = Ciclo::factory()->create([
        'id_periodo' => $periodo->id_periodo,
        'estado' => EstadoCiclo::Abierto,
        'costo_base' => 1500,
    ]);
    $alumno = Alumno::factory()->create(['estado' => EstadoAlumno::Activo]);
    $turno = Turno::factory()->create();
    $aula = Aula::factory()->create();

    $response = $this->postJson('/api/matriculas', [
        'id_alumno' => $alumno->id_alumno,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_periodo' => $periodo->id_periodo,
        'id_turno' => $turno->id_turno,
        'id_aula' => $aula->id_aula,
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.estado', EstadoMatricula::Vigente->value)
        ->assertJsonPath('data.ciclo.nombre', $ciclo->nombre);

    $alumno->refresh();
    expect($alumno->estado)->toBe(EstadoAlumno::Matriculado);
    $this->assertDatabaseHas('matricula', [
        'id_alumno' => $alumno->id_alumno,
        'id_ciclo' => $ciclo->id_ciclo,
    ]);
    $this->assertDatabaseHas('comprobante_pago', [
        'id_matricula' => $response->json('data.id_matricula'),
        'saldo_pendiente' => '1500',
    ]);
    $this->assertDatabaseHas('cuota', [
        'numero_cuota' => 1,
        'monto' => '1500',
        'estado' => 'PENDIENTE',
    ]);
});

test('rechaza matrícula duplicada en el mismo ciclo', function () {
    $periodo = PeriodoAcademico::factory()->create();
    $ciclo = Ciclo::factory()->create(['id_periodo' => $periodo->id_periodo]);
    $alumno = Alumno::factory()->create();
    $turno = Turno::factory()->create();
    $aula = Aula::factory()->create();

    Matricula::factory()->create([
        'id_alumno' => $alumno->id_alumno,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_periodo' => $periodo->id_periodo,
        'id_turno' => $turno->id_turno,
        'id_aula' => $aula->id_aula,
    ]);

    $response = $this->postJson('/api/matriculas', [
        'id_alumno' => $alumno->id_alumno,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_periodo' => $periodo->id_periodo,
        'id_turno' => $turno->id_turno,
        'id_aula' => $aula->id_aula,
    ]);

    $response->assertBadRequest();
});

test('rechaza matrícula cuando el ciclo no está abierto', function () {
    $periodo = PeriodoAcademico::factory()->create();
    $ciclo = Ciclo::factory()->create([
        'id_periodo' => $periodo->id_periodo,
        'estado' => EstadoCiclo::Cerrado,
    ]);
    $alumno = Alumno::factory()->create();

    $response = $this->postJson('/api/matriculas', [
        'id_alumno' => $alumno->id_alumno,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_periodo' => $periodo->id_periodo,
        'id_turno' => Turno::factory()->create()->id_turno,
        'id_aula' => Aula::factory()->create()->id_aula,
    ]);

    $response->assertBadRequest();
});
