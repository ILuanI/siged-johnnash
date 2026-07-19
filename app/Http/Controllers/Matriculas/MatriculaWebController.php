<?php

namespace App\Http\Controllers\Matriculas;

use App\Enums\EstadoCuota;
use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreMatriculaRequest;
use App\Http\Resources\Matriculas\AlumnoResource;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Pago;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use App\Services\Matriculas\MatriculaFormalizacionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MatriculaWebController extends Controller
{
    public function __construct(
        private readonly MatriculaFormalizacionService $matriculaFormalizacionService,
    ) {}

    public function create(): Response
    {
        $alumnos = Alumno::query()
            ->with('apoderado')
            ->where('estado', 'ACTIVO')
            ->doesntHave('matriculaVigente')
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->get(['id_alumno', 'nombres', 'apellidos', 'dni', 'estado', 'telefono']);

        return Inertia::render('matriculas/nueva', [
            'alumnos' => array_values(AlumnoResource::collection($alumnos)->resolve(request())),
            'periodos' => PeriodoAcademico::query()->where('estado', 'ABIERTO')->orderBy('nombre')->get()
                ->map(fn (PeriodoAcademico $periodo): array => [
                    'id_periodo' => $periodo->id_periodo,
                    'nombre' => $periodo->nombre,
                    'anio' => $periodo->anio,
                ])
                ->values()
                ->all(),
            'ciclos' => Ciclo::query()->with('periodo')->orderBy('nombre')->get()
                ->map(fn (Ciclo $ciclo): array => [
                    'id_ciclo' => $ciclo->id_ciclo,
                    'nombre' => $ciclo->nombre,
                    'costo_base' => $ciclo->costo_base,
                    'id_periodo' => $ciclo->id_periodo,
                    'periodo' => $ciclo->periodo ? ['nombre' => $ciclo->periodo->nombre] : null,
                ])
                ->values()
                ->all(),
            'turnos' => Turno::query()->orderBy('nombre')->get()
                ->map(fn (Turno $turno): array => [
                    'id_turno' => $turno->id_turno,
                    'nombre' => $turno->nombre,
                ])
                ->values()
                ->all(),
            'aulas' => Aula::query()->orderBy('nombre')->get()
                ->map(fn (Aula $aula): array => [
                    'id_aula' => $aula->id_aula,
                    'nombre' => $aula->nombre,
                    'capacidad' => $aula->capacidad,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StoreMatriculaRequest $request): RedirectResponse
    {
        $matricula = $this->matriculaFormalizacionService->formalizar($request->validated());

        if ($request->boolean('pagar_ahora')) {
            $matricula->load('comprobantesPago.cuotas');

            foreach ($matricula->comprobantesPago as $comprobante) {
                $cuotas = $comprobante->concepto->value === 'CARNET'
                    ? $comprobante->cuotas
                    : $comprobante->cuotas->where('numero_cuota', 1);

                foreach ($cuotas as $cuota) {
                    Pago::create([
                        'id_cuota' => $cuota->id_cuota,
                        'monto' => $cuota->monto,
                        'fecha_pago' => now()->toDateString(),
                        'metodo_pago' => $request->input('metodo_pago'),
                        'user_id' => auth()->id(),
                    ]);

                    $cuota->update(['estado' => EstadoCuota::Pagada]);
                    $comprobante->decrement('saldo_pendiente', $cuota->monto);
                }
            }

            return redirect()
                ->route('tesoreria.estado-cuenta.show', ['alumno' => $matricula->id_alumno])
                ->with('success', 'Matrícula formalizada y primera cuota pagada correctamente.');
        }

        return redirect()
            ->route('matriculas.estudiantes.index', ['alumno' => $matricula->id_alumno])
            ->with('success', 'Matrícula formalizada correctamente.');
    }
}
