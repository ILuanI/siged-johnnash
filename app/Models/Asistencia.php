<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencia';

    protected $primaryKey = 'id_asistencia';

    public $incrementing = true;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }

    public function matricula(): BelongsTo
    {
        return $this->belongsTo(Matricula::class, 'id_matricula', 'id_matricula');
    }

    public function asignacionDocente(): BelongsTo
    {
        return $this->belongsTo(AsignacionDocente::class, 'id_asignacion', 'id_asignacion');
    }
}
