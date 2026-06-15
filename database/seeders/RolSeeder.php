<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Support\ModulosSistema;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso completo al sistema',
                'permisos' => ModulosSistema::permisosCompletos(),
            ],
            [
                'nombre' => 'Director',
                'descripcion' => 'Supervisión académica y reportes',
                'permisos' => $this->permisos([
                    'dashboard' => ['puede_ver' => true],
                    'docentes' => ['puede_ver' => true, 'puede_editar' => true],
                    'estudiantes' => ['puede_ver' => true, 'puede_editar' => true],
                    'cursos' => ['puede_ver' => true, 'puede_editar' => true],
                    'reportes' => ['puede_ver' => true],
                ]),
            ],
            [
                'nombre' => 'Cajero',
                'descripcion' => 'Gestión de pagos y comprobantes',
                'permisos' => $this->permisos([
                    'dashboard' => ['puede_ver' => true],
                    'pagos' => ['puede_ver' => true, 'puede_editar' => true],
                ]),
            ],
            [
                'nombre' => 'Docente',
                'descripcion' => 'Acceso a cursos y docentes',
                'permisos' => $this->permisos([
                    'dashboard' => ['puede_ver' => true],
                    'docentes' => ['puede_ver' => true],
                    'cursos' => ['puede_ver' => true, 'puede_editar' => true],
                ]),
            ],
            [
                'nombre' => 'Tutor',
                'descripcion' => 'Seguimiento de estudiantes asignados',
                'permisos' => $this->permisos([
                    'dashboard' => ['puede_ver' => true],
                    'estudiantes' => ['puede_ver' => true, 'puede_editar' => true],
                ]),
            ],
        ];

        foreach ($roles as $rolData) {
            $rol = Rol::query()->firstOrCreate(
                ['nombre' => $rolData['nombre']],
                ['descripcion' => $rolData['descripcion']],
            );

            $rol->sincronizarPermisos($rolData['permisos']);
        }
    }

    /**
     * @param  array<string, array{puede_ver?: bool, puede_editar?: bool, puede_eliminar?: bool}>  $permisos
     * @return array<string, array{puede_ver: bool, puede_editar: bool, puede_eliminar: bool}>
     */
    private function permisos(array $permisos): array
    {
        return ModulosSistema::normalizar($permisos);
    }
}
