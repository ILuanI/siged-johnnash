<?php

use App\Models\Alumno;
use App\Models\Cuota;
use App\Models\Matricula;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('modulo matriculas: puede crear un alumno y su matricula', function () {
    $alumno = Alumno::factory()->create();
    $matricula = Matricula::factory()->create(['id_alumno' => $alumno->id_alumno]);

    expect($alumno->id_alumno)->toBeNumeric()
        ->and($matricula->id_alumno)->toBe($alumno->id_alumno);
});

test('modulo tesoreria: puede generar cuotas', function () {
    $cuota = Cuota::factory()->create(['monto' => 500.00]);

    expect($cuota->monto)->toEqual(500.00)
        ->and($cuota->estado->value)->toBeIn(['PENDIENTE', 'PAGADA', 'VENCIDA']);
});
