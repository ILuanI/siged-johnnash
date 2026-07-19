<?php

namespace App\Models;

use Database\Factories\ApoderadoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Apoderado extends Model
{
    /** @use HasFactory<ApoderadoFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'apoderado';

    protected $primaryKey = 'id_apoderado';

    protected $fillable = [
        'nombres',
        'telefono',
    ];

    public function alumnos(): HasMany
    {
        return $this->hasMany(Alumno::class, 'id_apoderado', 'id_apoderado');
    }
}
