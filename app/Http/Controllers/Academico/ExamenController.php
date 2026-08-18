<?php

namespace App\Http\Controllers\Academico;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Ciclo;
use App\Models\Examen;
use App\Models\ExamenMetrica;
use App\Models\ExamenPregunta;
use App\Models\ExamenRespuesta;
use App\Models\ResultadoExamen;
use App\Services\ZipGradeParser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ExamenController extends Controller
{
    public function index(): Response
    {
        $examenes = Examen::with(['ciclo', 'metricas.area', 'resultados', 'preguntas'])
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function (Examen $examen) {
                $resultados = $examen->resultados;

                $examen->alumnos_count = $resultados->count();
                $examen->promedio = $resultados->count() ? (float) $resultados->avg('puntaje_total') : null;
                $examen->puntaje_max = $resultados->count() ? (float) $resultados->max('puntaje_total') : null;
                $examen->puntaje_min = $resultados->count() ? (float) $resultados->min('puntaje_total') : null;
                $examen->porcentaje_promedio = $resultados->count() ? (float) $resultados->avg('porcentaje') : null;
                $examen->preguntas_count = $examen->preguntas->count();

                return $examen;
            });

        return Inertia::render('notas/index', [
            'examenes' => $examenes,
        ]);
    }

    public function cargarForm(): Response
    {
        return Inertia::render('notas/cargar', [
            'ciclos' => Ciclo::orderBy('fecha_inicio', 'desc')->get(),
            'areas' => Area::orderBy('nombre')->get(),
        ]);
    }

    public function previewCsv(Request $request)
    {
        $request->validate([
            'id_ciclo' => 'required|integer|exists:ciclo,id_ciclo',
            'archivo' => 'required|file|mimes:csv,txt',
        ]);

        $idCiclo = $request->integer('id_ciclo');
        $path = $request->file('archivo')->getRealPath();

        try {
            $parsed = (new ZipGradeParser)->parse($path);
        } catch (Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }

        $filas = [];
        $noEncontrados = [];
        $vistos = [];

        foreach ($parsed['filas'] as $fila) {
            $studentId = $fila['student_id'] ?? '';
            $customId = $fila['custom_id'] ?? '';

            $clave = $studentId !== '' ? $studentId : $customId;
            $duplicado = isset($vistos[$clave]);
            $vistos[$clave] = true;

            $alumno = Alumno::query()
                ->where('dni', $studentId)
                ->orWhere('dni', $customId)
                ->first();

            $nombre = trim(($fila['last_name'] ?? '').' '.($fila['first_name'] ?? ''));
            $idMatricula = null;
            $dni = null;
            $status = 'WARNING';
            $mensaje = 'Estudiante no encontrado (StudentID: '.$studentId.')';

            if ($alumno) {
                $dni = $alumno->dni;
                $nombre = $alumno->apellidos.', '.$alumno->nombres;

                $matricula = $alumno->matriculas()
                    ->where('id_ciclo', $idCiclo)
                    ->where('estado', 'VIGENTE')
                    ->first();

                if ($matricula) {
                    $idMatricula = $matricula->id_matricula;
                    $status = 'OK';
                    $mensaje = 'Ok';
                } else {
                    $mensaje = 'Sin matrícula vigente en este ciclo';
                }
            }

            if ($duplicado) {
                $status = 'WARNING';
                $mensaje = 'Estudiante duplicado en el CSV (StudentID: '.$studentId.')';
            }

            if ($status === 'WARNING' && ! $duplicado) {
                $noEncontrados[] = [
                    'student_id' => $studentId,
                    'nombre' => $nombre,
                ];
            }

            $filas[] = [
                'student_id' => $studentId,
                'nombre' => $nombre,
                'dni' => $dni,
                'id_matricula' => $idMatricula,
                'earned' => $fila['earned'] ?? 0,
                'possible' => $fila['possible'] ?? 0,
                'percent' => $fila['percent'] ?? 0,
                'status' => $status,
                'mensaje' => $mensaje,
            ];
        }

        return response()->json([
            'examen' => $parsed['examen'],
            'preguntas' => array_values($parsed['preguntas']),
            'filas' => $filas,
            'resumen' => [
                'total' => count($filas),
                'ok' => count(array_filter($filas, fn ($f) => $f['status'] === 'OK')),
                'warning' => count(array_filter($filas, fn ($f) => $f['status'] === 'WARNING')),
                'no_encontrados' => $noEncontrados,
            ],
        ]);
    }

    public function guardar(Request $request): RedirectResponse
    {
        $request->merge([
            'id_area' => $request->input('id_area') ?: null,
            'numero' => $request->input('numero') ?: null,
        ]);

        $request->validate([
            'id_ciclo' => 'required|integer|exists:ciclo,id_ciclo',
            'tipo' => 'required|string|in:SIMULACRO,CONOCIMIENTO,SEMANAL',
            'numero' => 'nullable|integer',
            'fecha' => 'required|date',
            'descripcion' => 'nullable|string|max:120',
            'id_area' => 'nullable|integer|exists:area,id_area',
            'archivo' => 'required|file|mimes:csv,txt',
        ]);

        $path = $request->file('archivo')->getRealPath();

        try {
            $parsed = (new ZipGradeParser)->parse($path);
        } catch (Throwable $e) {
            return redirect()->back()->withErrors(['archivo' => $e->getMessage()]);
        }

        $idCiclo = $request->integer('id_ciclo');
        $tipo = $request->input('tipo');
        $numero = $request->input('numero');
        $fecha = $request->input('fecha');
        $descripcion = $request->input('descripcion');
        $idArea = $request->input('id_area');

        $duplicado = Examen::where('id_ciclo', $idCiclo)
            ->where('tipo', $tipo)
            ->where('numero', $numero)
            ->where('fecha', $fecha)
            ->where('descripcion', $descripcion)
            ->exists();

        if ($duplicado) {
            return redirect()->back()->withErrors([
                'archivo' => 'Ya existe un examen con estas características (ciclo, tipo, número, fecha y descripción). Evita importaciones duplicadas.',
            ]);
        }

        DB::transaction(function () use ($parsed, $idCiclo, $tipo, $numero, $fecha, $descripcion, $idArea, &$omitidas) {
            $examen = Examen::create([
                'id_ciclo' => $idCiclo,
                'tipo' => $tipo,
                'numero' => $numero,
                'fecha' => $fecha,
                'descripcion' => $descripcion,
                'id_area' => $idArea,
            ]);

            // Preguntas
            $preguntas = [];
            foreach ($parsed['preguntas'] as $p) {
                $pregunta = ExamenPregunta::create([
                    'id_examen' => $examen->id_examen,
                    'numero' => $p['numero'],
                    'clave_correcta' => $p['clave_correcta'],
                    'puntos' => $p['puntos'],
                ]);
                $preguntas[$p['numero']] = $pregunta;
            }

            // Resultados por alumno
            $resultadosCreados = [];
            $matriculasUsadas = [];
            $omitidas = 0;
            foreach ($parsed['filas'] as $fila) {
                $studentId = $fila['student_id'] ?? '';
                $customId = $fila['custom_id'] ?? '';

                $alumno = Alumno::query()
                    ->where('dni', $studentId)
                    ->orWhere('dni', $customId)
                    ->first();

                if (! $alumno) {
                    continue;
                }

                $matricula = $alumno->matriculas()
                    ->where('id_ciclo', $idCiclo)
                    ->where('estado', 'VIGENTE')
                    ->first();

                if (! $matricula) {
                    continue;
                }

                if (isset($matriculasUsadas[$matricula->id_matricula])
                    || ResultadoExamen::where('id_examen', $examen->id_examen)
                        ->where('id_matricula', $matricula->id_matricula)
                        ->exists()) {
                    $omitidas++;
                    continue;
                }

                $matriculasUsadas[$matricula->id_matricula] = true;

                $resultado = ResultadoExamen::create([
                    'id_examen' => $examen->id_examen,
                    'id_matricula' => $matricula->id_matricula,
                    'puntaje_aptitud' => 0,
                    'puntaje_conocimiento' => 0,
                    'puntaje_total' => $this->toFloat($fila['earned'] ?? 0),
                    'puntaje_posible' => $this->toFloat($fila['possible'] ?? 0),
                    'porcentaje' => $this->toFloat($fila['percent'] ?? 0),
                ]);

                foreach ($fila['respuestas'] as $respuesta) {
                    $n = (int) $respuesta['numero'];
                    if (! isset($preguntas[$n])) {
                        continue;
                    }

                    ExamenRespuesta::create([
                        'id_resultado' => $resultado->id_resultado,
                        'id_pregunta' => $preguntas[$n]->id_pregunta,
                        'numero' => $n,
                        'respuesta' => $respuesta['respuesta'],
                        'puntos_obtenidos' => $this->toFloat($respuesta['puntos'] ?? 0),
                        'marca' => strtoupper($respuesta['marca'] ?? ''),
                    ]);
                }

                $resultadosCreados[] = $resultado;
            }

            if (empty($resultadosCreados)) {
                throw ValidationException::withMessages([
                    'archivo' => 'Ningún estudiante del CSV pudo asociarse a una matrícula vigente en el ciclo seleccionado.',
                ]);
            }

            // Puestos (ranking global por puntaje_total)
            $ordenados = collect($resultadosCreados)->sortByDesc('puntaje_total')->values();
            foreach ($ordenados as $index => $resultado) {
                $resultado->update(['puesto' => $index + 1]);
            }

            // Métrica por área (si el examen tiene área asignada)
            if ($idArea) {
                ExamenMetrica::create([
                    'id_examen' => $examen->id_examen,
                    'id_area' => $idArea,
                    'puntaje_max' => $ordenados->first()->puntaje_total,
                    'puntaje_min' => $ordenados->last()->puntaje_total,
                ]);
            }
        });

        $mensaje = 'Resultados de ZipGrade importados y guardados exitosamente.';
        if ($omitidas > 0) {
            $mensaje .= ' '.$omitidas.' fila(s) omitida(s) por estar duplicada(s) o ya registrada(s).';
        }

        return redirect()->route('notas.index')->with('success', $mensaje);
    }

    public function show(Examen $examen): Response
    {
        $examen->load([
            'ciclo',
            'area',
            'metricas.area',
            'preguntas' => fn ($q) => $q->orderBy('numero'),
            'resultados' => fn ($q) => $q->orderBy('puesto'),
            'resultados.matricula.alumno',
            'resultados.respuestas',
        ]);

        $resultados = $examen->resultados;
        $total = $resultados->count();

        $resumen = [
            'alumnos' => $total,
            'promedio' => $total ? (float) $resultados->avg('puntaje_total') : 0,
            'mejor' => $total ? (float) $resultados->max('puntaje_total') : 0,
            'menor' => $total ? (float) $resultados->min('puntaje_total') : 0,
            'porcentaje_promedio' => $total ? (float) $resultados->avg('porcentaje') : 0,
        ];

        $tablaAlumnos = $resultados->map(function (ResultadoExamen $r) {
            $alumno = $r->matricula?->alumno;

            return [
                'id_resultado' => $r->id_resultado,
                'puesto' => $r->puesto,
                'nombre' => $alumno ? $alumno->apellidos.', '.$alumno->nombres : '—',
                'dni' => $alumno?->dni,
                'puntaje' => $r->puntaje_total,
                'porcentaje' => $r->porcentaje,
            ];
        })->values();

        // Análisis por pregunta
        $analisisPreguntas = $examen->preguntas->map(function (ExamenPregunta $p) use ($total) {
            $respuestas = $p->respuestas;
            $correctas = $respuestas->where('marca', 'C')->count();
            $errores = $respuestas->count() - $correctas;

            return [
                'numero' => $p->numero,
                'clave_correcta' => $p->clave_correcta,
                'puntos' => $p->puntos,
                'correctas' => $correctas,
                'errores' => $errores,
                'porcentaje_correctas' => $total ? round(($correctas / $total) * 100, 1) : 0,
            ];
        })->values();

        // Distribución por rangos de porcentaje
        $rangos = [
            '0-20' => 0,
            '21-40' => 0,
            '41-60' => 0,
            '61-80' => 0,
            '81-100' => 0,
        ];
        foreach ($resultados as $r) {
            $p = (float) $r->porcentaje;
            if ($p <= 20) {
                $rangos['0-20']++;
            } elseif ($p <= 40) {
                $rangos['21-40']++;
            } elseif ($p <= 60) {
                $rangos['41-60']++;
            } elseif ($p <= 80) {
                $rangos['61-80']++;
            } else {
                $rangos['81-100']++;
            }
        }

        return Inertia::render('notas/show', [
            'examen' => [
                'id_examen' => $examen->id_examen,
                'tipo' => $examen->tipo,
                'numero' => $examen->numero,
                'fecha' => $examen->fecha?->format('Y-m-d'),
                'descripcion' => $examen->descripcion,
                'ciclo' => $examen->ciclo?->nombre,
                'area' => $examen->area?->nombre,
                'metricas' => $examen->metricas->map(fn ($m) => [
                    'area' => $m->area?->nombre,
                    'puntaje_max' => $m->puntaje_max,
                    'puntaje_min' => $m->puntaje_min,
                ]),
            ],
            'resumen' => $resumen,
            'alumnos' => $tablaAlumnos,
            'preguntas' => $analisisPreguntas,
            'distribucion' => $rangos,
        ]);
    }

    public function showResultado(Examen $examen, ResultadoExamen $resultado): Response
    {
        if ($resultado->id_examen !== $examen->id_examen) {
            abort(404);
        }

        $resultado->load([
            'matricula.alumno',
            'respuestas.pregunta',
        ]);

        $examen->load(['area', 'preguntas']);

        $alumno = $resultado->matricula?->alumno;

        $respuestas = $resultado->respuestas
            ->sortBy('numero')
            ->map(function (ExamenRespuesta $r) {
                return [
                    'numero' => $r->numero,
                    'respuesta' => $r->respuesta,
                    'clave_correcta' => $r->pregunta?->clave_correcta,
                    'puntos' => $r->puntos_obtenidos,
                    'marca' => $r->marca,
                    'correcta' => $r->marca === 'C',
                ];
            })->values();

        $correctas = $respuestas->where('correcta', true)->count();
        $incorrectas = $respuestas->count() - $correctas;

        return Inertia::render('notas/resultado', [
            'examen' => [
                'id_examen' => $examen->id_examen,
                'tipo' => $examen->tipo,
                'numero' => $examen->numero,
                'descripcion' => $examen->descripcion,
                'area' => $examen->area?->nombre,
            ],
            'alumno' => [
                'nombre' => $alumno ? $alumno->apellidos.', '.$alumno->nombres : '—',
                'dni' => $alumno?->dni,
            ],
            'resultado' => [
                'id_resultado' => $resultado->id_resultado,
                'puntaje' => $resultado->puntaje_total,
                'puntaje_posible' => $resultado->puntaje_posible,
                'porcentaje' => $resultado->porcentaje,
                'puesto' => $resultado->puesto,
                'correctas' => $correctas,
                'incorrectas' => $incorrectas,
            ],
            'respuestas' => $respuestas,
        ]);
    }

    private function toFloat($value): float
    {
        return (float) str_replace(',', '.', (string) $value);
    }
}
