<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolPermiso extends Model
{
    protected $table = 'rol_permiso';

    protected $fillable = [
        'id_rol',
        'modulo',
        'puede_ver',
        'puede_editar',
        'puede_eliminar',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'puede_ver' => 'boolean',
            'puede_editar' => 'boolean',
            'puede_eliminar' => 'boolean',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }
}
