<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComprobantePago extends Model
{
    use HasFactory;

    protected $table = 'comprobante_pago';

    protected $primaryKey = 'id_comprobante';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'costo_total' => 'float',
            'saldo_pendiente' => 'float',
        ];
    }

    public function matricula(): BelongsTo
    {
        return $this->belongsTo(Matricula::class, 'id_matricula', 'id_matricula');
    }

    public function cuotas(): HasMany
    {
        return $this->hasMany(Cuota::class, 'id_comprobante', 'id_comprobante');
    }
}
