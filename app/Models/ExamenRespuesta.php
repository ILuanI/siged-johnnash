<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamenRespuesta extends Model
{
    protected $table = 'examen_respuesta';

    protected $primaryKey = 'id_respuesta';

    public $timestamps = true;

    protected $fillable = [
        'id_resultado',
        'id_pregunta',
        'numero',
        'respuesta',
        'puntos_obtenidos',
        'marca',
    ];

    protected function casts(): array
    {
        return [
            'puntos_obtenidos' => 'float',
            'numero' => 'integer',
        ];
    }

    public function resultado(): BelongsTo
    {
        return $this->belongsTo(ResultadoExamen::class, 'id_resultado', 'id_resultado');
    }

    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(ExamenPregunta::class, 'id_pregunta', 'id_pregunta');
    }

    public function esCorrecta(): bool
    {
        return $this->marca === 'C';
    }
}
