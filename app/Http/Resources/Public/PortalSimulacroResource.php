<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortalSimulacroResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_resultado' => $this->id_resultado,
            'fecha' => $this->examen?->fecha?->toDateString(),
            'simulacro' => $this->examen?->numero ? 'Simulacro '.$this->examen->numero : ($this->examen?->descripcion ?? 'Simulacro'),
            'puntaje_total' => (float) $this->puntaje_total,
            'puesto' => $this->puesto,
        ];
    }
}
