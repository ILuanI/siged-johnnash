<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\AsignacionDocente;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Turno;
use Illuminate\Database\Seeder;

class CursosCatalogoSeeder extends Seeder
{
    public function run(): void
    {
        $ciclo = Ciclo::query()->orderBy('fecha_inicio')->first();
        $aulas = Aula::query()->orderBy('nombre')->take(2)->get();
        $docentes = Docente::query()->orderBy('id')->take(6)->get();
        $turnos = Turno::query()->orderBy('nombre')->get();

        if (! $ciclo || $aulas->isEmpty() || $docentes->isEmpty() || $turnos->isEmpty()) {
            return;
        }

        $turnoManana = $turnos->firstWhere('nombre', 'Mañana') ?? $turnos->first();
        $turnoTarde = $turnos->firstWhere('nombre', 'Tarde') ?? $turnos->last();

        $areaPorNombre = function (string $nombre): ?int {
            return Area::query()->where('nombre', $nombre)->value('id_area');
        };

        $cursos = [
            ['nombre' => 'Algebra', 'area_conoc' => 'Matematica', 'area_catalogo' => 'Ingenierias', 'color' => '#1a237e', 'docente' => 0, 'aula' => 0, 'turno' => $turnoManana, 'dias' => ['LUN'], 'hora_inicio' => '08:00', 'hora_fin' => '09:00'],
            ['nombre' => 'Geometria', 'area_conoc' => 'Matematica', 'area_catalogo' => 'Ingenierias', 'color' => '#ff7043', 'docente' => 1, 'aula' => 1, 'turno' => $turnoManana, 'dias' => ['MAR'], 'hora_inicio' => '09:00', 'hora_fin' => '10:00'],
            ['nombre' => 'Fisica', 'area_conoc' => 'Ciencias', 'area_catalogo' => 'Ciencias Medicas', 'color' => '#0288d1', 'docente' => 2, 'aula' => 0, 'turno' => $turnoManana, 'dias' => ['JUE'], 'hora_inicio' => '08:00', 'hora_fin' => '09:00'],
            ['nombre' => 'Quimica', 'area_conoc' => 'Ciencias', 'area_catalogo' => 'Ciencias Medicas', 'color' => '#8e24aa', 'docente' => 3, 'aula' => 1, 'turno' => $turnoTarde, 'dias' => ['VIE'], 'hora_inicio' => '15:00', 'hora_fin' => '16:00'],
            ['nombre' => 'Razonamiento Matematico', 'area_conoc' => 'Razonamiento', 'area_catalogo' => 'Letras', 'color' => '#2e7d32', 'docente' => 4, 'aula' => 0, 'turno' => $turnoTarde, 'dias' => ['MIE'], 'hora_inicio' => '16:00', 'hora_fin' => '17:00'],
        ];

        foreach ($cursos as $datos) {
            $curso = Curso::query()->firstOrCreate(
                ['nombre' => $datos['nombre']],
                ['area_conoc' => $datos['area_conoc'], 'color' => $datos['color']],
            );

            $idArea = $areaPorNombre($datos['area_catalogo']);
            if ($idArea !== null) {
                $curso->update(['id_area' => $idArea]);
            }

            $asignacion = AsignacionDocente::query()->firstOrCreate(
                ['id_curso' => $curso->id_curso, 'id_ciclo' => $ciclo->id_ciclo],
                [
                    'id_docente' => $docentes[$datos['docente'] % $docentes->count()]->id,
                    'id_aula' => $aulas[$datos['aula'] % $aulas->count()]->id_aula,
                    'id_turno' => $datos['turno']?->id_turno,
                ],
            );

            if ($asignacion->id_turno === null && $datos['turno']) {
                $asignacion->update(['id_turno' => $datos['turno']->id_turno]);
            }

            $asignacion->horarios()->delete();
            foreach ($datos['dias'] as $dia) {
                $asignacion->horarios()->create([
                    'dia_semana' => $dia,
                    'hora_inicio' => $datos['hora_inicio'],
                    'hora_fin' => $datos['hora_fin'],
                ]);
            }
        }
    }
}
