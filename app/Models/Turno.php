<?php

namespace App\Models;

use Database\Factories\TurnoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Turno extends Model
{
    /** @use HasFactory<TurnoFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'turno';

    protected $primaryKey = 'id_turno';

    protected $fillable = [
        'nombre',
        'hora_inicio',
        'hora_fin',
    ];

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'id_turno', 'id_turno');
    }
}
