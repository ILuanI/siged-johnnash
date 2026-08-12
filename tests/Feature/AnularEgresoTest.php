<?php

use App\Models\AuditoriaEgreso;
use App\Models\Egreso;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

function crearEgresoParaAnular(User $user, array $overrides = []): Egreso
{
    return Egreso::create(array_merge([
        'tipo_egreso' => 'Pago de limpieza',
        'categoria' => 'MANTENIMIENTO',
        'descripcion' => 'Limpieza general del local',
        'cantidad' => 1,
        'precio' => 80.00,
        'igv' => 0,
        'fecha' => now()->toDateString(),
        'user_id' => $user->id,
    ], $overrides));
}

function usuarioEgresoConRol(string $nombre): User
{
    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', $nombre)->value('id_rol'),
    ]);
}

test('anula un egreso y registra la auditoría de anulación', function () {
    $admin = usuarioEgresoConRol('Administrador');
    $egreso = crearEgresoParaAnular($admin);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.anular', $egreso), [
            'motivo' => 'Registro duplicado por error del cajero',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($egreso->refresh()->estado)->toBe('ANULADO')
        ->and(AuditoriaEgreso::query()->count())->toBe(1);

    $auditoria = AuditoriaEgreso::query()->first();

    expect($auditoria->egreso_id)->toBe($egreso->id_egreso)
        ->and($auditoria->usuario_id)->toBe($admin->id)
        ->and($auditoria->accion)->toBe('ANULACION')
        ->and($auditoria->motivo)->toBe('Registro duplicado por error del cajero')
        ->and($auditoria->created_at)->not->toBeNull();
});

test('rechaza anular un egreso sin motivo', function () {
    $admin = usuarioEgresoConRol('Administrador');
    $egreso = crearEgresoParaAnular($admin);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.anular', $egreso))
        ->assertSessionHasErrors('motivo');

    expect($egreso->refresh()->estado)->toBe('REGISTRADO')
        ->and(AuditoriaEgreso::query()->count())->toBe(0);
});

test('rechaza anular un egreso con un motivo demasiado largo', function () {
    $admin = usuarioEgresoConRol('Administrador');
    $egreso = crearEgresoParaAnular($admin);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.anular', $egreso), [
            'motivo' => str_repeat('a', 501),
        ])
        ->assertSessionHasErrors('motivo');

    expect($egreso->refresh()->estado)->toBe('REGISTRADO')
        ->and(AuditoriaEgreso::query()->count())->toBe(0);
});

test('rechaza anular un egreso que ya se encuentra anulado', function () {
    $admin = usuarioEgresoConRol('Administrador');
    $egreso = crearEgresoParaAnular($admin, ['estado' => 'ANULADO']);

    $this->actingAs($admin)
        ->post(route('tesoreria.egresos.anular', $egreso), [
            'motivo' => 'Intento de anular un egreso ya anulado',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($egreso->refresh()->estado)->toBe('ANULADO')
        ->and(AuditoriaEgreso::query()->count())->toBe(0);
});

test('no anula un egreso sin permiso de eliminar', function () {
    // El cajero tiene pagos.editar pero no pagos.eliminar: la anulación
    // requiere el permiso de eliminar (igual que la anulación de pagos).
    $cajero = usuarioEgresoConRol('Cajero');
    $egreso = crearEgresoParaAnular($cajero);

    $this->actingAs($cajero)
        ->post(route('tesoreria.egresos.anular', $egreso), [
            'motivo' => 'Sin permiso',
        ])
        ->assertForbidden();

    expect($egreso->refresh()->estado)->toBe('REGISTRADO')
        ->and(AuditoriaEgreso::query()->count())->toBe(0);
});
