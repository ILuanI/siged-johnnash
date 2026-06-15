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

    protected $fillable = [
        'id_comprobante',
        'numero_cuota',
        'monto',
        'fecha_vencimiento',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'fecha_vencimiento' => 'date',
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
