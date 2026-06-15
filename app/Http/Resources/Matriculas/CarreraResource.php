<?php

namespace App\Http\Resources\Matriculas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CarreraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_carrera' => $this->id_carrera,
            'id_area' => $this->id_area,
            'nombre' => $this->nombre,
            'puntaje_min' => $this->puntaje_min !== null ? (float) $this->puntaje_min : null,
            'puntaje_max' => $this->puntaje_max !== null ? (float) $this->puntaje_max : null,
            'area' => $this->whenLoaded('area', fn () => [
                'id_area' => $this->area?->id_area,
                'codigo' => $this->area?->codigo,
                'nombre' => $this->area?->nombre,
            ]),
        ];
    }
}
