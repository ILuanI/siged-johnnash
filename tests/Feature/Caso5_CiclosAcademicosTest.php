<?php

use App\Enums\EstadoCiclo;
use App\Models\Ciclo;
use App\Models\PeriodoAcademico;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function usuarioAdminCiclos(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

describe('Caso 5: Gestión de Ciclos Académicos', function () {
    test('se puede crear ciclo académico con datos válidos', function () {
        $periodo = PeriodoAcademico::factory()->create();

        $ciclo = Ciclo::create([
            'nombre' => 'Primer Ciclo 2024',
            'id_periodo' => $periodo->id_periodo,
            'fecha_inicio' => '2024-06-10',
            'fecha_fin' => '2024-08-31',
            'costo_base' => 1200,
            'estado' => EstadoCiclo::Abierto,
        ]);

        expect($ciclo->id_ciclo)->not->toBeNull()
            ->and($ciclo->nombre)->toBe('Primer Ciclo 2024')
            ->and($ciclo->estado)->toBe(EstadoCiclo::Abierto);

        $this->assertDatabaseHas('ciclo', [
            'id_ciclo' => $ciclo->id_ciclo,
            'nombre' => 'Primer Ciclo 2024',
        ]);
    });

    test('nombre del ciclo no puede estar vacío', function () {
        $user = usuarioAdminCiclos();
        PeriodoAcademico::factory()->create();

        $this->actingAs($user)
            ->from(route('cursos.index'))
            ->post(route('cursos.ciclos.store'), [
                'nombre' => '',
                'fecha_inicio' => '2024-06-10',
                'fecha_fin' => '2024-08-31',
                'costo_base' => 1200,
            ])
            ->assertRedirect(route('cursos.index'))
            ->assertSessionHasErrors('nombre');
    });

    test('fecha inicio debe ser antes que fecha fin', function () {
        $user = usuarioAdminCiclos();
        PeriodoAcademico::factory()->create();

        $this->actingAs($user)
            ->from(route('cursos.index'))
            ->post(route('cursos.ciclos.store'), [
                'nombre' => 'Primer Ciclo 2024',
                'fecha_inicio' => '2024-08-31',
                'fecha_fin' => '2024-06-10',
                'costo_base' => 1200,
            ])
            ->assertRedirect(route('cursos.index'))
            ->assertSessionHasErrors('fecha_fin');
    });

    test('no se pueden crear ciclos duplicados por nombre', function () {
        $user = usuarioAdminCiclos();
        PeriodoAcademico::factory()->create();
        Ciclo::factory()->create(['nombre' => 'Primer Ciclo 2024']);

        $this->actingAs($user)
            ->from(route('cursos.index'))
            ->post(route('cursos.ciclos.store'), [
                'nombre' => 'Primer Ciclo 2024',
                'fecha_inicio' => '2024-06-10',
                'fecha_fin' => '2024-08-31',
                'costo_base' => 1200,
            ])
            ->assertRedirect(route('cursos.index'))
            ->assertSessionHasErrors('nombre');
    });

    test('se puede actualizar ciclo académico correctamente', function () {
        $ciclo = Ciclo::factory()->create(['estado' => EstadoCiclo::Abierto]);

        $ciclo->update([
            'tipo_ciclo' => 'Intensivo',
            'estado' => EstadoCiclo::EnCurso,
        ]);

        $this->assertDatabaseHas('ciclo', [
            'id_ciclo' => $ciclo->id_ciclo,
            'tipo_ciclo' => 'Intensivo',
            'estado' => EstadoCiclo::EnCurso->value,
        ]);

        expect($ciclo->fresh()->estado)->toBe(EstadoCiclo::EnCurso);
    });

    test('estado del ciclo debe ser válido', function () {
        $ciclo = Ciclo::factory()->create(['estado' => EstadoCiclo::Abierto]);

        expect($ciclo->estado)->toBeInstanceOf(EstadoCiclo::class);
    });
});
