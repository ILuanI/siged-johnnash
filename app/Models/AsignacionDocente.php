<?php

namespace App\Models;

use Database\Factories\AsignacionDocenteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AsignacionDocente extends Model
{
    /** @use HasFactory<AsignacionDocenteFactory> */
    use HasFactory;

    protected $table = 'asignacion_docente';

    protected $primaryKey = 'id_asignacion';

    protected $fillable = [
        'id_docente',
        'id_curso',
        'id_ciclo',
        'id_aula',
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'id_docente', 'id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'id_curso', 'id_curso');
    }

    public function ciclo(): BelongsTo
    {
        return $this->belongsTo(Ciclo::class, 'id_ciclo', 'id_ciclo');
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class, 'id_aula', 'id_aula');
    }

    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class, 'id_asignacion', 'id_asignacion');
    }
}
