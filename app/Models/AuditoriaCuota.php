<?php

namespace App\Models;

use Database\Factories\AuditoriaCuotaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaCuota extends Model
{
    /** @use HasFactory<AuditoriaCuotaFactory> */
    use HasFactory;

    protected $table = 'auditoria_cuotas';

    /**
     * La tabla solo mantiene un timestamp (created_at) como registro inmutable
     * de la acción de auditoría.
     */
    public const UPDATED_AT = null;

    protected $fillable = [
        'cuota_id',
        'usuario_id',
        'accion',
        'motivo',
    ];

    public function cuota(): BelongsTo
    {
        return $this->belongsTo(Cuota::class, 'cuota_id', 'id_cuota');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id');
    }
}