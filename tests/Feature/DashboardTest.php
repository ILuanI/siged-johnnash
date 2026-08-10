<?php

use App\Enums\ConceptoPago;
use App\Enums\EstadoCuota;
use App\Models\Ciclo;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use App\Models\Matricula;
use App\Models\Pago;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function usuarioAdminDashboard(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = usuarioAdminDashboard();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard expone la recaudación por concepto del ciclo seleccionado', function () {
    $user = usuarioAdminDashboard();
    $this->actingAs($user);

    $ciclo = Ciclo::factory()->create(['estado' => 'ABIERTO']);
    $matricula = Matricula::factory()->create([
        'id_ciclo' => $ciclo->id_ciclo,
        'estado' => 'VIGENTE',
        'costo_total' => 1000,
    ]);

    // Comprobante MATRICULA con pago
    $compMat = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'concepto' => ConceptoPago::Matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuotaMat = Cuota::factory()->create([
        'id_comprobante' => $compMat->id_comprobante,
        'monto' => 500,
        'estado' => EstadoCuota::Pagada,
    ]);
    Pago::factory()->create(['id_cuota' => $cuotaMat->id_cuota, 'monto' => 500, 'estado' => 'PAGADO']);

    // Comprobante SIMULACRO + pago (100)
    $compSimulacro = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'concepto' => ConceptoPago::Simulacro,
        'costo_total' => 100,
        'saldo_pendiente' => 0,
    ]);
    $cuotaSim = Cuota::factory()->create([
        'id_comprobante' => $compSimulacro->id_comprobante,
        'monto' => 100,
        'estado' => EstadoCuota::Pagada,
    ]);
    Pago::factory()->create(['id_cuota' => $cuotaSim->id_cuota, 'monto' => 100, 'estado' => 'PAGADO']);

    // Comprobante CARNET + pago (30)
    $compCarnet = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'concepto' => ConceptoPago::Carnet,
        'costo_total' => 30,
        'saldo_pendiente' => 0,
    ]);
    $cuotaCar = Cuota::factory()->create([
        'id_comprobante' => $compCarnet->id_comprobante,
        'monto' => 30,
        'estado' => EstadoCuota::Pagada,
    ]);
    Pago::factory()->create(['id_cuota' => $cuotaCar->id_cuota, 'monto' => 30, 'estado' => 'PAGADO']);

    // Comprobante EXTRAORDINARIO + pago (25.50)
    $compExtra = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'concepto' => ConceptoPago::Extraordinario,
        'costo_total' => 25.5,
        'saldo_pendiente' => 0,
    ]);
    $cuotaExt = Cuota::factory()->create([
        'id_comprobante' => $compExtra->id_comprobante,
        'monto' => 25.5,
        'estado' => EstadoCuota::Pagada,
    ]);
    Pago::factory()->create(['id_cuota' => $cuotaExt->id_cuota, 'monto' => 25.5, 'estado' => 'PAGADO']);

    // Pago ANULADO que NO debe contar en la recaudación
    Pago::factory()->create(['id_cuota' => $cuotaMat->id_cuota, 'monto' => 999, 'estado' => 'ANULADO']);

    $response = $this->get(route('dashboard', ['id_ciclo' => $ciclo->id_ciclo]));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('kpis.recaudacion_por_concepto.matricula', 500)
        ->where('kpis.recaudacion_por_concepto.simulacros', 100)
        ->where('kpis.recaudacion_por_concepto.carnet', 30)
        ->where('kpis.recaudacion_por_concepto.otros', 25.5)
        // 655.50 recaudado (sin el ANULADO de 999) sobre 1000 de costo
        ->where('kpis.tasa_recaudacion', 65.55));
});

test('dashboard deja en 0.0 los conceptos sin pagos', function () {
    $user = usuarioAdminDashboard();
    $this->actingAs($user);

    $ciclo = Ciclo::factory()->create(['estado' => 'ABIERTO']);
    $matricula = Matricula::factory()->create([
        'id_ciclo' => $ciclo->id_ciclo,
        'estado' => 'VIGENTE',
        'costo_total' => 500,
    ]);

    // Solo un pago de matrícula; el resto de conceptos sin pagos
    $compMatricula = ComprobantePago::factory()->create([
        'id_matricula' => $matricula->id_matricula,
        'concepto' => ConceptoPago::Matricula,
        'costo_total' => 500,
        'saldo_pendiente' => 0,
    ]);
    $cuotaMat = Cuota::factory()->create([
        'id_comprobante' => $compMatricula->id_comprobante,
        'monto' => 500,
        'estado' => EstadoCuota::Pagada,
    ]);
    Pago::factory()->create(['id_cuota' => $cuotaMat->id_cuota, 'monto' => 500, 'estado' => 'PAGADO']);

    $response = $this->get(route('dashboard', ['id_ciclo' => $ciclo->id_ciclo]));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('kpis.recaudacion_por_concepto.matricula', 500)
        ->where('kpis.recaudacion_por_concepto.simulacros', 0)
        ->where('kpis.recaudacion_por_concepto.carnet', 0)
        ->where('kpis.recaudacion_por_concepto.otros', 0));
});
