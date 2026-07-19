<?php

use App\Models\AsignacionDocente;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function usuarioAdminCursos(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

test('guests are redirected from cursos index', function () {
    $this->get(route('cursos.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view cursos schedule', function () {
    $user = usuarioAdminCursos();
    $ciclo = Ciclo::factory()->create(['nombre' => 'Ciclo Verano 2026']);
    $aula = Aula::factory()->create(['nombre' => 'Aula 101']);
    $docente = Docente::factory()->create(['nombres' => 'Pedro', 'apellidos' => 'Silva']);
    $curso = Curso::factory()->create(['nombre' => 'Algebra', 'area_conoc' => 'Matematica']);

    $asignacion = AsignacionDocente::factory()->create([
        'id_curso' => $curso->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
    ]);

    $asignacion->horarios()->create([
        'dia_semana' => 'LUN',
        'hora_inicio' => '08:00',
        'hora_fin' => '10:00',
    ]);

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('cursos.index', ['ciclo' => $ciclo->id_ciclo]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cursos/index')
            ->has('cursos', 1)
            ->where('cursos.0.nombre', 'Algebra')
            ->where('eventos.0.docente_nombre', 'Pedro Silva'));
});

test('authenticated users can create a course with teacher assignment and schedule', function () {
    $user = usuarioAdminCursos();
    $ciclo = Ciclo::factory()->create();
    $aula = Aula::factory()->create();
    $docente = Docente::factory()->create();

    $this->actingAs($user)
        ->post(route('cursos.store'), [
            'nombre' => 'Trigonometria',
            'area_conoc' => 'Matematica',
            'color' => '#1a237e',
            'id_docente' => $docente->id,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula->id_aula,
            'dias' => ['LUN', 'MIE'],
            'hora_inicio' => '08:00',
            'hora_fin' => '10:00',
        ])
        ->assertRedirect(route('cursos.index', ['ciclo' => $ciclo->id_ciclo]));

    $curso = Curso::query()->where('nombre', 'Trigonometria')->firstOrFail();

    expect($curso->asignaciones)->toHaveCount(1)
        ->and($curso->asignaciones->first()->horarios)->toHaveCount(2);
});

test('authenticated users can update a course schedule', function () {
    $user = usuarioAdminCursos();
    $ciclo = Ciclo::factory()->create();
    $aula = Aula::factory()->create();
    $docente = Docente::factory()->create();
    $curso = Curso::factory()->create(['nombre' => 'Aritmetica']);
    $asignacion = AsignacionDocente::factory()->create([
        'id_curso' => $curso->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
    ]);
    $asignacion->horarios()->create([
        'dia_semana' => 'LUN',
        'hora_inicio' => '08:00',
        'hora_fin' => '10:00',
    ]);

    $this->actingAs($user)
        ->put(route('cursos.update', $curso), [
            'nombre' => 'Aritmetica Intensiva',
            'area_conoc' => 'Matematica',
            'color' => '#ff7043',
            'id_docente' => $docente->id,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula->id_aula,
            'dias' => ['VIE'],
            'hora_inicio' => '10:30',
            'hora_fin' => '12:00',
        ])
        ->assertRedirect(route('cursos.index', ['ciclo' => $ciclo->id_ciclo]));

    $curso->refresh();

    expect($curso->nombre)->toBe('Aritmetica Intensiva')
        ->and($curso->asignaciones()->first()->horarios()->first()->dia_semana)->toBe('VIE');
});

test('updating a course in another cycle creates a new assignment', function () {
    $user = usuarioAdminCursos();
    $cicloInicial = Ciclo::factory()->create();
    $cicloNuevo = Ciclo::factory()->create();
    $aulaInicial = Aula::factory()->create();
    $aulaNueva = Aula::factory()->create();
    $docenteInicial = Docente::factory()->create();
    $docenteNuevo = Docente::factory()->create();
    $curso = Curso::factory()->create(['nombre' => 'Razonamiento Matematico']);

    $asignacionInicial = AsignacionDocente::factory()->create([
        'id_curso' => $curso->id_curso,
        'id_ciclo' => $cicloInicial->id_ciclo,
        'id_docente' => $docenteInicial->id,
        'id_aula' => $aulaInicial->id_aula,
    ]);

    $asignacionInicial->horarios()->create([
        'dia_semana' => 'LUN',
        'hora_inicio' => '08:00',
        'hora_fin' => '10:00',
    ]);

    $this->actingAs($user)
        ->put(route('cursos.update', $curso), [
            'nombre' => 'Razonamiento Matematico',
            'area_conoc' => 'Matematica',
            'color' => '#1a237e',
            'id_docente' => $docenteNuevo->id,
            'id_ciclo' => $cicloNuevo->id_ciclo,
            'id_aula' => $aulaNueva->id_aula,
            'dias' => ['MIE'],
            'hora_inicio' => '10:30',
            'hora_fin' => '12:00',
        ])
        ->assertRedirect(route('cursos.index', ['ciclo' => $cicloNuevo->id_ciclo]));

    expect($curso->asignaciones()->count())->toBe(2)
        ->and($asignacionInicial->fresh()->id_ciclo)->toBe($cicloInicial->id_ciclo)
        ->and($curso->asignaciones()->where('id_ciclo', $cicloNuevo->id_ciclo)->first()->horarios()->first()->dia_semana)->toBe('MIE');
});

test('course schedule rejects teacher overlap in the same cycle', function () {
    $user = usuarioAdminCursos();
    $ciclo = Ciclo::factory()->create();
    $aula = Aula::factory()->create();
    $otraAula = Aula::factory()->create();
    $docente = Docente::factory()->create();
    $curso = Curso::factory()->create(['nombre' => 'Fisica']);
    $asignacion = AsignacionDocente::factory()->create([
        'id_curso' => $curso->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
    ]);

    $asignacion->horarios()->create([
        'dia_semana' => 'LUN',
        'hora_inicio' => '08:00',
        'hora_fin' => '10:00',
    ]);

    $this->actingAs($user)
        ->from(route('cursos.index', ['ciclo' => $ciclo->id_ciclo]))
        ->post(route('cursos.store'), [
            'nombre' => 'Quimica',
            'area_conoc' => 'Ciencias',
            'color' => '#0288d1',
            'id_docente' => $docente->id,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $otraAula->id_aula,
            'dias' => ['LUN'],
            'hora_inicio' => '09:00',
            'hora_fin' => '11:00',
        ])
        ->assertRedirect(route('cursos.index', ['ciclo' => $ciclo->id_ciclo]))
        ->assertSessionHasErrors('id_docente');
});
