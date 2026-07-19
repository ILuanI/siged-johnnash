<?php

namespace App\Services\Matriculas;

use App\Enums\EstadoAlumno;
use App\Exceptions\BusinessRuleException;
use App\Models\Alumno;
use App\Models\Apoderado;
use Illuminate\Support\Facades\DB;

class AlumnoRegistroService
{
    /**
     * @param  array<string, mixed>  $datos
     */
    public function registrar(array $datos): Alumno
    {
        if (Alumno::query()->where('dni', $datos['dni'])->exists()) {
            throw new BusinessRuleException('Ya existe un alumno registrado con el DNI indicado.');
        }

        return DB::transaction(function () use ($datos): Alumno {
            $idApoderado = $datos['id_apoderado'] ?? null;

            if (! empty($datos['apoderado'])) {
                $apoderado = Apoderado::query()->create($datos['apoderado']);
                $idApoderado = $apoderado->id_apoderado;
            }

            return Alumno::query()->create([
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'dni' => $datos['dni'],
                'fecha_nac' => $datos['fecha_nac'] ?? null,
                'sexo' => $datos['sexo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'colegio_procedencia_id' => $datos['colegio_procedencia_id'] ?? null,
                'id_carrera' => $datos['id_carrera'] ?? null,
                'id_apoderado' => $idApoderado,
                'estado' => EstadoAlumno::Activo,
            ]);
        });
    }
}
