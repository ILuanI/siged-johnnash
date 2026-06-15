<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortalAsistenciaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $registradoEn = $this->registrado_en ?? $this->created_at;

        return [
            'id_asistencia' => $this->id_asistencia,
            'fecha' => $this->fecha?->toDateString(),
            'hora' => $registradoEn?->format('H:i'),
            'estado' => $this->estado,
        ];
    }
}
