<?php

namespace App\Http\Resources\Matriculas;

use App\Models\Alumno;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Alumno
 */
class AlumnoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_alumno' => $this->id_alumno,
            'codigo' => $this->codigo,
            'nombres' => $this->nombres,
            'apellidos' => $this->apellidos,
            'nombre_completo' => trim("{$this->nombres} {$this->apellidos}"),
            'dni' => $this->dni,
            'fecha_nac' => $this->fecha_nac?->toDateString(),
            'sexo' => $this->sexo,
            'telefono' => $this->telefono,
            'colegio_procedencia_id' => $this->colegio_procedencia_id,
            'colegio_procedencia' => $this->whenLoaded('colegioProcedencia', fn () => [
                'id_colegio_procedencia' => $this->colegioProcedencia?->id_colegio_procedencia,
                'nombre' => $this->colegioProcedencia?->nombre,
            ]),
            'estado' => $this->estado?->value,
            'id_carrera' => $this->id_carrera,
            'id_apoderado' => $this->id_apoderado,
            'creado_en' => $this->creado_en?->toIso8601String(),
        ];
    }
}
