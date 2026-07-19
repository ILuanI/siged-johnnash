<?php

use App\Models\User;
use Database\Seeders\CredencialesTestSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('siembra credenciales de prueba por rol sin duplicar usuarios', function () {
    $this->seed(RolSeeder::class);

    $this->seed(CredencialesTestSeeder::class);
    $this->seed(CredencialesTestSeeder::class);

    $credenciales = [
        'admin@johnnash.test' => 'Administrador',
        'director@johnnash.test' => 'Director',
        'cajero@johnnash.test' => 'Cajero',
        'docente@johnnash.test' => 'Docente',
        'tutor@johnnash.test' => 'Tutor',
    ];

    expect(User::query()->count())->toBe(count($credenciales));

    foreach ($credenciales as $email => $rolEsperado) {
        $usuario = User::query()
            ->with('rol')
            ->where('email', $email)
            ->first();

        expect($usuario)->not->toBeNull();
        expect($usuario->estado)->toBe('ACTIVO');
        expect($usuario->rol?->nombre)->toBe($rolEsperado);
        expect(Hash::check('password', $usuario->password))->toBeTrue();
    }
});
