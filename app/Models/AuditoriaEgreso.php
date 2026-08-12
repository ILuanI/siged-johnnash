<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditoriaEgreso extends Model
{
    protected $table = 'auditoria_egreso';

    /**
     * La tabla solo mantiene un timestamp (created_at) como registro inmutable
     * de la acción de auditoría.
     */
    public const UPDATED_AT = null;

    protected $fillable = [
        'egreso_id',
        'usuario_id',
        'accion',
        'motivo',
    ];

    public function egreso(): BelongsTo
    {
        return $this->belongsTo(Egreso::class, 'egreso_id', 'id_egreso');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id', 'id');
    }
}
