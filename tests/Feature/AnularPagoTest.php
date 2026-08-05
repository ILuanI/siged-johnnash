<?php

use App\Enums\EstadoCuota;
use App\Models\AuditoriaPago;
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

test('anula un pago y recalcula el saldo de la cuota y el comprobante', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);

    $pago1 = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 300,
        'estado' => 'PAGADO',
    ]);
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 200,
        'estado' => 'PAGADO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago1), [
            'motivo' => 'Pago duplicado por error del cajero',
        ])
        ->assertRedirect();

    expect($pago1->refresh()->estado)->toBe('ANULADO')
        ->and($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(300.0);
});

test('crea un registro de auditoría al anular un pago', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);
    $pago = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'PAGADO',
        'user_id' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago), [
            'motivo' => 'Pago duplicado por error del cajero',
        ])
        ->assertRedirect();

    expect(AuditoriaPago::query()->count())->toBe(1);

    $auditoria = AuditoriaPago::query()->first();

    expect($auditoria->pago_id)->toBe($pago->id_pago)
        ->and($auditoria->usuario_id)->toBe($admin->id)
        ->and($auditoria->accion)->toBe('ANULACION')
        ->and($auditoria->motivo)->toBe('Pago duplicado por error del cajero')
        ->and($auditoria->created_at)->not->toBeNull();
});

test('mantiene la cuota pagada si el saldo restante cubre el monto', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);

    $pago1 = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 300,
        'estado' => 'PAGADO',
    ]);
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 200,
        'estado' => 'PAGADO',
    ]);

    // Anular el pago menor: queda 200 pagado, la cuota pasa a pendiente
    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago1), [
            'motivo' => 'Pago duplicado',
        ])
        ->assertRedirect();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente);

    // Anular el segundo pago: queda 0 pagado, la cuota sigue pendiente
    $pago2 = $cuota->pagos()->where('estado', 'PAGADO')->first();
    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago2), [
            'motivo' => 'Pago duplicado',
        ])
        ->assertRedirect();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(500.0);
});

test('marca la cuota como vencida al anular un pago si la fecha de vencimiento ya pasó', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->subDays(5)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);

    $pago = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'PAGADO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago), [
            'motivo' => 'Pago duplicado',
        ])
        ->assertRedirect();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Vencida);
});

test('no anula un pago sin permiso de eliminar', function () {
    $cajero = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Cajero')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'estado' => EstadoCuota::Pagada,
    ]);
    $pago = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'PAGADO',
    ]);

    $this->actingAs($cajero)
        ->post(route('tesoreria.pagos.anular', $pago))
        ->assertForbidden();

    expect($pago->refresh()->estado)->toBe('PAGADO')
        ->and(AuditoriaPago::query()->count())->toBe(0);
});

test('no anula un pago que ya se encuentra anulado', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);
    $pago = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'ANULADO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago), [
            'motivo' => 'Intento de anular un pago ya anulado',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($pago->refresh()->estado)->toBe('ANULADO')
        ->and(AuditoriaPago::query()->count())->toBe(0);
});

test('rechaza anular un pago sin motivo', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);
    $pago = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'PAGADO',
        'user_id' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago))
        ->assertSessionHasErrors('motivo');

    expect($pago->refresh()->estado)->toBe('PAGADO')
        ->and(AuditoriaPago::query()->count())->toBe(0);
});

test('rechaza anular un pago con un motivo demasiado largo', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $matricula = Matricula::factory()->create(['costo_total' => 500]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => 500,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pagada,
    ]);
    $pago = Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 500,
        'estado' => 'PAGADO',
        'user_id' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pagos.anular', $pago), [
            'motivo' => str_repeat('a', 501),
        ])
        ->assertSessionHasErrors('motivo');

    expect($pago->refresh()->estado)->toBe('PAGADO')
        ->and(AuditoriaPago::query()->count())->toBe(0);
});
