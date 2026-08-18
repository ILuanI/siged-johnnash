<?php

namespace App\Models;

use Database\Factories\CursoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Curso extends Model
{
    /** @use HasFactory<CursoFactory> */
    use HasFactory;

    protected $table = 'curso';

    protected $primaryKey = 'id_curso';

    protected $fillable = [
        'nombre',
        'area_conoc',
        'id_area',
        'color',
    ];

    public function asignaciones(): HasMany
    {
        return $this->hasMany(AsignacionDocente::class, 'id_curso', 'id_curso');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }
}
