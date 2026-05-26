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
        if (! empty($datos['dni']) && Alumno::query()->where('dni', $datos['dni'])->exists()) {
            throw new BusinessRuleException('Ya existe un alumno registrado con el DNI indicado.');
        }

        return DB::transaction(function () use ($datos): Alumno {
            $idApoderado = $datos['id_apoderado'] ?? null;

            if (! empty($datos['apoderado'])) {
                $apoderado = Apoderado::query()->create($datos['apoderado']);
                $idApoderado = $apoderado->id_apoderado;
            }

            return Alumno::query()->create([
                'codigo' => $datos['codigo'] ?? $this->generarCodigo(),
                'nombres' => $datos['nombres'],
                'apellidos' => $datos['apellidos'],
                'dni' => $datos['dni'] ?? null,
                'fecha_nac' => $datos['fecha_nac'] ?? null,
                'sexo' => $datos['sexo'] ?? null,
                'telefono' => $datos['telefono'] ?? null,
                'correo' => $datos['correo'] ?? null,
                'direccion' => $datos['direccion'] ?? null,
                'colegio_proc' => $datos['colegio_proc'] ?? null,
                'id_carrera' => $datos['id_carrera'] ?? null,
                'id_apoderado' => $idApoderado,
                'estado' => EstadoAlumno::Activo,
            ]);
        });
    }

    private function generarCodigo(): string
    {
        $anio = now()->format('Y');
        $ultimo = Alumno::query()
            ->where('codigo', 'like', "JOB-{$anio}-%")
            ->orderByDesc('id_alumno')
            ->value('codigo');

        $secuencia = 1;

        if ($ultimo && preg_match('/JOB-\d{4}-(\d+)$/', $ultimo, $coincidencias)) {
            $secuencia = (int) $coincidencias[1] + 1;
        }

        return sprintf('JOB-%s-%05d', $anio, $secuencia);
    }
}
