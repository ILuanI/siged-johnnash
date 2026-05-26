<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Apoderado extends Model
{
    public $timestamps = false;

    protected $table = 'apoderado';

    protected $primaryKey = 'id_apoderado';

    protected $fillable = [
        'nombres',
        'dni',
        'telefono',
        'parentesco',
        'correo',
    ];

    public function alumnos(): HasMany
    {
        return $this->hasMany(Alumno::class, 'id_apoderado', 'id_apoderado');
    }
}
