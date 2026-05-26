<?php

namespace App\Models;

use Database\Factories\PeriodoAcademicoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PeriodoAcademico extends Model
{
    /** @use HasFactory<PeriodoAcademicoFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'periodo_academico';

    protected $primaryKey = 'id_periodo';

    protected $fillable = [
        'nombre',
        'anio',
        'descripcion',
        'estado',
    ];

    public function ciclos(): HasMany
    {
        return $this->hasMany(Ciclo::class, 'id_periodo', 'id_periodo');
    }

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'id_periodo', 'id_periodo');
    }
}
