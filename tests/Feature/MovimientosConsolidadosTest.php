<?php

use App\Enums\EstadoCuota;
use App\Models\AuditoriaEgreso;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use App\Models\Egreso;
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

function crearCuotaParaMovimientos(int $monto = 500): array
{
    $matricula = Matricula::factory()->create(['costo_total' => $monto]);
    $comprobante = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'costo_total' => $monto,
        'saldo_pendiente' => $monto,
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

function usuarioMovimientosConRol(string $nombre): User
{
    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', $nombre)->value('id_rol'),
    ]);
}

function crearEgresoParaMovimientos(User $user, array $overrides = []): Egreso
{
    return Egreso::create(array_merge([
        'tipo_egreso' => 'Pago de luz',
        'categoria' => 'SERVICIOS',
        'descripcion' => 'Recibo de luz del local',
        'cantidad' => 1,
        'precio' => 50.00,
        'igv' => 0,
        'fecha' => '2026-08-04',
        'user_id' => $user->id,
    ], $overrides));
}

test('movimientos consolida pagos y egresos en el libro diario', function () {
    $cajero = usuarioMovimientosConRol('Cajero');
    [, , $cuota] = crearCuotaParaMovimientos();

    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-04',
        'monto' => 100,
    ]);
    crearEgresoParaMovimientos($cajero);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index'))
        ->assertOk();

    $page = $response->viewData('page')['props'];

    expect(count($page['pagos']['data']))->toBe(1)
        ->and(count($page['egresos']['data']))->toBe(1)
        ->and($page['egresos']['data'][0]['estado'])->toBe('REGISTRADO')
        ->and($page['egresos']['data'][0]['concepto'])->toBe('Pago de luz')
        ->and($page['egresos']['data'][0]['total'])->toBe(50.0);
});

test('movimientos con tipo ingresos devuelve solo pagos', function () {
    $cajero = usuarioMovimientosConRol('Cajero');
    [, , $cuota] = crearCuotaParaMovimientos();

    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-04',
        'monto' => 100,
    ]);
    crearEgresoParaMovimientos($cajero);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['tipo' => 'ingresos']))
        ->assertOk();

    $page = $response->viewData('page')['props'];

    expect(count($page['pagos']['data']))->toBe(1)
        ->and(count($page['egresos']['data']))->toBe(0);
});

test('movimientos con tipo egresos devuelve solo egresos', function () {
    $cajero = usuarioMovimientosConRol('Cajero');
    [, , $cuota] = crearCuotaParaMovimientos();

    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-04',
        'monto' => 100,
    ]);
    crearEgresoParaMovimientos($cajero);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['tipo' => 'egresos']))
        ->assertOk();

    $page = $response->viewData('page')['props'];

    expect(count($page['pagos']['data']))->toBe(0)
        ->and(count($page['egresos']['data']))->toBe(1);
});

test('movimientos incluye egresos anulados con su auditoría', function () {
    $admin = usuarioMovimientosConRol('Administrador');
    $egreso = crearEgresoParaMovimientos($admin);

    AuditoriaEgreso::create([
        'egreso_id' => $egreso->id_egreso,
        'usuario_id' => $admin->id,
        'accion' => 'ANULACION',
        'motivo' => 'Registro duplicado',
    ]);
    $egreso->update(['estado' => 'ANULADO']);

    $response = $this->actingAs($admin)
        ->get(route('tesoreria.movimientos.index', ['tipo' => 'egresos']))
        ->assertOk();

    $page = $response->viewData('page')['props'];
    $egresoData = $page['egresos']['data'][0];

    expect($egresoData['estado'])->toBe('ANULADO')
        ->and($egresoData['auditorias'][0]['accion'])->toBe('ANULACION')
        ->and($egresoData['auditorias'][0]['motivo'])->toBe('Registro duplicado')
        ->and($egresoData['auditorias'][0]['usuario']['name'])->toBe($admin->name);
});

test('movimientos rechaza un valor de tipo inválido', function () {
    $cajero = usuarioMovimientosConRol('Cajero');

    $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['tipo' => 'invalido']))
        ->assertSessionHasErrors('tipo');
});
