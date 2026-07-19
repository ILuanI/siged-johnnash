<?php

namespace App\Services\Asistencias;

use App\Exceptions\BusinessRuleException;
use App\Models\Alumno;
use App\Models\Asistencia;
use Illuminate\Support\Facades\DB;

class AsistenciaBarcodeService
{
    /**
     * @param  array{dni: string, id_asignacion?: int|null, nombres_convenio?: string|null}  $datos
     * @return array{registrada: bool, tipo_alumno: string, mensaje: string, asistencia: Asistencia}
     */
    public function registrar(array $datos): array
    {
        return DB::transaction(function () use ($datos): array {
            $dni = $datos['dni'];
            $fecha = now()->toDateString();
            $idAsignacion = $datos['id_asignacion'] ?? null;

            $alumno = Alumno::query()
                ->with('matriculaVigente')
                ->where('dni', $dni)
                ->first();

            if ($alumno) {
                return $this->registrarInterno($alumno, $fecha, $idAsignacion);
            }

            return $this->registrarConvenio($dni, $fecha, $idAsignacion, $datos['nombres_convenio'] ?? null);
        });
    }

    /**
     * @return array{registrada: bool, tipo_alumno: string, mensaje: string, asistencia: Asistencia}
     */
    private function registrarInterno(Alumno $alumno, string $fecha, ?int $idAsignacion): array
    {
        $matricula = $alumno->matriculaVigente;

        if (! $matricula) {
            throw new BusinessRuleException('El alumno existe, pero no tiene una matrícula vigente.');
        }

        $asistencia = Asistencia::query()
            ->where('tipo_alumno', 'INTERNO')
            ->where('dni', $alumno->dni)
            ->whereDate('fecha', $fecha)
            ->when($idAsignacion, fn ($query) => $query->where('id_asignacion', $idAsignacion), fn ($query) => $query->whereNull('id_asignacion'))
            ->first();

        if ($asistencia) {
            return [
                'registrada' => false,
                'tipo_alumno' => 'INTERNO',
                'mensaje' => 'La asistencia del alumno ya estaba registrada para hoy.',
                'asistencia' => $asistencia,
            ];
        }

        $asistencia = Asistencia::query()->create([
            'tipo_alumno' => 'INTERNO',
            'dni' => $alumno->dni,
            'id_matricula' => $matricula->id_matricula,
            'id_asignacion' => $idAsignacion,
            'fecha' => $fecha,
            'estado' => 'ASISTIO',
            'registrado_en' => now(),
        ]);

        return [
            'registrada' => true,
            'tipo_alumno' => 'INTERNO',
            'mensaje' => "Asistencia registrada para {$alumno->nombres} {$alumno->apellidos}.",
            'asistencia' => $asistencia,
        ];
    }

    /**
     * @return array{registrada: bool, tipo_alumno: string, mensaje: string, asistencia: Asistencia}
     */
    private function registrarConvenio(string $dni, string $fecha, ?int $idAsignacion, ?string $nombresConvenio): array
    {
        $asistencia = Asistencia::query()
            ->where('tipo_alumno', 'CONVENIO')
            ->where('dni', $dni)
            ->whereDate('fecha', $fecha)
            ->when($idAsignacion, fn ($query) => $query->where('id_asignacion', $idAsignacion), fn ($query) => $query->whereNull('id_asignacion'))
            ->first();

        if ($asistencia) {
            return [
                'registrada' => false,
                'tipo_alumno' => 'CONVENIO',
                'mensaje' => 'La asistencia del alumno por convenio ya estaba registrada para hoy.',
                'asistencia' => $asistencia,
            ];
        }

        $asistencia = Asistencia::query()->create([
            'tipo_alumno' => 'CONVENIO',
            'dni' => $dni,
            'nombres_convenio' => $nombresConvenio,
            'id_asignacion' => $idAsignacion,
            'fecha' => $fecha,
            'estado' => 'ASISTIO',
            'registrado_en' => now(),
        ]);

        return [
            'registrada' => true,
            'tipo_alumno' => 'CONVENIO',
            'mensaje' => 'Asistencia registrada como alumno por convenio.',
            'asistencia' => $asistencia,
        ];
    }

    /**
     * @param  array{id_alumno: int, fecha: string, estado: string, id_asignacion?: int|null}  $datos
     */
    public function upsertManual(array $datos): Asistencia
    {
        return DB::transaction(function () use ($datos): Asistencia {
            $alumno = Alumno::query()
                ->with('matriculaVigente')
                ->findOrFail($datos['id_alumno']);

            $matricula = $alumno->matriculaVigente;

            if (! $matricula) {
                throw new BusinessRuleException('El alumno no tiene una matrícula vigente para registrar asistencia.');
            }

            $idAsignacion = $datos['id_asignacion'] ?? null;
            $fecha = $datos['fecha'];

            $asistencia = Asistencia::query()
                ->where('tipo_alumno', 'INTERNO')
                ->where('dni', $alumno->dni)
                ->whereDate('fecha', $fecha)
                ->when(
                    $idAsignacion,
                    fn ($query) => $query->where('id_asignacion', $idAsignacion),
                    fn ($query) => $query->whereNull('id_asignacion'),
                )
                ->first();

            if ($asistencia) {
                $asistencia->update([
                    'estado' => $datos['estado'],
                    'id_matricula' => $matricula->id_matricula,
                    'registrado_en' => now(),
                ]);

                return $asistencia->refresh();
            }

            return Asistencia::query()->create([
                'tipo_alumno' => 'INTERNO',
                'dni' => $alumno->dni,
                'id_matricula' => $matricula->id_matricula,
                'id_asignacion' => $idAsignacion,
                'fecha' => $fecha,
                'estado' => $datos['estado'],
                'registrado_en' => now(),
            ]);
        });
    }
}
