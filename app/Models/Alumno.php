<?php

namespace App\Models;

use App\Enums\EstadoAlumno;
use App\Enums\EstadoMatricula;
use Database\Factories\AlumnoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Alumno extends Model
{
    /** @use HasFactory<AlumnoFactory> */
    use HasFactory;

    public $timestamps = false;

    const CREATED_AT = 'creado_en';

    protected $table = 'alumno';

    protected $primaryKey = 'id_alumno';

    protected $fillable = [
        'codigo',
        'nombres',
        'apellidos',
        'dni',
        'fecha_nac',
        'sexo',
        'telefono',
        'correo',
        'direccion',
        'colegio_proc',
        'id_carrera',
        'id_apoderado',
        'estado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_nac' => 'date',
            'estado' => EstadoAlumno::class,
            'creado_en' => 'datetime',
        ];
    }

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'id_carrera', 'id_carrera');
    }

    public function apoderado(): BelongsTo
    {
        return $this->belongsTo(Apoderado::class, 'id_apoderado', 'id_apoderado');
    }

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'id_alumno', 'id_alumno');
    }

    public function matriculaVigente(): HasOne
    {
        return $this->hasOne(Matricula::class, 'id_alumno', 'id_alumno')
            ->where('estado', EstadoMatricula::Vigente)
            ->latestOfMany('fecha_matricula');
    }
}
