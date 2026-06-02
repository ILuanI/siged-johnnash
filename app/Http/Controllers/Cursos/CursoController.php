<?php

namespace App\Http\Controllers\Cursos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cursos\StoreCursoRequest;
use App\Http\Requests\Cursos\UpdateCursoRequest;
use App\Models\AsignacionDocente;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Curso;
use App\Models\Docente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CursoController extends Controller
{
    public function index(Request $request): Response
    {
        $cicloSeleccionadoId = $request->integer('ciclo') ?: $this->cicloPorDefectoId();

        $cursos = Curso::query()
            ->with(['asignaciones' => function ($query) use ($cicloSeleccionadoId): void {
                $query->when($cicloSeleccionadoId, fn ($q): mixed => $q->where('id_ciclo', $cicloSeleccionadoId))
                    ->with([
                        'docente:id,nombres,apellidos',
                        'aula:id_aula,nombre,capacidad',
                        'ciclo:id_ciclo,nombre',
                        'horarios' => fn ($q): mixed => $q->orderBy('dia_semana')->orderBy('hora_inicio'),
                    ]);
            }])
            ->orderBy('nombre')
            ->get()
            ->map(fn (Curso $curso): array => $this->mapearCurso($curso))
            ->values();

        $eventos = $cursos
            ->flatMap(fn (array $curso): array => $this->mapearEventos($curso))
            ->values();

        return Inertia::render('cursos/index', [
            'cursos' => $cursos,
            'eventos' => $eventos,
            'cicloSeleccionadoId' => $cicloSeleccionadoId,
            'ciclos' => Ciclo::query()
                ->orderByDesc('fecha_inicio')
                ->get(['id_ciclo', 'nombre', 'tipo_ciclo', 'estado']),
            'docentes' => Docente::query()
                ->orderBy('apellidos')
                ->orderBy('nombres')
                ->get(['id', 'nombres', 'apellidos']),
            'aulas' => Aula::query()
                ->orderBy('nombre')
                ->get(['id_aula', 'nombre', 'capacidad']),
            'dias' => $this->diasSemana(),
        ]);
    }

    public function store(StoreCursoRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $curso = Curso::query()->create($this->datosCurso($data));

            $this->guardarAsignacionYHorarios($curso, $data);
        });

        return redirect()
            ->route('cursos.index', ['ciclo' => $data['id_ciclo']])
            ->with('success', 'Curso registrado correctamente.');
    }

    public function update(UpdateCursoRequest $request, Curso $curso): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($curso, $data): void {
            $curso->update($this->datosCurso($data));

            $this->guardarAsignacionYHorarios($curso, $data);
        });

        return redirect()
            ->route('cursos.index', ['ciclo' => $data['id_ciclo']])
            ->with('success', 'Curso actualizado correctamente.');
    }

    public function destroy(Curso $curso): RedirectResponse
    {
        $curso->delete();

        return redirect()
            ->route('cursos.index')
            ->with('success', 'Curso eliminado correctamente.');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{nombre: string, area_conoc: ?string, color: string}
     */
    private function datosCurso(array $data): array
    {
        return [
            'nombre' => $data['nombre'],
            'area_conoc' => $data['area_conoc'] ?? null,
            'color' => $data['color'],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function guardarAsignacionYHorarios(Curso $curso, array $data): void
    {
        $asignacion = $curso->asignaciones()
            ->where('id_ciclo', $data['id_ciclo'])
            ->first();

        if ($asignacion instanceof AsignacionDocente) {
            $asignacion->update($this->datosAsignacion($data));
        } else {
            $asignacion = $curso->asignaciones()->create($this->datosAsignacion($data));
        }

        $asignacion->horarios()->delete();

        foreach ($data['dias'] as $dia) {
            $asignacion->horarios()->create([
                'dia_semana' => $dia,
                'hora_inicio' => $data['hora_inicio'],
                'hora_fin' => $data['hora_fin'],
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{id_docente: int, id_ciclo: int, id_aula: int}
     */
    private function datosAsignacion(array $data): array
    {
        return [
            'id_docente' => (int) $data['id_docente'],
            'id_ciclo' => (int) $data['id_ciclo'],
            'id_aula' => (int) $data['id_aula'],
        ];
    }

    private function cicloPorDefectoId(): ?int
    {
        return Ciclo::query()
            ->where('estado', 'ABIERTO')
            ->orderBy('fecha_inicio')
            ->value('id_ciclo')
            ?? Ciclo::query()->orderByDesc('fecha_inicio')->value('id_ciclo');
    }

    /**
     * @return array<string, string>
     */
    private function diasSemana(): array
    {
        return [
            'LUN' => 'Lunes',
            'MAR' => 'Martes',
            'MIE' => 'Miercoles',
            'JUE' => 'Jueves',
            'VIE' => 'Viernes',
            'SAB' => 'Sabado',
            'DOM' => 'Domingo',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapearCurso(Curso $curso): array
    {
        $asignacion = $curso->asignaciones->first();

        return [
            'id_curso' => $curso->id_curso,
            'nombre' => $curso->nombre,
            'area_conoc' => $curso->area_conoc,
            'color' => $curso->color,
            'asignacion' => $asignacion ? [
                'id_asignacion' => $asignacion->id_asignacion,
                'id_docente' => $asignacion->id_docente,
                'id_ciclo' => $asignacion->id_ciclo,
                'id_aula' => $asignacion->id_aula,
                'docente_nombre' => trim("{$asignacion->docente?->nombres} {$asignacion->docente?->apellidos}"),
                'aula_nombre' => $asignacion->aula?->nombre,
                'ciclo_nombre' => $asignacion->ciclo?->nombre,
                'horarios' => $asignacion->horarios
                    ->map(fn ($horario): array => [
                        'id_horario' => $horario->id_horario,
                        'dia_semana' => $horario->dia_semana,
                        'hora_inicio' => $this->hora($horario->hora_inicio),
                        'hora_fin' => $this->hora($horario->hora_fin),
                    ])
                    ->values(),
            ] : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $curso
     * @return array<int, array<string, mixed>>
     */
    private function mapearEventos(array $curso): array
    {
        if (! $curso['asignacion']) {
            return [];
        }

        return $curso['asignacion']['horarios']
            ->map(fn (array $horario): array => [
                'id' => "{$curso['id_curso']}-{$horario['id_horario']}",
                'id_curso' => $curso['id_curso'],
                'nombre' => $curso['nombre'],
                'area_conoc' => $curso['area_conoc'],
                'color' => $curso['color'],
                'docente_nombre' => $curso['asignacion']['docente_nombre'],
                'aula_nombre' => $curso['asignacion']['aula_nombre'],
                'dia_semana' => $horario['dia_semana'],
                'hora_inicio' => $horario['hora_inicio'],
                'hora_fin' => $horario['hora_fin'],
            ])
            ->all();
    }

    private function hora(string $hora): string
    {
        return mb_substr($hora, 0, 5);
    }
}
