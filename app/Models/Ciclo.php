<?php

namespace App\Models;

use App\Enums\EstadoCiclo;
use Database\Factories\CicloFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ciclo extends Model
{
    /** @use HasFactory<CicloFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'ciclo';

    protected $primaryKey = 'id_ciclo';

    protected $fillable = [
        'id_periodo',
        'nombre',
        'tipo_ciclo',
        'fecha_inicio',
        'fecha_fin',
        'costo_base',
        'estado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'costo_base' => 'decimal:2',
            'estado' => EstadoCiclo::class,
        ];
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(PeriodoAcademico::class, 'id_periodo', 'id_periodo');
    }

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'id_ciclo', 'id_ciclo');
    }
}
