<?php

namespace App\Models;

use Database\Factories\CarreraFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Carrera extends Model
{
    /** @use HasFactory<CarreraFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'carrera';

    protected $primaryKey = 'id_carrera';

    protected $fillable = [
        'id_area',
        'nombre',
        'puntaje_min',
        'puntaje_max',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'puntaje_min' => 'decimal:3',
            'puntaje_max' => 'decimal:3',
        ];
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    public function alumnos(): HasMany
    {
        return $this->hasMany(Alumno::class, 'id_carrera', 'id_carrera');
    }
}
