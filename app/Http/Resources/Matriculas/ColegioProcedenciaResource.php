<?php

namespace App\Http\Resources\Matriculas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ColegioProcedenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_colegio_procedencia' => $this->id_colegio_procedencia,
            'nombre' => $this->nombre,
        ];
    }
}
