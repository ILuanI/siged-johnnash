<?php

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Carrera;
use App\Services\Bi\AreaMetricsService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('cuenta alumnos activos por área eficientemente', function () {
    $areaCiencias = Area::factory()->create(['codigo' => 'A', 'nombre' => 'Ciencias']);
    $areaLetras = Area::factory()->create(['codigo' => 'B', 'nombre' => 'Letras']);
    $carreraMedicina = Carrera::factory()->create(['id_area' => $areaCiencias->id_area]);
    $carreraDerecho = Carrera::factory()->create(['id_area' => $areaLetras->id_area]);

    Alumno::factory()->create(['id_carrera' => $carreraMedicina->id_carrera, 'estado' => EstadoAlumno::Activo]);
    Alumno::factory()->create(['id_carrera' => $carreraMedicina->id_carrera, 'estado' => EstadoAlumno::Matriculado]);
    Alumno::factory()->create(['id_carrera' => $carreraMedicina->id_carrera, 'estado' => EstadoAlumno::Retirado]);
    Alumno::factory()->create(['id_carrera' => $carreraDerecho->id_carrera, 'estado' => EstadoAlumno::Activo]);

    $metricas = app(AreaMetricsService::class)->alumnosActivosPorArea();

    expect($metricas->firstWhere('id_area', $areaCiencias->id_area)['total_alumnos_activos'])->toBe(2)
        ->and($metricas->firstWhere('id_area', $areaLetras->id_area)['total_alumnos_activos'])->toBe(1);
});
