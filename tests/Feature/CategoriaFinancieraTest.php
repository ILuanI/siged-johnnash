<?php

use App\Models\CategoriaFinanciera;
use App\Models\ComprobantePago;
use App\Models\Egreso;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\CategoriaFinancieraSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

function usuarioCategorias(string $rolNombre): User
{
    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', $rolNombre)->value('id_rol'),
    ]);
}

test('index lista las categorias iniciales del seeder', function () {
    $this->seed(CategoriaFinancieraSeeder::class);

    $admin = usuarioCategorias('Administrador');

    $this->actingAs($admin)
        ->get(route('tesoreria.categorias.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('tesoreria/categorias')
            ->has('categorias', 11));
});

test('store crea una categoria financiera con es_por_defecto false', function () {
    $admin = usuarioCategorias('Administrador');

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.store'), [
            'nombre' => 'LABORATORIO',
            'tipo' => 'INGRESO',
            'descripcion' => 'Venta de materiales de laboratorio',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $categoria = CategoriaFinanciera::query()->where('nombre', 'LABORATORIO')->first();

    expect($categoria)->not->toBeNull()
        ->and($categoria->tipo->value)->toBe('INGRESO')
        ->and($categoria->descripcion)->toBe('Venta de materiales de laboratorio')
        ->and($categoria->es_por_defecto)->toBeFalse();
});

test('store permite el mismo nombre para tipos distintos', function () {
    $admin = usuarioCategorias('Administrador');

    $this->actingAs($admin)->post(route('tesoreria.categorias.store'), [
        'nombre' => 'LABORATORIO',
        'tipo' => 'INGRESO',
    ])->assertRedirect();

    $this->actingAs($admin)->post(route('tesoreria.categorias.store'), [
        'nombre' => 'LABORATORIO',
        'tipo' => 'EGRESO',
    ])->assertRedirect();

    expect(CategoriaFinanciera::query()->where('nombre', 'LABORATORIO')->count())->toBe(2);
});

test('store rechaza nombre duplicado dentro del mismo tipo', function () {
    $admin = usuarioCategorias('Administrador');
    CategoriaFinanciera::factory()->create(['nombre' => 'SERVICIOS', 'tipo' => 'INGRESO']);

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.store'), [
            'nombre' => 'SERVICIOS',
            'tipo' => 'INGRESO',
        ])
        ->assertSessionHasErrors('nombre');

    expect(CategoriaFinanciera::query()->where('nombre', 'SERVICIOS')->where('tipo', 'INGRESO')->count())->toBe(1);
});

test('store valida nombre obligatorio, maximo 60, tipo valido y descripcion maxima 160', function () {
    $admin = usuarioCategorias('Administrador');

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.store'), [
            'tipo' => 'INGRESO',
        ])
        ->assertSessionHasErrors('nombre');

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.store'), [
            'nombre' => str_repeat('a', 61),
            'tipo' => 'INGRESO',
        ])
        ->assertSessionHasErrors('nombre');

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.store'), [
            'nombre' => 'BECA',
            'tipo' => 'DESCONOCIDO',
        ])
        ->assertSessionHasErrors('tipo');

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.store'), [
            'nombre' => 'BECA',
            'tipo' => 'INGRESO',
            'descripcion' => str_repeat('b', 161),
        ])
        ->assertSessionHasErrors('descripcion');

    expect(CategoriaFinanciera::query()->count())->toBe(0);
});

test('update modifica una categoria y respeta la unicidad por tipo', function () {
    $admin = usuarioCategorias('Administrador');
    $categoria = CategoriaFinanciera::factory()->create([
        'nombre' => 'PUBLICIDAD',
        'tipo' => 'EGRESO',
    ]);

    $this->actingAs($admin)
        ->put(route('tesoreria.categorias.update', $categoria), [
            'nombre' => 'MARKETING',
            'tipo' => 'EGRESO',
            'descripcion' => 'Gastos de publicidad',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($categoria->refresh()->nombre)->toBe('MARKETING')
        ->and($categoria->descripcion)->toBe('Gastos de publicidad');
});

test('update permite conservar el nombre actual sin chocar con la unicidad', function () {
    $admin = usuarioCategorias('Administrador');
    $categoria = CategoriaFinanciera::factory()->create([
        'nombre' => 'EVENTOS',
        'tipo' => 'INGRESO',
    ]);

    $this->actingAs($admin)
        ->put(route('tesoreria.categorias.update', $categoria), [
            'nombre' => 'EVENTOS',
            'tipo' => 'INGRESO',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');
});

test('destroy elimina una categoria que no esta en uso ni es por defecto', function () {
    $admin = usuarioCategorias('Administrador');
    $categoria = CategoriaFinanciera::factory()->create([
        'nombre' => 'TEMPORAL',
        'tipo' => 'INGRESO',
    ]);

    $this->actingAs($admin)
        ->delete(route('tesoreria.categorias.destroy', $categoria))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(CategoriaFinanciera::query()->find($categoria->id))->toBeNull();
});

test('destroy rechaza eliminar la categoria por defecto', function () {
    $admin = usuarioCategorias('Administrador');
    $categoria = CategoriaFinanciera::factory()->porDefecto()->create([
        'nombre' => 'ACADEMICO',
        'tipo' => 'INGRESO',
    ]);

    $this->actingAs($admin)
        ->delete(route('tesoreria.categorias.destroy', $categoria))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(CategoriaFinanciera::query()->find($categoria->id))->not->toBeNull();
});

test('destroy rechaza eliminar una categoria en uso por egresos o comprobantes', function () {
    $admin = usuarioCategorias('Administrador');
    $categoria = CategoriaFinanciera::factory()->create([
        'nombre' => 'MANTENIMIENTO',
        'tipo' => 'EGRESO',
    ]);

    Egreso::create([
        'tipo_egreso' => 'Pintado de aulas',
        'categoria' => $categoria->nombre,
        'descripcion' => 'Pintado general',
        'cantidad' => 1,
        'precio' => 100.00,
        'igv' => 0,
        'fecha' => now()->toDateString(),
        'user_id' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->delete(route('tesoreria.categorias.destroy', $categoria))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(CategoriaFinanciera::query()->find($categoria->id))->not->toBeNull();
});

test('destroy exige permiso de eliminar', function () {
    // El cajero tiene pagos.editar pero no pagos.eliminar.
    $cajero = usuarioCategorias('Cajero');
    $categoria = CategoriaFinanciera::factory()->create();

    $this->actingAs($cajero)
        ->delete(route('tesoreria.categorias.destroy', $categoria))
        ->assertForbidden();

    expect(CategoriaFinanciera::query()->find($categoria->id))->not->toBeNull();
});

test('setDefault marca la categoria y desmarca las demas del mismo tipo', function () {
    $admin = usuarioCategorias('Administrador');

    CategoriaFinanciera::factory()->porDefecto()->create([
        'nombre' => 'ACADEMICO',
        'tipo' => 'INGRESO',
    ]);
    $nueva = CategoriaFinanciera::factory()->create([
        'nombre' => 'SERVICIOS',
        'tipo' => 'INGRESO',
    ]);
    // Categoría de otro tipo que no debe verse afectada.
    CategoriaFinanciera::factory()->porDefecto()->create([
        'nombre' => 'OPERATIVO',
        'tipo' => 'EGRESO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.categorias.set-default', $nueva))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(CategoriaFinanciera::query()->where('tipo', 'INGRESO')->where('es_por_defecto', true)->count())->toBe(1)
        ->and(CategoriaFinanciera::query()->find($nueva->id)->es_por_defecto)->toBeTrue()
        ->and(CategoriaFinanciera::query()->where('nombre', 'ACADEMICO')->where('tipo', 'INGRESO')->value('es_por_defecto'))->toBeFalse()
        ->and(CategoriaFinanciera::query()->where('nombre', 'OPERATIVO')->where('tipo', 'EGRESO')->value('es_por_defecto'))->toBeTrue();
});

test('los formularios de caja y pago extraordinario reciben las categorias dinamicas', function () {
    $this->seed(CategoriaFinancieraSeeder::class);

    $admin = usuarioCategorias('Administrador');

    $this->actingAs($admin)
        ->get(route('tesoreria.caja.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('categoriasEgreso', 6));

    $this->actingAs($admin)
        ->get(route('tesoreria.pago-extraordinario.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('categoriasIngreso', 5));
});

test('egreso store acepta una categoria dinamica creada en el mantenedor', function () {
    $admin = usuarioCategorias('Administrador');
    CategoriaFinanciera::factory()->create([
        'nombre' => 'LABORATORIO',
        'tipo' => 'EGRESO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.store'), [
            'concepto' => 'Reactivos de laboratorio',
            'categoria' => 'LABORATORIO',
            'descripcion' => 'Compra de reactivos',
            'cantidad' => 2,
            'precio' => 45.00,
            'igv' => 0,
            'fecha' => now()->toDateString(),
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Egreso::query()->where('categoria', 'LABORATORIO')->exists())->toBeTrue();
});

test('pago extraordinario store acepta una categoria dinamica creada en el mantenedor', function () {
    $admin = usuarioCategorias('Administrador');
    CategoriaFinanciera::factory()->create([
        'nombre' => 'LABORATORIO',
        'tipo' => 'INGRESO',
    ]);

    $this->actingAs($admin)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'monto' => 25.50,
            'descripcion' => 'Venta de reactivos',
            'num_cuotas' => 1,
            'categoria' => 'LABORATORIO',
        ])
        ->assertRedirect(route('tesoreria.caja.index'));

    $comprobante = ComprobantePago::query()->whereNull('id_matricula')->first();

    expect($comprobante)->not->toBeNull()
        ->and($comprobante->categoria)->toBe('LABORATORIO');
});
