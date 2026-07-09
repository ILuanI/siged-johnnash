<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\ExamenMetrica;
use App\Models\ResultadoExamen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultaNotasController extends Controller
{
    public function index(Request $request): Response
    {
        $dni = $request->string('dni')->trim()->toString();
        $alumno = null;
        $resultados = [];
        $mensaje = null;

        if ($dni !== '') {
            $alumno = Alumno::query()
                ->with(['carrera.area', 'matriculaVigente.ciclo'])
                ->where('dni', $dni)
                ->first();

            if ($alumno) {
                $matricula = $alumno->matriculaVigente;
                if ($matricula) {
                    $resultadosRaw = ResultadoExamen::query()
                        ->where('id_matricula', $matricula->id_matricula)
                        ->with(['examen'])
                        ->get();

                    $areaId = $alumno->carrera->id_area ?? null;

                    foreach ($resultadosRaw as $res) {
                        $metricas = ExamenMetrica::where('id_examen', $res->id_examen)
                            ->where('id_area', $areaId)
                            ->first();

                        $resultados[] = [
                            'id_resultado' => $res->id_resultado,
                            'tipo' => $res->examen->tipo,
                            'numero' => $res->examen->numero,
                            'fecha' => $res->examen->fecha?->toDateString(),
                            'descripcion' => $res->examen->descripcion,
                            'puntaje_aptitud' => $res->puntaje_aptitud,
                            'puntaje_conocimiento' => $res->puntaje_conocimiento,
                            'puntaje_total' => $res->puntaje_total,
                            'puesto' => $res->puesto,
                            'max_area' => $metricas ? floatval($metricas->puntaje_max) : null,
                            'min_area' => $metricas ? floatval($metricas->puntaje_min) : null,
                        ];
                    }
                } else {
                    $mensaje = 'El estudiante está registrado pero no tiene una matrícula vigente para este ciclo.';
                }
            } else {
                $mensaje = 'No se encontró ningún estudiante con el DNI ingresado.';
            }
        }

        return Inertia::render('notas/consulta', [
            'alumno' => $alumno ? [
                'nombres' => $alumno->nombres,
                'apellidos' => $alumno->apellidos,
                'dni' => $alumno->dni,
                'carrera' => $alumno->carrera?->nombre,
                'area' => $alumno->carrera?->area?->nombre,
                'ciclo' => $alumno->matriculaVigente?->ciclo?->nombre,
            ] : null,
            'resultados' => $resultados,
            'filters' => ['dni' => $dni],
            'mensaje' => $mensaje,
        ]);
    }
}
