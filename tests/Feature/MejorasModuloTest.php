<?php

use App\Enums\ConceptoPago;
use App\Enums\EstadoCuota;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\ComprobantePago;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use App\Models\Rol;
use App\Models\Turno;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function crearUsuarioAdmin(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

test('usuario autenticado puede acceder a la caja general y registrar un egreso', function () {
    $user = crearUsuarioAdmin();

    $response = $this->actingAs($user)->get(route('tesoreria.caja.index'));
    $response->assertStatus(200);

    $responseStore = $this->actingAs($user)->post(route('tesoreria.egresos.store'), [
        'concepto' => 'Pago de Servicios',
        'descripcion' => 'Luz y agua local central',
        'cantidad' => 1,
        'precio' => 250.50,
        'igv' => 0,
        'fecha' => now()->toDateString(),
    ]);

    $responseStore->assertRedirect();
    $this->assertDatabaseHas('egreso', [
        'tipo_egreso' => 'Pago de Servicios',
        'total' => 250.50,
    ]);
});

test('administrador puede crear, editar y eliminar un ciclo especificando el periodo', function () {
    $user = crearUsuarioAdmin();
    $periodo = PeriodoAcademico::create([
        'nombre' => 'Periodo 2026-I',
        'anio' => 2026,
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-06-30',
        'estado' => 'ABIERTO',
    ]);

    // Crear Ciclo
    $responseStore = $this->actingAs($user)->post(route('cursos.ciclos.store'), [
        'nombre' => 'Ciclo Anual Intensivo 2026',
        'id_periodo' => $periodo->id_periodo,
        'tipo_ciclo' => 'INTENSIVO',
        'fecha_inicio' => '2026-01-10',
        'fecha_fin' => '2026-12-20',
        'costo_base' => 1200.00,
    ]);

    $responseStore->assertRedirect();
    $ciclo = Ciclo::where('nombre', 'Ciclo Anual Intensivo 2026')->first();
    expect($ciclo)->not->toBeNull();
    expect($ciclo->id_periodo)->toBe($periodo->id_periodo);

    // Editar Ciclo
    $responseUpdate = $this->actingAs($user)->put(route('cursos.ciclos.update', $ciclo->id_ciclo), [
        'nombre' => 'Ciclo Anual Intensivo Editado 2026',
        'id_periodo' => $periodo->id_periodo,
        'tipo_ciclo' => 'INTENSIVO',
        'fecha_inicio' => '2026-01-10',
        'fecha_fin' => '2026-12-20',
        'costo_base' => 1350.00,
    ]);

    $responseUpdate->assertRedirect();
    $this->assertDatabaseHas('ciclo', [
        'id_ciclo' => $ciclo->id_ciclo,
        'nombre' => 'Ciclo Anual Intensivo Editado 2026',
        'costo_base' => 1350.00,
    ]);

    // Eliminar Ciclo
    $responseDestroy = $this->actingAs($user)->delete(route('cursos.ciclos.destroy', $ciclo->id_ciclo));
    $responseDestroy->assertRedirect();
    $this->assertDatabaseMissing('ciclo', ['id_ciclo' => $ciclo->id_ciclo]);
});

test('permite retirar a un alumno conservando su historial y eliminarlo completamente si se requiere', function () {
    $user = crearUsuarioAdmin();
    $alumno = Alumno::factory()->create(['nombres' => 'Juan', 'apellidos' => 'Pérez']);

    // Retirar Alumno
    $responseRetirar = $this->actingAs($user)->post(route('matriculas.estudiantes.retirar', $alumno->id_alumno));
    $responseRetirar->assertRedirect();
    $this->assertDatabaseHas('alumno', [
        'id_alumno' => $alumno->id_alumno,
        'estado' => 'RETIRADO',
    ]);

    // Eliminar Alumno (Hard delete)
    $responseEliminar = $this->actingAs($user)->delete(route('matriculas.estudiantes.destroy', $alumno->id_alumno));
    $responseEliminar->assertRedirect();
    $this->assertDatabaseMissing('alumno', ['id_alumno' => $alumno->id_alumno]);
});

test('permite corregir el monto total de un comprobante de pago recalculando cuotas pendientes', function () {
    $user = crearUsuarioAdmin();
    $alumno = Alumno::factory()->create();
    $periodo = PeriodoAcademico::create(['nombre' => 'P2026', 'anio' => 2026, 'fecha_inicio' => '2026-01-01', 'fecha_fin' => '2026-12-31', 'estado' => 'ABIERTO']);
    $ciclo = Ciclo::create(['id_periodo' => $periodo->id_periodo, 'nombre' => 'Ciclo Test 2026', 'fecha_inicio' => '2026-01-01', 'fecha_fin' => '2026-12-31', 'costo_base' => 1000]);
    $turno = Turno::create(['nombre' => 'Mañana']);
    $aula = Aula::create(['nombre' => 'Aula 101', 'capacidad' => 30]);

    $matricula = Matricula::create([
        'id_alumno' => $alumno->id_alumno,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_periodo' => $periodo->id_periodo,
        'id_turno' => $turno->id_turno,
        'id_aula' => $aula->id_aula,
        'fecha_matricula' => now()->toDateString(),
        'costo_total' => 1000.00,
        'estado' => 'VIGENTE',
    ]);

    $comprobante = ComprobantePago::create([
        'id_matricula' => $matricula->id_matricula,
        'numero' => 'MAT-0001-01',
        'tipo' => 'RECIBO',
        'concepto' => ConceptoPago::Matricula,
        'fecha_emision' => now()->toDateString(),
        'costo_total' => 1000.00,
        'saldo_pendiente' => 1000.00,
    ]);

    $cuota1 = $comprobante->cuotas()->create(['numero_cuota' => 1, 'monto' => 500.00, 'fecha_vencimiento' => now()->toDateString(), 'estado' => EstadoCuota::Pendiente]);
    $cuota2 = $comprobante->cuotas()->create(['numero_cuota' => 2, 'monto' => 500.00, 'fecha_vencimiento' => now()->addDays(30)->toDateString(), 'estado' => EstadoCuota::Pendiente]);

    // Corregir costo total a 1200
    $response = $this->actingAs($user)->put(route('tesoreria.comprobantes.update', $comprobante->id_comprobante), [
        'costo_total' => 1200.00,
    ]);

    $response->assertRedirect();
    $comprobante->refresh();
    expect((float) $comprobante->costo_total)->toBe(1200.00);
    expect((float) $comprobante->saldo_pendiente)->toBe(1200.00);

    // Verificar que las dos cuotas pendientes se recalcularon a 600 cada una
    expect((float) $cuota1->refresh()->monto)->toBe(600.00);
    expect((float) $cuota2->refresh()->monto)->toBe(600.00);
});
