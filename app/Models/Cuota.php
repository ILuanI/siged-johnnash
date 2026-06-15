<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cuota extends Model
{
    use HasFactory;

    protected $table = 'cuota';

    protected $primaryKey = 'id_cuota';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'monto' => 'float',
            'fecha_venc' => 'date',
        ];
    }

    public function comprobantePago(): BelongsTo
    {
        return $this->belongsTo(ComprobantePago::class, 'id_comprobante', 'id_comprobante');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'id_cuota', 'id_cuota');
    }
}
