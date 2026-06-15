<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class CredencialesTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rolesPorNombre = Rol::query()->pluck('id_rol', 'nombre');

        foreach ($this->credenciales() as $credencial) {
            $idRol = $rolesPorNombre->get($credencial['rol']);

            if ($idRol === null) {
                throw new RuntimeException("No existe el rol [{$credencial['rol']}] para sembrar credenciales de prueba.");
            }

            User::query()->updateOrCreate(
                ['email' => $credencial['email']],
                [
                    'name' => $credencial['name'],
                    'password' => 'password',
                    'estado' => 'ACTIVO',
                    'email_verified_at' => now(),
                    'id_rol' => $idRol,
                ],
            );
        }
    }

    /**
     * @return list<array{name: string, email: string, rol: string}>
     */
    private function credenciales(): array
    {
        return [
            [
                'name' => 'Administrador SIGED',
                'email' => 'admin@johnnash.test',
                'rol' => 'Administrador',
            ],
            [
                'name' => 'Director SIGED',
                'email' => 'director@johnnash.test',
                'rol' => 'Director',
            ],
            [
                'name' => 'Cajero SIGED',
                'email' => 'cajero@johnnash.test',
                'rol' => 'Cajero',
            ],
            [
                'name' => 'Docente SIGED',
                'email' => 'docente@johnnash.test',
                'rol' => 'Docente',
            ],
            [
                'name' => 'Tutor SIGED',
                'email' => 'tutor@johnnash.test',
                'rol' => 'Tutor',
            ],
        ];
    }
}
