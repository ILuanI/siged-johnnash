<?php

namespace App\Models;

use App\Enums\TipoCategoriaFinanciera;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriaFinanciera extends Model
{
    use HasFactory;

    protected $table = 'categoria_financiera';

    protected $fillable = [
        'nombre',
        'tipo',
        'es_por_defecto',
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'tipo' => TipoCategoriaFinanciera::class,
            'es_por_defecto' => 'boolean',
        ];
    }
}
