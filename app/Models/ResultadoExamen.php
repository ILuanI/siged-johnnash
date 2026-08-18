<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class ResultadoExamen extends Model
{
    use HasFactory;

    protected $table = 'resultado_examen';

    protected $primaryKey = 'id_resultado';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'puntaje_aptitud' => 'float',
            'puntaje_conocimiento' => 'float',
            'puntaje_total' => 'float',
            'puntaje_posible' => 'float',
            'porcentaje' => 'float',
        ];
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class, 'id_examen', 'id_examen');
    }

    public function matricula(): BelongsTo
    {
        return $this->belongsTo(Matricula::class, 'id_matricula', 'id_matricula');
    }

    public function alumno(): HasOneThrough
    {
        return $this->hasOneThrough(
            Alumno::class,
            Matricula::class,
            'id_matricula',
            'id_alumno',
            'id_matricula',
            'id_alumno'
        );
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(ExamenRespuesta::class, 'id_resultado', 'id_resultado');
    }
}
