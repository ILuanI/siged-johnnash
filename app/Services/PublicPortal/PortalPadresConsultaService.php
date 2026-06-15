<?php

namespace App\Services\PublicPortal;

use App\Http\Resources\Public\PortalAlumnoResource;
use App\Http\Resources\Public\PortalAsistenciaResource;
use App\Http\Resources\Public\PortalSimulacroResource;
use App\Models\Alumno;
use App\Models\Examen;
use App\Models\ResultadoExamen;

class PortalPadresConsultaService
{
    /**
     * @return array{alumno: array<string, mixed>|null, asistencias: array<int, mixed>, simulacros: array<int, mixed>, mensaje: string|null}
     */
    public function consultar(?string $dni): array
    {
        if (! $dni) {
            return [
                'alumno' => null,
                'asistencias' => [],
                'simulacros' => [],
                'mensaje' => null,
            ];
        }

        $alumno = Alumno::query()
            ->with(['carrera.area', 'matriculaVigente.ciclo'])
            ->where('dni', $dni)
            ->first();

        if (! $alumno) {
            return [
                'alumno' => null,
                'asistencias' => [],
                'simulacros' => [],
                'mensaje' => 'No se encontró ningún estudiante con el DNI ingresado.',
            ];
        }

        $matricula = $alumno->matriculaVigente;

        if (! $matricula) {
            return [
                'alumno' => PortalAlumnoResource::make($alumno)->resolve(),
                'asistencias' => [],
                'simulacros' => [],
                'mensaje' => 'El estudiante no tiene una matrícula vigente.',
            ];
        }

        $asistencias = $matricula->asistencias()
            ->orderByDesc('fecha')
            ->orderByDesc('registrado_en')
            ->limit(5)
            ->get();

        $examenTable = (new Examen)->getTable();
        $resultadoTable = (new ResultadoExamen)->getTable();

        $simulacros = ResultadoExamen::query()
            ->with('examen')
            ->where('id_matricula', $matricula->id_matricula)
            ->whereHas('examen', fn ($query) => $query->where('tipo', 'SIMULACRO'))
            ->orderByDesc(
                Examen::query()
                    ->select('fecha')
                    ->whereColumn("{$examenTable}.id_examen", "{$resultadoTable}.id_examen")
                    ->limit(1)
            )
            ->limit(3)
            ->get();

        return [
            'alumno' => PortalAlumnoResource::make($alumno)->resolve(),
            'asistencias' => PortalAsistenciaResource::collection($asistencias)->resolve(),
            'simulacros' => PortalSimulacroResource::collection($simulacros)->resolve(),
            'mensaje' => null,
        ];
    }
}
