<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortalAlumnoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'codigo' => $this->codigo,
            'dni' => $this->dni,
            'nombres' => $this->nombres,
            'apellidos' => $this->apellidos,
            'carrera' => $this->carrera?->nombre,
            'area' => $this->carrera?->area?->nombre,
            'ciclo' => $this->matriculaVigente?->ciclo?->nombre,
        ];
    }
}
