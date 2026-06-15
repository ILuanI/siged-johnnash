<?php

use App\Models\Asistencia;
use App\Models\Examen;
use App\Models\Matricula;
use App\Models\ResultadoExamen;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('portal de padres muestra últimas asistencias y últimos simulacros', function () {
    $matricula = Matricula::factory()->create();
    $alumno = $matricula->alumno;

    foreach (range(1, 6) as $dia) {
        Asistencia::query()->create([
            'tipo_alumno' => 'INTERNO',
            'dni' => $alumno->dni,
            'id_matricula' => $matricula->id_matricula,
            'fecha' => now()->subDays($dia)->toDateString(),
            'estado' => 'ASISTIO',
            'registrado_en' => now()->subDays($dia),
        ]);
    }

    foreach (range(1, 4) as $numero) {
        $examen = Examen::query()->create([
            'id_ciclo' => $matricula->id_ciclo,
            'tipo' => 'SIMULACRO',
            'numero' => $numero,
            'fecha' => now()->subDays($numero)->toDateString(),
        ]);

        ResultadoExamen::query()->create([
            'id_examen' => $examen->id_examen,
            'id_matricula' => $matricula->id_matricula,
            'puntaje_aptitud' => 8,
            'puntaje_conocimiento' => 9 + $numero,
            'puntaje_total' => 17 + $numero,
            'puesto' => $numero,
        ]);
    }

    $this->withoutVite()
        ->get(route('portal-padres.index', ['dni' => $alumno->dni]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('PortalPadres')
            ->where('alumno.dni', $alumno->dni)
            ->has('asistencias', 5)
            ->has('simulacros', 3));
});
