<?php

namespace App\Models;

use Database\Factories\AulaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aula extends Model
{
    /** @use HasFactory<AulaFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'aula';

    protected $primaryKey = 'id_aula';

    protected $fillable = [
        'nombre',
        'capacidad',
    ];

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'id_aula', 'id_aula');
    }
}
