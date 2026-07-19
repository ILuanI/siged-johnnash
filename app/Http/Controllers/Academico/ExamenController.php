<?php

namespace App\Http\Controllers\Academico;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Ciclo;
use App\Models\Examen;
use App\Models\ExamenMetrica;
use App\Models\ResultadoExamen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExamenController extends Controller
{
    public function index(): Response
    {
        $examenes = Examen::with(['ciclo', 'metricas.area'])
            ->orderBy('fecha', 'desc')
            ->get();

        return Inertia::render('notas/index', [
            'examenes' => $examenes,
        ]);
    }

    public function cargarForm(): Response
    {
        return Inertia::render('notas/cargar', [
            'ciclos' => Ciclo::orderBy('fecha_inicio', 'desc')->get(),
        ]);
    }

    public function previewCsv(Request $request)
    {
        $request->validate([
            'id_ciclo' => 'required|integer|exists:ciclo,id_ciclo',
            'archivo' => 'required|file|mimes:csv,txt,xlsx',
        ]);

        $idCiclo = $request->integer('id_ciclo');
        $file = $request->file('archivo');
        $path = $file->getRealPath();

        $rows = [];

        // Detect separator
        $separator = ',';
        $content = file_get_contents($path);
        if (strpos($content, ';') !== false && strpos($content, ',') === false) {
            $separator = ';';
        }

        if (($handle = fopen($path, 'r')) !== null) {
            $firstLine = fgetcsv($handle, 1000, $separator);
            // If the first line has non-numeric in the score column, it's a header
            $hasHeader = isset($firstLine[1]) && ! is_numeric($firstLine[1]);

            if (! $hasHeader && $firstLine) {
                rewind($handle);
            }

            while (($row = fgetcsv($handle, 1000, $separator)) !== false) {
                if (empty(array_filter($row))) {
                    continue; // Skip empty rows
                }

                $identifier = trim($row[0] ?? '');
                $aptitud = floatval(trim($row[1] ?? 0));
                $conocimiento = floatval(trim($row[2] ?? 0));

                if (empty($identifier)) {
                    continue;
                }

                // Find student by code or DNI
                $alumno = Alumno::query()
                    ->with(['carrera.area'])
                    ->where('dni', $identifier)
                    ->first();

                $nombres = $identifier;
                $area = 'N/A';
                $carrera = 'N/A';
                $idMatricula = null;
                $status = 'WARNING';
                $mensaje = 'Estudiante no encontrado';

                if ($alumno) {
                    $nombres = "{$alumno->apellidos}, {$alumno->nombres}";
                    $carrera = $alumno->carrera?->nombre ?? 'N/A';
                    $area = $alumno->carrera?->area?->nombre ?? 'N/A';

                    // Check matricula in active cycle
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

                $rows[] = [
                    'identifier' => $identifier,
                    'nombres' => $nombres,
                    'area' => $area,
                    'carrera' => $carrera,
                    'id_matricula' => $idMatricula,
                    'puntaje_aptitud' => $aptitud,
                    'puntaje_conocimiento' => $conocimiento,
                    'puntaje_total' => $aptitud + $conocimiento,
                    'status' => $status,
                    'mensaje' => $mensaje,
                ];
            }
            fclose($handle);
        }

        return response()->json([
            'rows' => $rows,
        ]);
    }

    public function guardar(Request $request): RedirectResponse
    {
        $request->validate([
            'id_ciclo' => 'required|integer|exists:ciclo,id_ciclo',
            'tipo' => 'required|string|in:SIMULACRO,CONOCIMIENTO,SEMANAL',
            'numero' => 'nullable|integer',
            'fecha' => 'required|date',
            'descripcion' => 'nullable|string|max:120',
            'resultados' => 'required|array|min:1',
            'resultados.*.id_matricula' => 'required|integer|exists:matricula,id_matricula',
            'resultados.*.puntaje_aptitud' => 'required|numeric',
            'resultados.*.puntaje_conocimiento' => 'required|numeric',
        ]);

        $resultados = $request->input('resultados');

        DB::transaction(function () use ($request, $resultados) {
            $examen = Examen::create([
                'id_ciclo' => $request->integer('id_ciclo'),
                'tipo' => $request->input('tipo'),
                'numero' => $request->input('numero'),
                'fecha' => $request->input('fecha'),
                'descripcion' => $request->input('descripcion'),
            ]);

            // Save results
            foreach ($resultados as $res) {
                ResultadoExamen::create([
                    'id_examen' => $examen->id_examen,
                    'id_matricula' => $res['id_matricula'],
                    'puntaje_aptitud' => $res['puntaje_aptitud'],
                    'puntaje_conocimiento' => $res['puntaje_conocimiento'],
                    'puntaje_total' => $res['puntaje_aptitud'] + $res['puntaje_conocimiento'],
                ]);
            }

            // Calculate Rankings (puestos) per Area
            // Group matriculas in this exam by their student's Area
            $resultadosGuardados = ResultadoExamen::query()
                ->where('id_examen', $examen->id_examen)
                ->join('matricula', 'resultado_examen.id_matricula', '=', 'matricula.id_matricula')
                ->join('alumno', 'matricula.id_alumno', '=', 'alumno.id_alumno')
                ->join('carrera', 'alumno.id_carrera', '=', 'carrera.id_carrera')
                ->select('resultado_examen.*', 'carrera.id_area')
                ->get();

            $porArea = $resultadosGuardados->groupBy('id_area');

            foreach ($porArea as $idArea => $items) {
                // Sort by puntaje_total descending
                $sorted = $items->sortByDesc('puntaje_total')->values();

                $max = 0.0;
                $min = 0.0;

                if ($sorted->count() > 0) {
                    $max = $sorted->first()->puntaje_total;
                    $min = $sorted->last()->puntaje_total;
                }

                foreach ($sorted as $index => $item) {
                    ResultadoExamen::where('id_resultado', $item->id_resultado)
                        ->update(['puesto' => $index + 1]);
                }

                // Save metrics
                if ($idArea) {
                    ExamenMetrica::create([
                        'id_examen' => $examen->id_examen,
                        'id_area' => $idArea,
                        'puntaje_max' => $max,
                        'puntaje_min' => $min,
                    ]);
                }
            }
        });

        return redirect()->route('notas.index')->with('success', 'Notas procesadas y guardadas exitosamente.');
    }
}
