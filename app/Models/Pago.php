<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';

    protected $primaryKey = 'id_pago';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha_pago' => 'datetime',
            'monto' => 'float',
        ];
    }

    public function cuota(): BelongsTo
    {
        return $this->belongsTo(Cuota::class, 'id_cuota', 'id_cuota');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
