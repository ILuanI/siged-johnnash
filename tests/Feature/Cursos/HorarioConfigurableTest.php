<?php

use App\Models\Area;
use App\Models\AsignacionDocente;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Configuracion;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Rol;
use App\Models\Turno;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function usuarioAdminHorario(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

test('configurarHorario persiste ventana y recesos', function () {
    $user = usuarioAdminHorario();

    $this->actingAs($user)
        ->post(route('cursos.configuracion.update'), [
            'inicio' => '07:00',
            'fin' => '20:30',
            'recesos' => [
                ['inicio' => '10:15', 'fin' => '10:30', 'etiqueta' => 'Receso'],
            ],
        ])
        ->assertRedirect();

    expect(Configuracion::where('clave', 'horario_ventana_inicio')->value('valor'))->toBe('07:00');
    expect(Configuracion::where('clave', 'horario_ventana_fin')->value('valor'))->toBe('20:30');
    expect(Configuracion::where('clave', 'horario_recesos')->value('valor'))
        ->toBe(json_encode([['inicio' => '10:15', 'fin' => '10:30', 'etiqueta' => 'Receso']]));
});

test('configurarHorario valida que el fin sea posterior al inicio', function () {
    $user = usuarioAdminHorario();

    $this->actingAs($user)
        ->post(route('cursos.configuracion.update'), [
            'inicio' => '20:00',
            'fin' => '08:00',
            'recesos' => [],
        ])
        ->assertSessionHasErrors('fin');
});

test('index filtra por turno', function () {
    $user = usuarioAdminHorario();
    $ciclo = Ciclo::factory()->create();
    $aula = Aula::factory()->create();
    $docente = Docente::factory()->create();
    $turno = Turno::factory()->create(['nombre' => 'Mañana']);
    $otroTurno = Turno::factory()->create(['nombre' => 'Tarde']);

    $cursoTurno = Curso::factory()->create(['nombre' => 'Curso Turno']);
    $asignacionTurno = AsignacionDocente::factory()->create([
        'id_curso' => $cursoTurno->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
        'id_turno' => $turno->id_turno,
    ]);
    $asignacionTurno->horarios()->create(['dia_semana' => 'LUN', 'hora_inicio' => '08:00', 'hora_fin' => '10:00']);

    $cursoOtro = Curso::factory()->create(['nombre' => 'Curso Otro']);
    $asignacionOtro = AsignacionDocente::factory()->create([
        'id_curso' => $cursoOtro->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
        'id_turno' => $otroTurno->id_turno,
    ]);
    $asignacionOtro->horarios()->create(['dia_semana' => 'MAR', 'hora_inicio' => '08:00', 'hora_fin' => '10:00']);

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('cursos.index', ['ciclo' => $ciclo->id_ciclo, 'turno' => $turno->id_turno]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('turnoSeleccionadoId', $turno->id_turno)
            ->has('eventos', 1)
            ->where('eventos.0.nombre', 'Curso Turno'));
});

test('index filtra por area', function () {
    $user = usuarioAdminHorario();
    $ciclo = Ciclo::factory()->create();
    $aula = Aula::factory()->create();
    $docente = Docente::factory()->create();
    $area = Area::factory()->create(['nombre' => 'Ciencias Medicas']);

    $cursoArea = Curso::factory()->create(['nombre' => 'Curso Area', 'id_area' => $area->id_area]);
    $asignacion = AsignacionDocente::factory()->create([
        'id_curso' => $cursoArea->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
    ]);
    $asignacion->horarios()->create(['dia_semana' => 'LUN', 'hora_inicio' => '08:00', 'hora_fin' => '10:00']);

    $cursoSinArea = Curso::factory()->create(['nombre' => 'Curso Sin Area']);
    $asignacion2 = AsignacionDocente::factory()->create([
        'id_curso' => $cursoSinArea->id_curso,
        'id_ciclo' => $ciclo->id_ciclo,
        'id_docente' => $docente->id,
        'id_aula' => $aula->id_aula,
    ]);
    $asignacion2->horarios()->create(['dia_semana' => 'MAR', 'hora_inicio' => '08:00', 'hora_fin' => '10:00']);

    $this->withoutVite()
        ->actingAs($user)
        ->get(route('cursos.index', ['ciclo' => $ciclo->id_ciclo, 'area' => $area->id_area]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('areaSeleccionadaId', $area->id_area)
            ->has('eventos', 1)
            ->where('eventos.0.nombre', 'Curso Area'));
});

test('los recesos no bloquean la creacion de cursos en ese rango', function () {
    $user = usuarioAdminHorario();
    $ciclo = Ciclo::factory()->create();
    $aula = Aula::factory()->create();
    $docente = Docente::factory()->create();

    $this->actingAs($user)
        ->post(route('cursos.configuracion.update'), [
            'inicio' => '07:00',
            'fin' => '20:30',
            'recesos' => [['inicio' => '10:15', 'fin' => '10:30', 'etiqueta' => 'Receso']],
        ]);

    $this->actingAs($user)
        ->post(route('cursos.store'), [
            'nombre' => 'Curso en Receso',
            'area_conoc' => 'Prueba',
            'color' => '#1a237e',
            'id_docente' => $docente->id,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula->id_aula,
            'dias' => ['LUN'],
            'hora_inicio' => '10:15',
            'hora_fin' => '10:30',
        ])
        ->assertRedirect();

    expect(Curso::where('nombre', 'Curso en Receso')->exists())->toBeTrue();
});
