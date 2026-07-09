<?php

use App\Enums\TipoPagoMatricula;
use App\Models\Matricula;
use App\Services\Tesoreria\CuotaScheduleService;
use App\Services\Tesoreria\PlanPagoMatriculaService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('genera cuotas para una matrícula al crédito', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Credito,
        'costo_total' => 1000,
        'fecha_matricula' => '2026-06-15',
    ]);

    $comprobante = app(PlanPagoMatriculaService::class)->generar($matricula, [
        'numero_cuotas' => 3,
        'fecha_primera_cuota' => '2026-07-01',
        'dias_entre_cuotas' => 15,
    ]);

    $cuotas = $comprobante->cuotas()->orderBy('numero_cuota')->get();

    expect($cuotas)->toHaveCount(3)
        ->and((float) $cuotas[0]->monto)->toBe(333.33)
        ->and((float) $cuotas[2]->monto)->toBe(333.34)
        ->and($cuotas[1]->fecha_vencimiento->toDateString())->toBe('2026-07-16');
});

test('aplaza una cuota vencida y la devuelve a pendiente', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Contado,
        'costo_total' => 500,
    ]);
    $comprobante = app(PlanPagoMatriculaService::class)->generar($matricula, [
        'fecha_primera_cuota' => '2026-06-01',
    ]);
    $cuota = $comprobante->cuotas()->first();
    $cuota->update(['estado' => 'VENCIDA']);

    $cuota = app(CuotaScheduleService::class)->aplazar($cuota, 10);

    expect($cuota->estado->value)->toBe('PENDIENTE')
        ->and($cuota->fecha_vencimiento->toDateString())->toBe('2026-06-11');
});
