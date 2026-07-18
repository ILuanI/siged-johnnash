<?php

use App\Enums\ConceptoPago;
use App\Enums\TipoPagoMatricula;
use App\Models\Matricula;
use App\Services\Tesoreria\PagoExtraordinarioService;
use App\Services\Tesoreria\PlanPagoMatriculaService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('genera comprobante de matricula con concepto', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Contado,
        'costo_total' => 630,
        'fecha_matricula' => '2026-06-15',
    ]);

    $comprobante = app(PlanPagoMatriculaService::class)->generar(
        matricula: $matricula,
        concepto: ConceptoPago::Matricula,
        costo: 500,
        numCuotas: 1,
        fechaPrimeraCuota: '2026-07-01',
        diasEntreCuotas: 30,
    );

    expect($comprobante->concepto)->toBe(ConceptoPago::Matricula)
        ->and((float) $comprobante->costo_total)->toBe(500.0)
        ->and($comprobante->cuotas)->toHaveCount(1)
        ->and($comprobante->numero)->toMatch('/^MAT-/');
});

test('genera comprobante de simulacro con concepto', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Contado,
        'costo_total' => 630,
    ]);

    $comprobante = app(PlanPagoMatriculaService::class)->generar(
        matricula: $matricula,
        concepto: ConceptoPago::Simulacro,
        costo: 100,
        numCuotas: 1,
    );

    expect($comprobante->concepto)->toBe(ConceptoPago::Simulacro)
        ->and((float) $comprobante->costo_total)->toBe(100.0)
        ->and($comprobante->numero)->toMatch('/^SIM-/');
});

test('carnet siempre genera una sola cuota', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Contado,
        'costo_total' => 630,
    ]);

    $comprobante = app(PlanPagoMatriculaService::class)->generar(
        matricula: $matricula,
        concepto: ConceptoPago::Carnet,
        costo: 30,
        numCuotas: 1,
    );

    expect($comprobante->concepto)->toBe(ConceptoPago::Carnet)
        ->and((float) $comprobante->costo_total)->toBe(30.0)
        ->and($comprobante->cuotas)->toHaveCount(1)
        ->and($comprobante->numero)->toMatch('/^CAR-/');
});

test('genera cuotas al credito por concepto', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Credito,
        'costo_total' => 600,
    ]);

    $comprobante = app(PlanPagoMatriculaService::class)->generar(
        matricula: $matricula,
        concepto: ConceptoPago::Matricula,
        costo: 500,
        numCuotas: 3,
        fechaPrimeraCuota: '2026-07-01',
        diasEntreCuotas: 30,
    );

    $cuotas = $comprobante->cuotas()->orderBy('numero_cuota')->get();

    expect($cuotas)->toHaveCount(3)
        ->and((float) $cuotas[0]->monto)->toBe(166.66)
        ->and((float) $cuotas[2]->monto)->toBe(166.68)
        ->and($cuotas[1]->fecha_vencimiento->toDateString())->toBe('2026-07-31');
});

test('una matricula puede tener multiples comprobantes por concepto', function () {
    $matricula = Matricula::factory()->create([
        'tipo_pago' => TipoPagoMatricula::Contado,
        'costo_total' => 630,
    ]);

    $service = app(PlanPagoMatriculaService::class);

    $compMat = $service->generar($matricula, ConceptoPago::Matricula, 500, 1);
    $compSim = $service->generar($matricula, ConceptoPago::Simulacro, 100, 1);
    $compCar = $service->generar($matricula, ConceptoPago::Carnet, 30, 1);

    $comprobantes = $matricula->comprobantesPago()->get();

    expect($comprobantes)->toHaveCount(3)
        ->and($comprobantes->pluck('concepto')->map(fn ($c) => $c->value)->sort()->values()->toArray())
        ->toBe(['CARNET', 'MATRICULA', 'SIMULACRO']);
});

test('comprobantePago() scoped devuelve solo el de matricula', function () {
    $matricula = Matricula::factory()->create(['costo_total' => 630]);
    $service = app(PlanPagoMatriculaService::class);

    $service->generar($matricula, ConceptoPago::Simulacro, 100, 1);
    $service->generar($matricula, ConceptoPago::Matricula, 500, 1);

    $compMat = $matricula->comprobantePago;

    expect($compMat)->not->toBeNull()
        ->and($compMat->concepto->value)->toBe('MATRICULA');

    $all = $matricula->comprobantesPago;
    expect($all)->toHaveCount(2);
});

test('genera comprobante extraordinario con descripcion', function () {
    $matricula = Matricula::factory()->create(['costo_total' => 500]);

    $service = app(PagoExtraordinarioService::class);
    $comprobante = $service->registrar(
        matricula: $matricula,
        monto: 25.50,
        descripcion: 'Examen de Conocimiento - Matemática',
        numCuotas: 1,
    );

    expect($comprobante->concepto)->toBe(ConceptoPago::Extraordinario)
        ->and($comprobante->descripcion)->toBe('Examen de Conocimiento - Matemática')
        ->and((float) $comprobante->costo_total)->toBe(25.50)
        ->and($comprobante->numero)->toMatch('/^EXT-/');
});

test('comprobante es idempotente por concepto', function () {
    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $service = app(PlanPagoMatriculaService::class);

    $primero = $service->generar($matricula, ConceptoPago::Matricula, 500, 1);
    $segundo = $service->generar($matricula, ConceptoPago::Matricula, 500, 1);

    expect($primero->id_comprobante)->toBe($segundo->id_comprobante);
});
