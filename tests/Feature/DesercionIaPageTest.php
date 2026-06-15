<?php

use App\Enums\EstadoMatricula;
use App\Models\Asistencia;
use App\Models\Matricula;
use App\Models\Rol;
use App\Models\User;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function iaAdminUser(): User
{
    test()->seed(RolSeeder::class);

    return User::factory()->create([
        'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
    ]);
}

test('ia dropout page recalculates and exposes priority list', function () {
    $user = iaAdminUser();
    $matricula = Matricula::factory()->create(['estado' => EstadoMatricula::Vigente]);

    foreach (range(1, 12) as $day) {
        Asistencia::query()->create([
            'tipo_alumno' => 'INTERNO',
            'dni' => $matricula->alumno->dni,
            'id_matricula' => $matricula->id_matricula,
            'id_asignacion' => null,
            'fecha' => today()->subDays($day),
            'estado' => 'FALTO',
            'registrado_en' => now(),
        ]);
    }

    $this->actingAs($user)
        ->get(route('ia.desercion.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('ia/desercion')
            ->where('procesados', 1)
            ->has('resumen')
            ->where('resumen.total', 1));
});
