<?php

use App\Models\Alumno;
use App\Models\Area;
use App\Models\Carrera;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\MatriculasCatalogoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function catalogoAdminUser(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

function catalogoInertiaHeaders(): array
{
    $manifest = public_path('build/manifest.json');

    return [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => file_exists($manifest) ? hash_file('xxh128', $manifest) : '',
    ];
}

test('seed creates fixed academic areas and careers', function () {
    $this->seed(MatriculasCatalogoSeeder::class);

    expect(Area::query()->pluck('nombre', 'codigo')->all())->toMatchArray([
        'A' => 'Ciencias Medicas',
        'B' => 'Ingenierias',
        'C' => 'Finanzas',
        'D' => 'Letras',
    ]);

    expect(Carrera::query()->whereRelation('area', 'codigo', 'A')->count())->toBeGreaterThan(0);
});

test('catalogo page exposes areas with nested carreras as plain arrays', function () {
    $user = catalogoAdminUser();
    $this->seed(MatriculasCatalogoSeeder::class);

    $response = $this->actingAs($user)
        ->withHeaders(catalogoInertiaHeaders())
        ->get(route('matriculas.catalogo.index'));

    $response
        ->assertOk()
        ->assertJsonPath('component', 'matriculas/catalogo')
        ->assertJsonPath('props.areas.0.codigo', 'A')
        ->assertJsonCount(4, 'props.areas')
        ->assertJsonStructure([
            'props' => [
                'areas' => [
                    '*' => ['id_area', 'codigo', 'nombre', 'carreras'],
                ],
            ],
        ]);
});

test('admin can update carrera area for academic catalog maintenance', function () {
    $user = catalogoAdminUser();
    $areaA = Area::factory()->create(['codigo' => 'A', 'nombre' => 'Ciencias Medicas']);
    $areaB = Area::factory()->create(['codigo' => 'B', 'nombre' => 'Ingenierias']);
    $carrera = Carrera::factory()->create([
        'id_area' => $areaA->id_area,
        'nombre' => 'Medicina Humana',
    ]);

    $this->actingAs($user)
        ->patch(route('matriculas.carreras.update', $carrera), [
            'nombre' => 'Medicina Humana',
            'id_area' => $areaB->id_area,
            'puntaje_min' => 11,
            'puntaje_max' => 19,
        ])
        ->assertRedirect();

    $carrera->refresh();

    expect($carrera->id_area)->toBe($areaB->id_area)
        ->and((float) $carrera->puntaje_min)->toBe(11.0)
        ->and((float) $carrera->puntaje_max)->toBe(19.0);
});

test('admin can change student career after registration', function () {
    $user = catalogoAdminUser();
    $carreraInicial = Carrera::factory()->create(['nombre' => 'Medicina Humana']);
    $carreraNueva = Carrera::factory()->create(['nombre' => 'Ingenieria de Sistemas']);
    $alumno = Alumno::factory()->create(['id_carrera' => $carreraInicial->id_carrera]);

    $this->actingAs($user)
        ->patch(route('matriculas.estudiantes.carrera.update', $alumno), [
            'id_carrera' => $carreraNueva->id_carrera,
        ])
        ->assertRedirect();

    expect($alumno->refresh()->id_carrera)->toBe($carreraNueva->id_carrera);
});
