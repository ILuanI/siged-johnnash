<?php

namespace App\Http\Resources\Ajustes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ColegioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_colegio_procedencia' => $this->id_colegio_procedencia,
            'nombre' => $this->nombre,
            'alumnos_count' => $this->whenCounted('alumnos'),
        ];
    }
}
