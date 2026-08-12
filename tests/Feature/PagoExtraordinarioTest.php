<?php

use App\Models\Alumno;
use App\Models\ComprobantePago;
use App\Models\Matricula;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

function usuarioPagoExtraordinario(): User
{
    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Cajero')->value('id_rol'),
    ]);
}

function matriculaVigente(): Matricula
{
    return Matricula::factory()->create([
        'estado' => 'VIGENTE',
        'costo_total' => 500,
    ]);
}

test('store registra comprobante extraordinario con la categoria indicada', function () {
    $cajero = usuarioPagoExtraordinario();
    $matricula = matriculaVigente();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'id_alumno' => $matricula->id_alumno,
            'monto' => 25.50,
            'descripcion' => 'Examen de Conocimiento',
            'num_cuotas' => 1,
            'categoria' => 'SERVICIOS',
        ])
        ->assertRedirect(route('tesoreria.estado-cuenta.show', $matricula->alumno));

    $comprobante = ComprobantePago::query()->where('id_matricula', $matricula->id_matricula)->first();

    expect($comprobante)->not->toBeNull()
        ->and($comprobante->categoria)->toBe('SERVICIOS')
        ->and($comprobante->concepto->value)->toBe('EXTRAORDINARIO');
});

test('store usa ADMINISTRATIVO cuando no se envia categoria', function () {
    $cajero = usuarioPagoExtraordinario();
    $matricula = matriculaVigente();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'id_alumno' => $matricula->id_alumno,
            'monto' => 25.50,
            'descripcion' => 'Certificado de estudios',
            'num_cuotas' => 1,
        ])
        ->assertRedirect();

    $comprobante = ComprobantePago::query()->where('id_matricula', $matricula->id_matricula)->first();

    expect($comprobante)->not->toBeNull()
        ->and($comprobante->categoria)->toBe('ADMINISTRATIVO');
});

test('store rechaza una categoria contable no valida', function () {
    $cajero = usuarioPagoExtraordinario();
    $matricula = matriculaVigente();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'id_alumno' => $matricula->id_alumno,
            'monto' => 25.50,
            'descripcion' => 'Examen de Conocimiento',
            'num_cuotas' => 1,
            'categoria' => 'INEXISTENTE',
        ])
        ->assertSessionHasErrors('categoria');

    expect(ComprobantePago::query()->where('id_matricula', $matricula->id_matricula)->count())->toBe(0);
});

test('store registra un ingreso general sin alumno con id_matricula null', function () {
    $cajero = usuarioPagoExtraordinario();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'monto' => 120.00,
            'descripcion' => 'DonaciÃ³n de exalumno',
            'num_cuotas' => 1,
        ])
        ->assertRedirect(route('tesoreria.caja.index'));

    $comprobante = ComprobantePago::query()->whereNull('id_matricula')->first();

    expect($comprobante)->not->toBeNull()
        ->and($comprobante->id_matricula)->toBeNull()
        ->and($comprobante->descripcion)->toBe('DonaciÃ³n de exalumno')
        ->and($comprobante->categoria)->toBe('ADMINISTRATIVO')
        ->and($comprobante->concepto->value)->toBe('EXTRAORDINARIO')
        ->and($comprobante->numero)->toMatch('/^EXT-GEN-/');
});

test('store registra ingreso general con concepto personalizado y categoria contable', function () {
    $cajero = usuarioPagoExtraordinario();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'monto' => 350.00,
            'descripcion' => 'Alquiler de auditorio',
            'num_cuotas' => 1,
            'categoria' => 'SERVICIOS',
        ])
        ->assertRedirect(route('tesoreria.caja.index'));

    $comprobante = ComprobantePago::query()->whereNull('id_matricula')->first();

    expect($comprobante)->not->toBeNull()
        ->and($comprobante->id_matricula)->toBeNull()
        ->and($comprobante->descripcion)->toBe('Alquiler de auditorio')
        ->and($comprobante->categoria)->toBe('SERVICIOS')
        ->and((float) $comprobante->costo_total)->toBe(350.0);
});

test('store registra ingreso general cuando el alumno no tiene matricula vigente', function () {
    $cajero = usuarioPagoExtraordinario();
    $alumno = Alumno::factory()->create();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'id_alumno' => $alumno->id_alumno,
            'monto' => 60.00,
            'descripcion' => 'Certificado de estudios',
            'num_cuotas' => 1,
        ])
        ->assertRedirect(route('tesoreria.caja.index'));

    $comprobante = ComprobantePago::query()->whereNull('id_matricula')->first();

    expect($comprobante)->not->toBeNull()
        ->and($comprobante->id_matricula)->toBeNull()
        ->and($comprobante->descripcion)->toBe('Certificado de estudios');
});

test('store valida el formulario: concepto obligatorio, maximo 60 y categoria del catalogo', function () {
    $cajero = usuarioPagoExtraordinario();

    // Concepto (descripcion) obligatorio
    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'monto' => 25.50,
            'descripcion' => '',
        ])
        ->assertSessionHasErrors('descripcion');

    // Concepto mayor a 60 caracteres
    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'monto' => 25.50,
            'descripcion' => str_repeat('a', 61),
        ])
        ->assertSessionHasErrors('descripcion');

    // CategorÃ­a fuera del catÃ¡logo
    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'monto' => 25.50,
            'descripcion' => 'Examen de Conocimiento',
            'categoria' => 'INVENTARIO',
        ])
        ->assertSessionHasErrors('categoria');

    // Monto obligatorio
    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'descripcion' => 'Examen de Conocimiento',
        ])
        ->assertSessionHasErrors('monto');

    expect(ComprobantePago::query()->count())->toBe(0);
});

test('store rechaza un id_alumno inexistente', function () {
    $cajero = usuarioPagoExtraordinario();

    $this->actingAs($cajero)
        ->post(route('tesoreria.pago-extraordinario.store'), [
            'id_alumno' => 999999,
            'monto' => 25.50,
            'descripcion' => 'Examen de Conocimiento',
        ])
        ->assertSessionHasErrors('id_alumno');

    expect(ComprobantePago::query()->count())->toBe(0);
});
