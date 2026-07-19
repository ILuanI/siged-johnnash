<?php

namespace App\Http\Resources\Matriculas;

use App\Enums\EstadoCuota;
use App\Models\Alumno;
use Carbon\CarbonInterface;
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
            'apoderado' => $this->whenLoaded('apoderado', fn () => [
                'id_apoderado' => $this->apoderado?->id_apoderado,
                'nombres' => $this->apoderado?->nombres,
                'telefono' => $this->apoderado?->telefono,
            ]),
            'creado_en' => $this->creado_en?->toIso8601String(),
            'cuotas' => $this->whenLoaded('matriculas', function () {
                $lastMatricula = $this->matriculas->first();
                if (! $lastMatricula || ! $lastMatricula->comprobantePago) {
                    return [];
                }

                return $lastMatricula->comprobantePago->cuotas->map(fn ($cuota) => [
                    'estado' => $cuota->estado instanceof EstadoCuota ? $cuota->estado->value : $cuota->estado,
                    'fecha_vencimiento' => $cuota->fecha_vencimiento instanceof CarbonInterface ? $cuota->fecha_vencimiento->toDateString() : $cuota->fecha_vencimiento,
                ])->toArray();
            }),
        ];
    }
}
