<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Examen extends Model
{
    use HasFactory;

    protected $table = 'examen';

    protected $primaryKey = 'id_examen';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }

    public function ciclo(): BelongsTo
    {
        return $this->belongsTo(Ciclo::class, 'id_ciclo', 'id_ciclo');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function resultados(): HasMany
    {
        return $this->hasMany(ResultadoExamen::class, 'id_examen', 'id_examen');
    }

    public function metricas(): HasMany
    {
        return $this->hasMany(ExamenMetrica::class, 'id_examen', 'id_examen');
    }
}
