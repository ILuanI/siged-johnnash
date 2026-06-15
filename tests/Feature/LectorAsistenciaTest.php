<?php

use App\Models\Alumno;
use App\Models\Matricula;
use App\Services\Asistencias\AsistenciaBarcodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registra asistencia para alumno interno con matrícula vigente', function () {
    $matricula = Matricula::factory()->create();
    $alumno = $matricula->alumno;

    $resultado = app(AsistenciaBarcodeService::class)->registrar([
        'dni' => $alumno->dni,
    ]);

    expect($resultado['registrada'])->toBeTrue()
        ->and($resultado['tipo_alumno'])->toBe('INTERNO');

    $this->assertDatabaseHas('asistencia', [
        'tipo_alumno' => 'INTERNO',
        'dni' => $alumno->dni,
        'id_matricula' => $matricula->id_matricula,
        'estado' => 'ASISTIO',
    ]);
});

test('registra asistencia para alumno por convenio si el DNI no pertenece a alumno interno', function () {
    $resultado = app(AsistenciaBarcodeService::class)->registrar([
        'dni' => '76543210',
    ]);

    expect($resultado['registrada'])->toBeTrue()
        ->and($resultado['tipo_alumno'])->toBe('CONVENIO');

    $this->assertDatabaseHas('asistencia', [
        'tipo_alumno' => 'CONVENIO',
        'dni' => '76543210',
        'estado' => 'ASISTIO',
    ]);
});

test('evita duplicar asistencia del mismo DNI en el mismo día', function () {
    $alumno = Alumno::factory()->create();
    Matricula::factory()->create(['id_alumno' => $alumno->id_alumno]);

    $service = app(AsistenciaBarcodeService::class);
    $service->registrar(['dni' => $alumno->dni]);
    $resultado = $service->registrar(['dni' => $alumno->dni]);

    expect($resultado['registrada'])->toBeFalse();
});
