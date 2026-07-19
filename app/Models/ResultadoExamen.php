<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
