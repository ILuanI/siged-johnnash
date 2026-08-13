<?php

use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Configuracion;
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

function crearCuotaPendiente(int $monto = 500, int $saldo = 500): array
{
    $matricula = Matricula::factory()->create(['costo_total' => $monto]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => $monto,
        'saldo_pendiente' => $saldo,
    ]);
    $cuota = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'numero_cuota' => 1,
        'monto' => $monto,
        'fecha_vencimiento' => now()->addDays(10)->toDateString(),
        'estado' => EstadoCuota::Pendiente,
    ]);

    return [$matricula, $comprobante, $cuota];
}

function usuarioConRol(string $nombre): User
{
    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', $nombre)->value('id_rol'),
    ]);
}

test('pagar registra el pago y actualiza el saldo del comprobante', function () {
    $cajero = usuarioConRol('Cajero');
    [, $comprobante, $cuota] = crearCuotaPendiente();

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.pagar', $cuota), [
            'monto' => 500,
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertRedirect();

    expect($cuota->refresh()->estado)->toBe(EstadoCuota::Pagada)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0)
        ->and($cuota->pagos()->count())->toBe(1);
});

test('pagar registra el pago con fecha y hora exacta (datetime)', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.pagar', $cuota), [
            'monto' => 500,
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertRedirect();

    $pago = $cuota->pagos()->latest('id_pago')->first();

    expect($pago->fecha_pago->toDateString())->toBe(now()->toDateString())
        ->and($pago->fecha_pago->format('H:i:s'))->not->toBe('00:00:00');
});

test('pagar no registra pagos sin permiso de pagos', function () {
    $docente = usuarioConRol('Docente');
    [, , $cuota] = crearCuotaPendiente();

    $this->actingAs($docente)
        ->post(route('tesoreria.cuotas.pagar', $cuota), [
            'monto' => 500,
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertForbidden();

    expect($cuota->pagos()->count())->toBe(0);
});

test('pagarComprobante paga varias cuotas de forma atómica', function () {
    $cajero = usuarioConRol('Cajero');
    [, $comprobante, $cuota1] = crearCuotaPendiente();
    $cuota2 = Cuota::factory()->create([
        'id_comprobante' => $comprobante->id_comprobante,
        'numero_cuota' => 2,
        'monto' => 300,
        'fecha_vencimiento' => now()->addDays(20)->toDateString(),
        'estado' => EstadoCuota::Pendiente,
    ]);
    $comprobante->update(['saldo_pendiente' => 800]);

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.pagar-comprobante'), [
            'cuota_ids' => [$cuota1->id_cuota, $cuota2->id_cuota],
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertRedirect();

    expect($cuota1->refresh()->estado)->toBe(EstadoCuota::Pagada)
        ->and($cuota2->refresh()->estado)->toBe(EstadoCuota::Pagada)
        ->and((float) $comprobante->refresh()->saldo_pendiente)->toBe(0.0)
        ->and(Pago::query()->count())->toBe(2);
});

test('pagarComprobante no registra pagos sin permiso de pagos', function () {
    $docente = usuarioConRol('Docente');
    [, , $cuota] = crearCuotaPendiente();

    $this->actingAs($docente)
        ->post(route('tesoreria.cuotas.pagar-comprobante'), [
            'cuota_ids' => [$cuota->id_cuota],
            'metodo_pago' => 'EFECTIVO',
        ])
        ->assertForbidden();

    expect(Pago::query()->count())->toBe(0);
});

test('prorrogar aplaza la fecha de vencimiento de la cuota', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();
    $fechaOriginal = $cuota->fecha_vencimiento;

    $this->actingAs($cajero)
        ->post(route('tesoreria.cuotas.prorrogar', $cuota), [
            'dias' => 15,
        ])
        ->assertRedirect();

    expect($cuota->refresh()->fecha_vencimiento->toDateString())
        ->toBe($fechaOriginal->copy()->addDays(15)->toDateString());
});

test('prorrogar no aplaza la cuota sin permiso de pagos', function () {
    $docente = usuarioConRol('Docente');
    [, , $cuota] = crearCuotaPendiente();
    $fechaOriginal = $cuota->fecha_vencimiento;

    $this->actingAs($docente)
        ->post(route('tesoreria.cuotas.prorrogar', $cuota), [
            'dias' => 15,
        ])
        ->assertForbidden();

    expect($cuota->refresh()->fecha_vencimiento->toDateString())
        ->toBe($fechaOriginal->toDateString());
});

test('updateWhatsappTemplates actualiza las plantillas de WhatsApp', function () {
    $cajero = usuarioConRol('Cajero');

    $this->actingAs($cajero)
        ->put(route('tesoreria.whatsapp-templates.update'), [
            'vencido' => 'Mensaje vencido actualizado',
            'proximo_a_vencer' => 'Mensaje próximo a vencer actualizado',
        ])
        ->assertRedirect();

    expect(Configuracion::where('clave', 'whatsapp_msg_vencido')->value('valor'))
        ->toBe('Mensaje vencido actualizado')
        ->and(Configuracion::where('clave', 'whatsapp_msg_proximo_a_vencer')->value('valor'))
        ->toBe('Mensaje próximo a vencer actualizado');
});

test('updateWhatsappTemplates no actualiza plantillas sin permiso de pagos', function () {
    $docente = usuarioConRol('Docente');

    $this->actingAs($docente)
        ->put(route('tesoreria.whatsapp-templates.update'), [
            'vencido' => 'No debe guardarse',
            'proximo_a_vencer' => 'No debe guardarse',
        ])
        ->assertForbidden();

    expect(Configuracion::where('clave', 'whatsapp_msg_vencido')->exists())->toBeFalse();
});

test('movimientos ordena por fecha descendente por defecto', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-04',
        'monto' => 100,
    ]);
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-05',
        'monto' => 200,
    ]);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index'))
        ->assertOk();

    $pagos = $response->viewData('page')['props']['pagos']['data'];
    $fechas = array_map(fn ($pago) => $pago['fecha_pago'], $pagos);

    expect($fechas)->toBe([
        '2026-08-05T00:00:00.000000Z',
        '2026-08-04T00:00:00.000000Z',
    ]);
});

test('movimientos ordena por monto según el parámetro direction', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-04',
        'monto' => 300,
    ]);
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-05',
        'monto' => 100,
    ]);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['sort' => 'monto', 'direction' => 'asc']))
        ->assertOk();

    $pagos = $response->viewData('page')['props']['pagos']['data'];
    $montos = array_map(fn ($pago) => (float) $pago['monto'], $pagos);

    expect($montos)->toBe([100.0, 300.0]);
});

test('movimientos rechaza un valor de sort inválido', function () {
    $cajero = usuarioConRol('Cajero');

    $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['sort' => 'alumno']))
        ->assertSessionHasErrors('sort');
});
