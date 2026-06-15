<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ColegioProcedencia extends Model
{
    public $timestamps = false;

    protected $table = 'colegio_procedencia';

    protected $primaryKey = 'id_colegio_procedencia';

    protected $fillable = [
        'nombre',
    ];

    public function alumnos(): HasMany
    {
        return $this->hasMany(Alumno::class, 'colegio_procedencia_id', 'id_colegio_procedencia');
    }
}
