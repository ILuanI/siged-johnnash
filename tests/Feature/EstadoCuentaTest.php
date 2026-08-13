<?php

use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Configuracion;
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

test('caja filtra ingresos, egresos y pagos recientes por rango de fechas', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    // Pagos: uno dentro del rango y otro fuera.
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-10 10:00:00',
        'monto' => 150,
    ]);
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-06-15 10:00:00',
        'monto' => 999,
    ]);

    // Egresos: uno dentro del rango y otro fuera.
    Egreso::create([
        'tipo_egreso' => 'Servicio de luz',
        'categoria' => 'SERVICIOS',
        'descripcion' => 'Recibo de luz',
        'cantidad' => 1,
        'precio' => 50.00,
        'igv' => 0,
        'fecha' => '2026-08-12 09:00:00',
        'user_id' => $cajero->id,
        'estado' => 'REGISTRADO',
    ]);
    Egreso::create([
        'tipo_egreso' => 'Servicio de agua',
        'categoria' => 'SERVICIOS',
        'descripcion' => 'Recibo de agua',
        'cantidad' => 1,
        'precio' => 70.00,
        'igv' => 0,
        'fecha' => '2026-05-01 09:00:00',
        'user_id' => $cajero->id,
        'estado' => 'REGISTRADO',
    ]);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index', [
            'fecha_inicio' => '2026-08-01',
            'fecha_fin' => '2026-08-31',
        ]))
        ->assertOk();

    $props = $response->viewData('page')['props'];

    // Solo el egreso de agosto aparece en la lista paginada.
    expect($props['egresos']['data'])->toHaveCount(1)
        ->and($props['egresos']['data'][0]['tipo_egreso'])->toBe('Servicio de luz');

    // Solo el pago de agosto aparece en la tabla paginada de ingresos.
    expect($props['pagos']['data'])->toHaveCount(1)
        ->and((float) $props['pagos']['data'][0]['monto'])->toBe(150.0)
        ->and($props['pagos']['per_page'])->toBe(15)
        ->and($props['pagos']['total'])->toBe(1);

    // Totales y consolidado reflejan únicamente el rango filtrado.
    expect((float) $props['totalIngresos'])->toBe(150.0)
        ->and((float) $props['totalEgresos'])->toBe(50.0)
        ->and((float) $props['ingresosPorConcepto']['MATRICULA'])->toBe(150.0);
});

test('caja aplica el mes actual por defecto cuando no se envían fechas', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    // Pago dentro del mes actual.
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => now()->startOfMonth()->addDays(2)->toDateTimeString(),
        'monto' => 200,
    ]);
    // Pago de hace varios meses, fuera del mes actual.
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => now()->subMonths(5)->toDateTimeString(),
        'monto' => 777,
    ]);

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index'))
        ->assertOk();

    $props = $response->viewData('page')['props'];

    expect((float) $props['totalIngresos'])->toBe(200.0)
        ->and($props['pagos']['data'])->toHaveCount(1);
});

test('caja pagina los ingresos del periodo en 15 por pagina', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    // 16 pagos dentro del rango => 2 páginas (15 por página).
    foreach (range(1, 16) as $i) {
        Pago::factory()->create([
            'id_cuota' => $cuota->id_cuota,
            'user_id' => $cajero->id,
            'fecha_pago' => now()->startOfMonth()->addDays($i)->toDateTimeString(),
            'monto' => 10,
        ]);
    }

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index', [
            'fecha_inicio' => now()->startOfMonth()->toDateString(),
            'fecha_fin' => now()->endOfMonth()->toDateString(),
        ]))
        ->assertOk();

    $props = $response->viewData('page')['props'];

    expect($props['pagos']['per_page'])->toBe(15)
        ->and($props['pagos']['total'])->toBe(16)
        ->and($props['pagos']['last_page'])->toBe(2)
        ->and($props['pagos']['current_page'])->toBe(1)
        ->and($props['pagos']['data'])->toHaveCount(15);

    // La segunda página entrega el pago restante.
    $responsePagina2 = $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index', [
            'fecha_inicio' => now()->startOfMonth()->toDateString(),
            'fecha_fin' => now()->endOfMonth()->toDateString(),
            'page' => 2,
        ]))
        ->assertOk();

    $propsPagina2 = $responsePagina2->viewData('page')['props'];

    expect($propsPagina2['pagos']['current_page'])->toBe(2)
        ->and($propsPagina2['pagos']['data'])->toHaveCount(1);
});

test('caja deniega el acceso sin permiso de ver pagos', function () {
    $docente = usuarioConRol('Docente');

    $this->actingAs($docente)
        ->get(route('tesoreria.caja.index'))
        ->assertForbidden();
});

test('caja pagina los egresos en 15 por pagina', function () {
    $cajero = usuarioConRol('Cajero');
    [, , $cuota] = crearCuotaPendiente();

    // 16 egresos dentro del rango => 2 páginas (15 por página).
    foreach (range(1, 16) as $i) {
        Egreso::create([
            'tipo_egreso' => "Gasto {$i}",
            'categoria' => 'OPERATIVO',
            'descripcion' => "Descripción {$i}",
            'cantidad' => 1,
            'precio' => 10.00,
            'igv' => 0,
            'fecha' => now()->startOfMonth()->addDays($i)->toDateTimeString(),
            'user_id' => $cajero->id,
            'estado' => 'REGISTRADO',
        ]);
    }

    $response = $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index', [
            'fecha_inicio' => now()->startOfMonth()->toDateString(),
            'fecha_fin' => now()->endOfMonth()->toDateString(),
        ]))
        ->assertOk();

    $props = $response->viewData('page')['props'];

    expect($props['egresos']['per_page'])->toBe(15)
        ->and($props['egresos']['total'])->toBe(16)
        ->and($props['egresos']['last_page'])->toBe(2)
        ->and($props['egresos']['current_page'])->toBe(1)
        ->and($props['egresos']['data'])->toHaveCount(15);

    // La segunda página entrega el egreso restante.
    $responsePagina2 = $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index', [
            'fecha_inicio' => now()->startOfMonth()->toDateString(),
            'fecha_fin' => now()->endOfMonth()->toDateString(),
            'page' => 2,
        ]))
        ->assertOk();

    $propsPagina2 = $responsePagina2->viewData('page')['props'];

    expect($propsPagina2['egresos']['current_page'])->toBe(2)
        ->and($propsPagina2['egresos']['data'])->toHaveCount(1);
});

test('caja rechaza fecha_fin anterior a fecha_inicio', function () {
    $cajero = usuarioConRol('Cajero');

    $this->actingAs($cajero)
        ->get(route('tesoreria.caja.index', [
            'fecha_inicio' => '2026-08-31',
            'fecha_fin' => '2026-08-01',
        ]))
        ->assertSessionHasErrors('fecha_fin');
});

test('movimientos filtra pagos y egresos por búsqueda de texto', function () {
    $cajero = usuarioConRol('Cajero');
    [$matricula, $comprobante, $cuota] = crearCuotaPendiente();

    $alumno = $matricula->alumno;
    $alumno->update([
        'nombres' => 'Juan Carlos',
        'apellidos' => 'Pérez López',
        'dni' => '12345678',
    ]);

    // Pago del alumno buscado.
    Pago::factory()->create([
        'id_cuota' => $cuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-10',
        'monto' => 100,
    ]);

    // Pago de otro alumno (no debe coincidir con la búsqueda).
    [, , $otraCuota] = crearCuotaPendiente();
    Pago::factory()->create([
        'id_cuota' => $otraCuota->id_cuota,
        'user_id' => $cajero->id,
        'fecha_pago' => '2026-08-10',
        'monto' => 300,
    ]);

    // Egreso cuyo usuario coincide con la búsqueda.
    $usuarioBuscado = User::factory()->create(['name' => 'Ana Torres']);
    Egreso::create([
        'tipo_egreso' => 'Materiales',
        'categoria' => 'OPERATIVO',
        'descripcion' => 'Compra de útiles',
        'cantidad' => 1,
        'precio' => 40.00,
        'igv' => 0,
        'fecha' => '2026-08-10',
        'user_id' => $usuarioBuscado->id,
        'estado' => 'REGISTRADO',
    ]);
    // Egreso de otro usuario (no debe coincidir con la búsqueda).
    Egreso::create([
        'tipo_egreso' => 'Otros',
        'categoria' => 'OTROS',
        'descripcion' => 'Gasto vario',
        'cantidad' => 1,
        'precio' => 25.00,
        'igv' => 0,
        'fecha' => '2026-08-10',
        'user_id' => $cajero->id,
        'estado' => 'REGISTRADO',
    ]);

    // Búsqueda por apellido del alumno: solo el pago del alumno coincide.
    $responsePagos = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['search' => 'Pérez']))
        ->assertOk();

    $propsPagos = $responsePagos->viewData('page')['props'];

    expect($propsPagos['pagos']['data'])->toHaveCount(1)
        ->and((float) $propsPagos['pagos']['data'][0]['monto'])->toBe(100.0)
        ->and($propsPagos['egresos']['data'])->toHaveCount(0);

    // Búsqueda por descripción del egreso: solo el egreso coincide.
    $responseEgresos = $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['search' => 'Compra']))
        ->assertOk();

    $propsEgresos = $responseEgresos->viewData('page')['props'];

    expect($propsEgresos['egresos']['data'])->toHaveCount(1)
        ->and($propsEgresos['egresos']['data'][0]['tipo_egreso'])->toBe('Materiales')
        ->and($propsEgresos['pagos']['data'])->toHaveCount(0);
});

test('movimientos rechaza un search demasiado largo', function () {
    $cajero = usuarioConRol('Cajero');

    $this->actingAs($cajero)
        ->get(route('tesoreria.movimientos.index', ['search' => str_repeat('a', 256)]))
        ->assertSessionHasErrors('search');
});
