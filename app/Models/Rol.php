<?php

namespace App\Models;

use App\Support\ModulosSistema;
use Database\Factories\RolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rol extends Model
{
    /** @use HasFactory<RolFactory> */
    use HasFactory;

    protected $table = 'rol';

    protected $primaryKey = 'id_rol';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'id_rol', 'id_rol');
    }

    public function permisos(): HasMany
    {
        return $this->hasMany(RolPermiso::class, 'id_rol', 'id_rol');
    }

    /**
     * @param  array<string, array{puede_ver?: bool, puede_editar?: bool, puede_eliminar?: bool}>  $permisos
     */
    public function sincronizarPermisos(array $permisos): void
    {
        $normalizados = ModulosSistema::normalizar($permisos);

        foreach ($normalizados as $modulo => $permiso) {
            $this->permisos()->updateOrCreate(
                ['modulo' => $modulo],
                $permiso,
            );
        }
    }

    /**
     * @return array<string, array{puede_ver: bool, puede_editar: bool, puede_eliminar: bool}>
     */
    public function permisosPorModulo(): array
    {
        $permisos = ModulosSistema::normalizar([]);

        foreach ($this->permisos as $permiso) {
            $permisos[$permiso->modulo] = [
                'puede_ver' => $permiso->puede_ver,
                'puede_editar' => $permiso->puede_editar,
                'puede_eliminar' => $permiso->puede_eliminar,
            ];
        }

        return $permisos;
    }

    public function getRouteKeyName(): string
    {
        return 'id_rol';
    }
}
