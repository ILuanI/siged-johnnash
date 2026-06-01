<?php

namespace App\Services\Matriculas;

use App\Enums\EstadoAlumno;
use App\Enums\EstadoCiclo;
use App\Enums\EstadoMatricula;
use App\Enums\ModalidadMatricula;
use App\Enums\TipoPagoMatricula;
use App\Exceptions\BusinessRuleException;
use App\Models\Alumno;
use App\Models\Ciclo;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use Illuminate\Support\Facades\DB;

class MatriculaFormalizacionService
{
    /**
     * @param  array<string, mixed>  $datos
     */
    public function formalizar(array $datos): Matricula
    {
        $alumno = Alumno::query()->find($datos['id_alumno']);

        if (! $alumno) {
            throw new BusinessRuleException('El alumno indicado no existe.', 404);
        }

        $ciclo = Ciclo::query()->find($datos['id_ciclo']);

        if (! $ciclo) {
            throw new BusinessRuleException('El ciclo académico indicado no existe.', 404);
        }

        if ($ciclo->estado !== EstadoCiclo::Abierto) {
            throw new BusinessRuleException('El ciclo académico no está abierto para matrículas.');
        }

        $periodo = PeriodoAcademico::query()->find($datos['id_periodo']);

        if (! $periodo) {
            throw new BusinessRuleException('El periodo académico indicado no existe.', 404);
        }

        if ($periodo->estado !== 'ABIERTO') {
            throw new BusinessRuleException('El periodo académico no está abierto para matrículas.');
        }

        if ($ciclo->id_periodo && (int) $ciclo->id_periodo !== (int) $datos['id_periodo']) {
            throw new BusinessRuleException('El ciclo no pertenece al periodo académico seleccionado.');
        }

        $matriculaExistente = Matricula::query()
            ->where('id_alumno', $datos['id_alumno'])
            ->where('id_ciclo', $datos['id_ciclo'])
            ->where('estado', EstadoMatricula::Vigente)
            ->exists();

        if ($matriculaExistente) {
            throw new BusinessRuleException('El alumno ya tiene una matrícula vigente en este ciclo.');
        }

        return DB::transaction(function () use ($datos, $alumno, $ciclo): Matricula {
            $matricula = Matricula::query()->create([
                'id_alumno' => $datos['id_alumno'],
                'id_ciclo' => $datos['id_ciclo'],
                'id_periodo' => $datos['id_periodo'],
                'id_turno' => $datos['id_turno'],
                'id_aula' => $datos['id_aula'],
                'fecha_matricula' => $datos['fecha_matricula'] ?? now()->toDateString(),
                'modalidad' => $datos['modalidad'] ?? ModalidadMatricula::Presencial,
                'tipo_pago' => $datos['tipo_pago'] ?? TipoPagoMatricula::Contado,
                'costo_total' => $datos['costo_total'] ?? $ciclo->costo_base,
                'estado' => EstadoMatricula::Vigente,
            ]);

            $alumno->update(['estado' => EstadoAlumno::Matriculado]);

            return $matricula->load(['ciclo', 'periodo', 'turno', 'aula', 'alumno']);
        });
    }
}
