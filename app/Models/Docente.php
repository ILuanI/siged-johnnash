<?php

namespace App\Models;

use Database\Factories\DocenteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Docente extends Model
{
    /** @use HasFactory<DocenteFactory> */
    use HasFactory;

    protected $fillable = [
        'nombres',
        'apellidos',
        'correo',
        'telefono',
        'dni',
        'curso_id',
    ];

    public function asignaciones(): HasMany
    {
        return $this->hasMany(AsignacionDocente::class, 'id_docente', 'id');
    }
}
