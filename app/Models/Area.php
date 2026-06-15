<?php

namespace App\Models;

use Database\Factories\AreaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    /** @use HasFactory<AreaFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $table = 'area';

    protected $primaryKey = 'id_area';

    protected $fillable = [
        'codigo',
        'nombre',
    ];

    public function carreras(): HasMany
    {
        return $this->hasMany(Carrera::class, 'id_area', 'id_area');
    }
}
