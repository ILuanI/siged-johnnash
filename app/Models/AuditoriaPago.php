<?php

namespace App\Models;

use Database\Factories\AuditoriaPagoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaPago extends Model
{
    /** @use HasFactory<AuditoriaPagoFactory> */
    use HasFactory;

    protected $table = 'auditoria_pagos';

    /**
     * La tabla solo mantiene un timestamp (created_at) como registro inmutable
     * de la acción de auditoría.
     */
    public const UPDATED_AT = null;

    protected $fillable = [
        'pago_id',
        'usuario_id',
        'accion',
        'motivo',
    ];

    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class, 'pago_id', 'id_pago');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id');
    }
}
