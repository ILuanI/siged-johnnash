<?php

namespace App\Support;

class ModulosSistema
{
    /**
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            'dashboard' => 'Dashboard',
            'docentes' => 'Docentes',
            'estudiantes' => 'Estudiantes',
            'cursos' => 'Cursos',
            'usuarios' => 'Usuarios',
            'roles' => 'Roles',
            'academico' => 'Académico',
            'pagos' => 'Pagos',
            'reportes' => 'Reportes',
            'ajustes' => 'Ajustes',
        ];
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(self::labels());
    }

    /**
     * @return array<string, array{puede_ver: bool, puede_editar: bool, puede_eliminar: bool}>
     */
    public static function permisosCompletos(): array
    {
        return collect(self::keys())
            ->mapWithKeys(fn (string $modulo) => [
                $modulo => [
                    'puede_ver' => true,
                    'puede_editar' => true,
                    'puede_eliminar' => true,
                ],
            ])
            ->all();
    }

    /**
     * @param  array<string, array{puede_ver?: bool, puede_editar?: bool, puede_eliminar?: bool}>  $permisos
     * @return array<string, array{puede_ver: bool, puede_editar: bool, puede_eliminar: bool}>
     */
    public static function normalizar(array $permisos): array
    {
        $normalizados = [];

        foreach (self::keys() as $modulo) {
            $permiso = $permisos[$modulo] ?? [];

            $normalizados[$modulo] = [
                'puede_ver' => (bool) ($permiso['puede_ver'] ?? false),
                'puede_editar' => (bool) ($permiso['puede_editar'] ?? false),
                'puede_eliminar' => (bool) ($permiso['puede_eliminar'] ?? false),
            ];
        }

        return $normalizados;
    }
}
