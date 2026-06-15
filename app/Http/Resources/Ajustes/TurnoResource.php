<?php

namespace App\Http\Resources\Ajustes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TurnoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_turno' => $this->id_turno,
            'nombre' => $this->nombre,
            'hora_inicio' => $this->hora_inicio ? substr((string) $this->hora_inicio, 0, 5) : null,
            'hora_fin' => $this->hora_fin ? substr((string) $this->hora_fin, 0, 5) : null,
            'matriculas_count' => $this->whenCounted('matriculas'),
        ];
    }
}
