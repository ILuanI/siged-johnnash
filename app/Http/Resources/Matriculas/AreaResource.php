<?php

namespace App\Http\Resources\Matriculas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_area' => $this->id_area,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'carreras_count' => $this->whenCounted('carreras'),
            'carreras' => CarreraResource::collection($this->whenLoaded('carreras')),
        ];
    }
}
