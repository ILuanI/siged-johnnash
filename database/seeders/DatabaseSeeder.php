<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolSeeder::class);
        $this->call(MatriculasCatalogoSeeder::class);
        $this->call(DocenteSeeder::class);
        $this->call(CursosCatalogoSeeder::class);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'id_rol' => Rol::query()->where('nombre', 'Administrador')->value('id_rol'),
        ]);
    }
}
