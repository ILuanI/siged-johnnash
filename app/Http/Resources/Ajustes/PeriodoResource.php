<?php

namespace App\Http\Resources\Ajustes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeriodoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_periodo' => $this->id_periodo,
            'nombre' => $this->nombre,
            'anio' => $this->anio,
            'descripcion' => $this->descripcion,
            'estado' => $this->estado,
            'ciclos_count' => $this->whenCounted('ciclos'),
            'matriculas_count' => $this->whenCounted('matriculas'),
        ];
    }
}
