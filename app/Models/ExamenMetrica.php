<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamenMetrica extends Model
{
    use HasFactory;

    protected $table = 'examen_metrica';

    protected $primaryKey = 'id_metrica';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'puntaje_max' => 'float',
            'puntaje_min' => 'float',
        ];
    }

    public function examen(): BelongsTo
    {
        return $this->belongsTo(Examen::class, 'id_examen', 'id_examen');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }
}
