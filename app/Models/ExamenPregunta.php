<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamenPregunta extends Model
{
    protected $table = 'examen_pregunta';

    protected $primaryKey = 'id_pregunta';

    protected $fillable = [
        'id_examen',
        'numero',
        'clave_correcta',
        'puntos',
    ];

    protected function casts(): array
    {
        return [
            'puntos' => 'float',
        ];
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class, 'id_examen', 'id_examen');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(ExamenRespuesta::class, 'id_pregunta', 'id_pregunta');
    }
}
