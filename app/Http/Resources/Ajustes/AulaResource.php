<?php

namespace App\Http\Resources\Ajustes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AulaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_aula' => $this->id_aula,
            'nombre' => $this->nombre,
            'capacidad' => $this->capacidad,
            'matriculas_count' => $this->whenCounted('matriculas'),
        ];
    }
}
