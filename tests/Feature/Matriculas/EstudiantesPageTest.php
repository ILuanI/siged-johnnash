<?php

use App\Models\Alumno;
use App\Models\Area;
use App\Models\Aula;
use App\Models\Carrera;
use App\Models\Ciclo;
use App\Models\ColegioProcedencia;
use App\Models\PeriodoAcademico;
use App\Models\Rol;
use App\Models\Turno;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function usuarioAdminMatriculas(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

function inertiaJsonHeaders(): array
{
    $manifest = public_path('build/manifest.json');

    return [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => file_exists($manifest) ? hash_file('xxh128', $manifest) : '',
    ];
}

test('guests are redirected from estudiantes index', function () {
    $this->get(route('matriculas.estudiantes.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view estudiantes directory', function () {
    $user = usuarioAdminMatriculas();
    Alumno::factory()->create(['nombres' => 'Mateo', 'apellidos' => 'Rojas']);

    $this->actingAs($user)
        ->get(route('matriculas.estudiantes.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('matriculas/estudiantes/index')
            ->has('estudiantes', 1)
            ->where('estudiantes.0.nombres', 'Mateo'));
});

test('estudiantes directory exposes a plain array to inertia json requests', function () {
    $user = usuarioAdminMatriculas();
    Alumno::factory()->create(['nombres' => 'Mateo', 'apellidos' => 'Rojas']);

    $response = $this->actingAs($user)
        ->withHeaders(inertiaJsonHeaders())
        ->get(route('matriculas.estudiantes.index'));

    $response
        ->assertOk()
        ->assertJsonPath('component', 'matriculas/estudiantes/index')
        ->assertJsonPath('props.estudiantes.0.nombres', 'Mateo');
});

test('nueva matricula exposes plain arrays to inertia json requests', function () {
    $user = usuarioAdminMatriculas();
    Alumno::factory()->create(['nombres' => 'Mateo', 'apellidos' => 'Rojas']);
    $periodo = PeriodoAcademico::factory()->create();
    Ciclo::factory()->create(['id_periodo' => $periodo->id_periodo]);
    Turno::factory()->create();
    Aula::factory()->create();

    $response = $this->actingAs($user)
        ->withHeaders(inertiaJsonHeaders())
        ->get(route('matriculas.nueva'));

    $response
        ->assertOk()
        ->assertJsonPath('component', 'matriculas/nueva')
        ->assertJsonPath('props.alumnos.0.nombres', 'Mateo')
        ->assertJsonPath('props.periodos.0.id_periodo', $periodo->id_periodo);
});

test('create estudiante exposes catalog props as plain arrays to inertia json requests', function () {
    $user = usuarioAdminMatriculas();
    $area = Area::factory()->create(['codigo' => 'A']);
    Carrera::factory()->create(['id_area' => $area->id_area, 'nombre' => 'Medicina']);
    ColegioProcedencia::query()->create(['nombre' => 'Colegio Nacional']);

    $response = $this->actingAs($user)
        ->withHeaders(inertiaJsonHeaders())
        ->get(route('matriculas.estudiantes.create'));

    $response
        ->assertOk()
        ->assertJsonPath('component', 'matriculas/estudiantes/create')
        ->assertJsonPath('props.carreras.0.nombre', 'Medicina')
        ->assertJsonPath('props.areas.0.codigo', 'A')
        ->assertJsonPath('props.colegios.0.nombre', 'Colegio Nacional');
});

test('estudiantes index includes consolidado when alumno query is present', function () {
    $user = usuarioAdminMatriculas();
    $alumno = Alumno::factory()->create();

    $this->actingAs($user)
        ->get(route('matriculas.estudiantes.index', ['alumno' => $alumno->id_alumno]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('matriculas/estudiantes/index')
            ->where('alumnoId', $alumno->id_alumno)
            ->has('consolidado.perfil'));
});
