<?php

namespace App\Models;

use Database\Factories\HorarioFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Horario extends Model
{
    /** @use HasFactory<HorarioFactory> */
    use HasFactory;

    protected $table = 'horario';

    protected $primaryKey = 'id_horario';

    protected $fillable = [
        'id_asignacion',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
    ];

    public function asignacion(): BelongsTo
    {
        return $this->belongsTo(AsignacionDocente::class, 'id_asignacion', 'id_asignacion');
    }
}
