<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Egreso extends Model
{
    use HasFactory;

    protected $table = 'egreso';

    protected $primaryKey = 'id_egreso';

    public $incrementing = true;

    protected $guarded = [];

    protected $appends = ['concepto'];

    public function getConceptoAttribute(): string
    {
        return $this->tipo_egreso ?? '';
    }

    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
            'cantidad' => 'float',
            'precio' => 'float',
            'igv' => 'float',
            'total' => 'float',
            'aplica_igv' => 'boolean',
            'igv_porcentaje' => 'float',
            'igv_tipo' => 'string',
            'estado' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function auditorias(): HasMany
    {
        return $this->hasMany(AuditoriaEgreso::class, 'egreso_id', 'id_egreso');
    }
}
