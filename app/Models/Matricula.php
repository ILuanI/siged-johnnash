<?php

namespace App\Models;

use App\Enums\EstadoMatricula;
use App\Enums\ModalidadMatricula;
use App\Enums\TipoPagoMatricula;
use Database\Factories\MatriculaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Matricula extends Model
{
    /** @use HasFactory<MatriculaFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'matricula';

    protected $primaryKey = 'id_matricula';

    protected $fillable = [
        'id_alumno',
        'id_ciclo',
        'id_periodo',
        'id_turno',
        'id_aula',
        'fecha_matricula',
        'modalidad',
        'tipo_pago',
        'costo_total',
        'estado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_matricula' => 'date',
            'modalidad' => ModalidadMatricula::class,
            'tipo_pago' => TipoPagoMatricula::class,
            'costo_total' => 'decimal:2',
            'estado' => EstadoMatricula::class,
        ];
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'id_alumno', 'id_alumno');
    }

    public function ciclo(): BelongsTo
    {
        return $this->belongsTo(Ciclo::class, 'id_ciclo', 'id_ciclo');
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(PeriodoAcademico::class, 'id_periodo', 'id_periodo');
    }

    public function turno(): BelongsTo
    {
        return $this->belongsTo(Turno::class, 'id_turno', 'id_turno');
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class, 'id_aula', 'id_aula');
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class, 'id_matricula', 'id_matricula');
    }

    public function resultadosExamen(): HasMany
    {
        return $this->hasMany(ResultadoExamen::class, 'id_matricula', 'id_matricula');
    }

    public function comprobantePago(): HasOne
    {
        return $this->hasOne(ComprobantePago::class, 'id_matricula', 'id_matricula');
    }
}
