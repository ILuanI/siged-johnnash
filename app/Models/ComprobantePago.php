<?php

namespace App\Models;

use App\Enums\ConceptoPago;
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

    protected $fillable = [
        'id_matricula',
        'numero',
        'tipo',
        'concepto',
        'descripcion',
        'fecha_emision',
        'costo_total',
        'saldo_pendiente',
    ];

    protected function casts(): array
    {
        return [
            'fecha_emision' => 'date',
            'costo_total' => 'decimal:2',
            'saldo_pendiente' => 'decimal:2',
            'concepto' => ConceptoPago::class,
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
