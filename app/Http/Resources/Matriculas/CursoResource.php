<?php

namespace App\Http\Resources\Matriculas;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CursoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_curso' => $this->id_curso,
            'nombre' => $this->nombre,
            'area_conoc' => $this->area_conoc,
            'color' => $this->color,
        ];
    }
}
