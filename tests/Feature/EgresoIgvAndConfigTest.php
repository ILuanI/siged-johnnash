<?php

use App\Models\Configuracion;
use App\Models\Egreso;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

test('configura y actualiza variable financiera igv_porcentaje_defecto', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $this->actingAs($admin)
        ->put(route('ajustes.variables-financieras.update'), [
            'igv_porcentaje_defecto' => 18.00,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Configuracion::where('clave', 'igv_porcentaje_defecto')->value('valor'))->toBe('18');
});

test('registra egreso con IGV ANTES (No incluido) correctamente sin errores de redondeo', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.store'), [
            'concepto' => 'Compra de suministros',
            'categoria' => 'OPERATIVO',
            'cantidad' => 2,
            'precio' => 100.00, // sin IGV unitario
            'aplica_igv' => true,
            'igv_porcentaje' => 18.00,
            'igv_tipo' => 'ANTES',
            'fecha' => now()->toDateString(),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $egreso = Egreso::latest('id_egreso')->first();

    expect($egreso->cantidad)->toBe(2.0)
        ->and($egreso->precio)->toBe(100.0) // subtotal = 200
        ->and($egreso->igv)->toBe(36.0) // 200 * 0.18 = 36.00
        ->and($egreso->total)->toBe(236.0); // 200 + 36 = 236.00
});

test('registra egreso con IGV DESPUES (Incluido) correctamente sin errores de redondeo', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.store'), [
            'concepto' => 'Servicio de Internet',
            'categoria' => 'SERVICIOS',
            'cantidad' => 1,
            'precio' => 118.00, // con IGV incluido
            'aplica_igv' => true,
            'igv_porcentaje' => 18.00,
            'igv_tipo' => 'DESPUES',
            'fecha' => now()->toDateString(),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $egreso = Egreso::latest('id_egreso')->first();

    // Total bruto = 118. Subtotal = 118 / 1.18 = 100. IGV = 18.
    expect($egreso->cantidad)->toBe(1.0)
        ->and($egreso->igv)->toBe(18.0)
        ->and($egreso->total)->toBe(118.0);
});

test('registra egreso sin IGV (aplica_igv false)', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.store'), [
            'concepto' => 'Pago sin IGV',
            'categoria' => 'OTROS',
            'cantidad' => 3,
            'precio' => 50.00,
            'aplica_igv' => false,
            'fecha' => now()->toDateString(),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $egreso = Egreso::latest('id_egreso')->first();

    expect($egreso->aplica_igv)->toBeFalse()
        ->and($egreso->igv)->toBe(0.0)
        ->and($egreso->total)->toBe(150.0);
});

test('registra el egreso respetando la fecha seleccionada por el usuario (datetime)', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    // Se envía una fecha distinta a hoy para confirmar que el controlador
    // respeta el valor del formulario y lo combina con la hora actual.
    $fechaSeleccionada = now()->subDays(5);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.store'), [
            'concepto' => 'Gasto con hora',
            'categoria' => 'OPERATIVO',
            'cantidad' => 1,
            'precio' => 10.00,
            'fecha' => $fechaSeleccionada,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $egreso = Egreso::latest('id_egreso')->first();

    expect($egreso->fecha->toDateString())->toBe($fechaSeleccionada->toDateString())
        ->and($egreso->fecha->format('H:i:s'))->not->toBe('00:00:00');
});

test('actualiza el egreso respetando la fecha seleccionada por el usuario (datetime)', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);

    $egreso = Egreso::create([
        'tipo_egreso' => 'Gasto previo',
        'categoria' => 'OPERATIVO',
        'cantidad' => 1,
        'precio' => 10.00,
        'fecha' => now(),
        'user_id' => $admin->id,
    ]);

    $fechaSeleccionada = now()->subDays(10);

    $this->actingAs($admin)
        ->put(route('tesoreria.egresos.update', $egreso), [
            'concepto' => 'Gasto actualizado',
            'categoria' => 'OPERATIVO',
            'cantidad' => 1,
            'precio' => 10.00,
            'fecha' => $fechaSeleccionada,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $egreso->refresh();

    expect($egreso->fecha->toDateString())->toBe($fechaSeleccionada->toDateString())
        ->and($egreso->fecha->format('H:i:s'))->not->toBe('00:00:00');
});
