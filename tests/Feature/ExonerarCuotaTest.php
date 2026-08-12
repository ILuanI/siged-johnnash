<?php

use App\Enums\EstadoCuota;
use App\Models\AuditoriaCuota;
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

function crearCuotaExonerable(string $estado = 'PENDIENTE', int $monto = 500, ?int $saldo = null): array
{
    // Una cuota pagada o exonerada no deja saldo pendiente en el comprobante.
    $saldo ??= in_array($estado, ['PAGADA', 'EXONERADA']) ? 0 : $monto;

    $matricula = Matricula::factory()->create(['costo_total' => $monto]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => $monto,
        'saldo_pendiente' => $saldo,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'monto' => $monto,
        'fecha_vencimiento' => $estado === 'VENCIDA'
            ? now()->subDays(5)->toDateString()
            : now()->addDays(10)->toDateString(),
        'estado' => $estado,
    ]);

    return [$matricula, $comprobante, $cuota];
}

function usuarioExonerador(string $nombre): User
{
    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', $nombre)->value('id_rol'),
    ]);
}

test('un administrador exonerar una cuota pendiente indicando motivo', function () {
    $admin = usuarioExonerador('Administrador');
    [, $comprobante, $cuota] = crearCuotaExonerable();

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Beca por excelencia académica',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Exonerada)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0);
});

test('un administrador exonerar una cuota vencida indicando motivo', function () {
    $admin = usuarioExonerador('Administrador');
    [, $comprobante, $cuota] = crearCuotaExonerable('VENCIDA');

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Condonación por situación económica',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Exonerada)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0);
});

test('registra la auditoría de la exoneración con usuario, acción, motivo y fecha', function () {
    $admin = usuarioExonerador('Administrador');
    [, , $cuota] = crearCuotaExonerable();

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Beca deportiva',
        ])
        ->assertRedirect();

    expect(AuditoriaCuota::query()->count())->toBe(1);

    $auditoria = AuditoriaCuota::query()->first();

    expect($auditoria->cuota_id)->toBe($cuota->id_cuota)
        ->and($auditoria->usuario_id)->toBe($admin->id)
        ->and($auditoria->accion)->toBe('EXONERAR')
        ->and($auditoria->motivo)->toBe('Beca deportiva')
        ->and($auditoria->created_at)->not->toBeNull();
});

test('no exonerar una cuota ya pagada', function () {
    $admin = usuarioExonerador('Administrador');
    [, $comprobante, $cuota] = crearCuotaExonerable('PAGADA');

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Intento de exonerar una cuota pagada',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pagada)
        ->and(AuditoriaCuota::query()->count())->toBe(0)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0);
});

test('no exonerar una cuota que ya se encuentra exonerada', function () {
    $admin = usuarioExonerador('Administrador');
    [, $comprobante, $cuota] = crearCuotaExonerable('EXONERADA');

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Intento de exonerar una cuota ya exonerada',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Exonerada)
        ->and(AuditoriaCuota::query()->count())->toBe(0)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0);
});

test('rechaza exonerar una cuota sin motivo', function () {
    $admin = usuarioExonerador('Administrador');
    [, , $cuota] = crearCuotaExonerable();

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota))
        ->assertSessionHasErrors('motivo');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente)
        ->and(AuditoriaCuota::query()->count())->toBe(0);
});

test('rechaza exonerar una cuota con un motivo demasiado largo', function () {
    $admin = usuarioExonerador('Administrador');
    [, , $cuota] = crearCuotaExonerable();

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => str_repeat('a', 501),
        ])
        ->assertSessionHasErrors('motivo');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente)
        ->and(AuditoriaCuota::query()->count())->toBe(0);
});

test('no exonerar una cuota sin permiso de eliminar pagos', function () {
    $cajero = usuarioExonerador('Cajero');
    [, , $cuota] = crearCuotaExonerable();

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Intento sin permiso',
        ])
        ->assertForbidden();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pendiente)
        ->and(AuditoriaCuota::query()->count())->toBe(0);
});

test('exonerar una cuota con pagos parciales descuenta solo el saldo restante', function () {
    $admin = usuarioExonerador('Administrador');
    [, $comprobante, $cuota] = crearCuotaExonerable('PENDIENTE', 500, 300);

    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'monto' => 200,
        'estado' => 'PAGADO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.cuotas.exonerar', $cuota), [
            'motivo' => 'Exoneración del saldo restante',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Exonerada)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0);
});
