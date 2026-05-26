<?php

namespace App\Http\Resources\Matriculas;

use App\Models\Matricula;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Matricula
 */
class MatriculaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_matricula' => $this->id_matricula,
            'id_alumno' => $this->id_alumno,
            'fecha_matricula' => $this->fecha_matricula?->toDateString(),
            'modalidad' => $this->modalidad?->value,
            'tipo_pago' => $this->tipo_pago?->value,
            'costo_total' => $this->costo_total,
            'estado' => $this->estado?->value,
            'alumno' => $this->whenLoaded('alumno', fn () => new AlumnoResource($this->alumno)),
            'ciclo' => $this->whenLoaded('ciclo', fn () => [
                'id_ciclo' => $this->ciclo?->id_ciclo,
                'nombre' => $this->ciclo?->nombre,
                'tipo_ciclo' => $this->ciclo?->tipo_ciclo,
            ]),
            'periodo' => $this->whenLoaded('periodo', fn () => [
                'id_periodo' => $this->periodo?->id_periodo,
                'nombre' => $this->periodo?->nombre,
                'anio' => $this->periodo?->anio,
            ]),
            'turno' => $this->whenLoaded('turno', fn () => [
                'id_turno' => $this->turno?->id_turno,
                'nombre' => $this->turno?->nombre,
            ]),
            'aula' => $this->whenLoaded('aula', fn () => [
                'id_aula' => $this->aula?->id_aula,
                'nombre' => $this->aula?->nombre,
            ]),
        ];
    }
}
