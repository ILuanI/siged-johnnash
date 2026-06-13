<?php

use App\Models\User;
use App\Models\Alumno;
use App\Models\Matricula;
use App\Models\Ciclo;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use App\Models\Aula;
use App\Enums\EstadoMatricula;
use App\Enums\ModalidadMatricula;
use App\Enums\TipoPagoMatricula;
use Illuminate\Foundation\Testing\RefreshDatabase;

describe('Caso 1: Autenticación de Usuario (Login)', function () {

    uses(RefreshDatabase::class);

    test('usuario autenticado puede acceder al dashboard', function () {
        $user = User::factory()->create([
            'email' => 'usuario@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'usuario@example.com',
            'password' => 'Password123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/dashboard');
    });

    test('usuario con credenciales inválidas no puede autenticarse', function () {
        User::factory()->create([
            'email' => 'usuario@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $this->post(route('login'), [
            'email' => 'usuario@example.com',
            'password' => 'ContraseñaIncorrecta',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    });

    test('usuario no registrado no puede autenticarse', function () {
        $this->post(route('login'), [
            'email' => 'noexiste@example.com',
            'password' => 'Password123!',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    });
});
