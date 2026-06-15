<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrediccionDesercion extends Model
{
    use HasFactory;

    protected $table = 'prediccion_desercion';

    protected $primaryKey = 'id_prediccion';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha_calculo' => 'datetime',
            'riesgo_pct' => 'float',
            'prioritario' => 'boolean',
            'tasa_asistencia' => 'float',
            'promedio_examenes' => 'float',
        ];
    }

    public function matricula(): BelongsTo
    {
        return $this->belongsTo(Matricula::class, 'id_matricula', 'id_matricula');
    }
}
