<?php

use App\Models\Matricula;
use App\Models\Rol;
use App\Models\User;
use App\Services\Asistencias\AsistenciaBarcodeService;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolSeeder::class);
});

test('puede marcar y ciclar estados de asistencia manualmente', function () {
    $admin = User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
    $matricula = Matricula::factory()->create();
    $alumno = $matricula->alumno;
    $fecha = now()->toDateString();

    $this->actingAs($admin)
        ->post(route('asistencias.marcar'), [
            'id_alumno' => $alumno->id_alumno,
            'fecha' => $fecha,
            'estado' => 'FALTO',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('asistencia', [
        'dni' => $alumno->dni,
        'estado' => 'FALTO',
    ]);

    $this->actingAs($admin)
        ->post(route('asistencias.marcar'), [
            'id_alumno' => $alumno->id_alumno,
            'fecha' => $fecha,
            'estado' => 'JUSTIFICADO',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('asistencia', [
        'dni' => $alumno->dni,
        'estado' => 'JUSTIFICADO',
    ]);

    expect(
        app(AsistenciaBarcodeService::class)->upsertManual([
            'id_alumno' => $alumno->id_alumno,
            'fecha' => $fecha,
            'estado' => 'TARDANZA',
        ])->estado,
    )->toBe('TARDANZA');
});

test('docente sin permiso de edicion no puede marcar asistencia', function () {
    $rol = Rol::query()->where('nombre', 'Tutor')->firstOrFail();
    $tutor = User::factory()->create(['id_rol' => $rol->id_rol]);
    $matricula = Matricula::factory()->create();

    $this->actingAs($tutor)
        ->post(route('asistencias.marcar'), [
            'id_alumno' => $matricula->id_alumno,
            'fecha' => now()->toDateString(),
            'estado' => 'ASISTIO',
        ])
        ->assertForbidden();
});
