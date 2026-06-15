<?php

use App\Enums\EstadoMatricula;
use App\Enums\TipoPagoMatricula;
use App\Models\Asistencia;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use App\Models\Examen;
use App\Models\Matricula;
use App\Models\ResultadoExamen;
use App\Services\Ia\DesercionRiskService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('calculates high dropout risk from attendance grades and overdue payments', function () {
    $matricula = Matricula::factory()->create([
        'estado' => EstadoMatricula::Vigente,
        'tipo_pago' => TipoPagoMatricula::Credito,
    ]);

    foreach (range(1, 10) as $day) {
        Asistencia::query()->create([
            'tipo_alumno' => 'INTERNO',
            'dni' => $matricula->alumno->dni,
            'id_matricula' => $matricula->id_matricula,
            'id_asignacion' => null,
            'fecha' => today()->subDays($day),
            'estado' => 'FALTO',
            'registrado_en' => now(),
        ]);
    }

    $examen = Examen::query()->create([
        'id_ciclo' => $matricula->id_ciclo,
        'tipo' => 'SIMULACRO',
        'numero' => 1,
        'fecha' => today()->subDay(),
    ]);

    ResultadoExamen::query()->create([
        'id_examen' => $examen->id_examen,
        'id_matricula' => $matricula->id_matricula,
        'puntaje_aptitud' => 2,
        'puntaje_conocimiento' => 3,
        'puntaje_total' => 5,
    ]);

    $comprobante = ComprobantePago::query()->create([
        'id_matricula' => $matricula->id_matricula,
        'numero' => 'TST-0001',
        'tipo' => 'BOLETA',
        'fecha_emision' => today()->subMonth(),
        'costo_total' => 1200,
        'saldo_pendiente' => 1200,
    ]);

    foreach ([1, 2] as $numeroCuota) {
        Cuota::query()->create([
            'id_comprobante' => $comprobante->id_comprobante,
            'numero_cuota' => $numeroCuota,
            'monto' => 600,
            'fecha_vencimiento' => today()->subDays($numeroCuota),
            'estado' => 'PENDIENTE',
        ]);
    }

    $prediccion = app(DesercionRiskService::class)->calcularParaMatricula($matricula);

    expect($prediccion->riesgo_pct)->toBeGreaterThan(75)
        ->and($prediccion->nivel_riesgo)->toBe('ALTO')
        ->and($prediccion->tasa_asistencia)->toBe(0.0)
        ->and($prediccion->cuotas_vencidas)->toBe(2);
});
