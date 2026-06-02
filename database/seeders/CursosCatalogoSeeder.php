<?php

namespace Database\Seeders;

use App\Models\AsignacionDocente;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Curso;
use App\Models\Docente;
use Illuminate\Database\Seeder;

class CursosCatalogoSeeder extends Seeder
{
    public function run(): void
    {
        $ciclo = Ciclo::query()->orderBy('fecha_inicio')->first();
        $aulas = Aula::query()->orderBy('nombre')->take(2)->get();
        $docentes = Docente::query()->orderBy('id')->take(6)->get();

        if (! $ciclo || $aulas->isEmpty() || $docentes->isEmpty()) {
            return;
        }

        $cursos = [
            ['nombre' => 'Algebra', 'area_conoc' => 'Matematica', 'color' => '#1a237e', 'docente' => 0, 'aula' => 0, 'dias' => ['LUN'], 'hora_inicio' => '08:00', 'hora_fin' => '09:00'],
            ['nombre' => 'Geometria', 'area_conoc' => 'Matematica', 'color' => '#ff7043', 'docente' => 1, 'aula' => 1, 'dias' => ['MAR'], 'hora_inicio' => '09:00', 'hora_fin' => '10:00'],
            ['nombre' => 'Fisica', 'area_conoc' => 'Ciencias', 'color' => '#0288d1', 'docente' => 2, 'aula' => 0, 'dias' => ['JUE'], 'hora_inicio' => '08:00', 'hora_fin' => '09:00'],
            ['nombre' => 'Quimica', 'area_conoc' => 'Ciencias', 'color' => '#8e24aa', 'docente' => 3, 'aula' => 1, 'dias' => ['VIE'], 'hora_inicio' => '09:00', 'hora_fin' => '10:00'],
            ['nombre' => 'Razonamiento Matematico', 'area_conoc' => 'Razonamiento', 'color' => '#2e7d32', 'docente' => 4, 'aula' => 0, 'dias' => ['MIE'], 'hora_inicio' => '10:30', 'hora_fin' => '11:30'],
        ];

        foreach ($cursos as $datos) {
            $curso = Curso::query()->firstOrCreate(
                ['nombre' => $datos['nombre']],
                ['area_conoc' => $datos['area_conoc'], 'color' => $datos['color']],
            );

            $asignacion = AsignacionDocente::query()->firstOrCreate(
                ['id_curso' => $curso->id_curso, 'id_ciclo' => $ciclo->id_ciclo],
                [
                    'id_docente' => $docentes[$datos['docente'] % $docentes->count()]->id,
                    'id_aula' => $aulas[$datos['aula'] % $aulas->count()]->id_aula,
                ],
            );

            if ($asignacion->horarios()->exists()) {
                continue;
            }

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
