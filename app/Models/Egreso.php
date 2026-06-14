<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Egreso extends Model
{
    use HasFactory;

    protected $table = 'egreso';

    protected $primaryKey = 'id_egreso';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'cantidad' => 'float',
            'precio' => 'float',
            'igv' => 'float',
            'total' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
