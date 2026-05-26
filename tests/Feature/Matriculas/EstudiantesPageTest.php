<?php

use App\Models\Alumno;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from estudiantes index', function () {
    $this->get(route('matriculas.estudiantes.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view estudiantes directory', function () {
    $user = User::factory()->create();
    Alumno::factory()->create(['nombres' => 'Mateo', 'apellidos' => 'Rojas']);

    $this->actingAs($user)
        ->get(route('matriculas.estudiantes.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('matriculas/estudiantes/index')
            ->has('estudiantes', 1)
            ->where('estudiantes.0.nombres', 'Mateo'));
});

test('estudiantes index includes consolidado when alumno query is present', function () {
    $user = User::factory()->create();
    $alumno = Alumno::factory()->create();

    $this->actingAs($user)
        ->get(route('matriculas.estudiantes.index', ['alumno' => $alumno->id_alumno]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('matriculas/estudiantes/index')
            ->where('alumnoId', $alumno->id_alumno)
            ->has('consolidado.perfil'));
});
