<?php

use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use App\Models\Matricula;
use App\Models\Pago;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

test('un pago parcial no marca la cuota como pagada', function () {
    $cajero = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Cajero')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 500,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pendiente,
    ]);

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.pagar', $cuota), [
            'monto' => 300,
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertRedirect();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(200.0);
});

test('los pagos anulados no se cuentan en el total pagado', function () {
    $cajero = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Cajero')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 500,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pendiente,
    ]);

    // Un pago previo que fue anulado no debe contar para el total
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'ANULADO',
    ]);

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.pagar', $cuota), [
            'monto' => 500,
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertRedirect();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pagada)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0);
});

test('un usuario sin permiso de pagos no puede registrar un pago', function () {
    $docente = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Docente')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 500,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pendiente,
    ]);

    $this->actingAs($docente)
        ->post(route('tesoreria.cuotas.pagar', $cuota), [
            'monto' => 500,
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertForbidden();

    expect($cuota->pagos()->count())->toBe(0);
});
