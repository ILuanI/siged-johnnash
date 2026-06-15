<?php

namespace Database\Seeders;

use App\Enums\EstadoCiclo;
use App\Models\Area;
use App\Models\Aula;
use App\Models\Carrera;
use App\Models\Ciclo;
use App\Models\ColegioProcedencia;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use Illuminate\Database\Seeder;

class MatriculasCatalogoSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            'A' => [
                'nombre' => 'Ciencias Medicas',
                'carreras' => ['Medicina Humana', 'Enfermeria', 'Obstetricia', 'Odontologia'],
            ],
            'B' => [
                'nombre' => 'Ingenierias',
                'carreras' => ['Ingenieria de Sistemas', 'Ingenieria Civil', 'Ingenieria Industrial', 'Arquitectura'],
            ],
            'C' => [
                'nombre' => 'Finanzas',
                'carreras' => ['Administracion', 'Contabilidad', 'Economia', 'Negocios Internacionales'],
            ],
            'D' => [
                'nombre' => 'Letras',
                'carreras' => ['Derecho', 'Educacion', 'Comunicacion', 'Psicologia'],
            ],
        ];

        foreach ($areas as $codigo => $areaData) {
            $area = Area::query()->updateOrCreate(
                ['codigo' => $codigo],
                ['nombre' => $areaData['nombre']],
            );

            foreach ($areaData['carreras'] as $carrera) {
                Carrera::query()->firstOrCreate(
                    ['id_area' => $area->id_area, 'nombre' => $carrera],
                    ['puntaje_min' => 10, 'puntaje_max' => 20],
                );
            }
        }

        $periodo = PeriodoAcademico::query()->firstOrCreate(
            ['nombre' => 'Periodo 2026-I'],
            ['anio' => 2026, 'descripcion' => 'Periodo de prueba', 'estado' => 'ABIERTO'],
        );

        Ciclo::query()->firstOrCreate(
            ['nombre' => 'Ciclo Verano 2026'],
            [
                'id_periodo' => $periodo->id_periodo,
                'tipo_ciclo' => 'Intensivo',
                'fecha_inicio' => '2026-01-06',
                'fecha_fin' => '2026-03-15',
                'costo_base' => 1200,
                'estado' => EstadoCiclo::Abierto,
            ],
        );

        Turno::query()->firstOrCreate(['nombre' => 'Mañana']);
        Turno::query()->firstOrCreate(['nombre' => 'Tarde']);

        Aula::query()->firstOrCreate(['nombre' => 'Aula 101'], ['capacidad' => 30]);
        Aula::query()->firstOrCreate(['nombre' => 'Aula 102'], ['capacidad' => 25]);

        foreach (['Colegio Nacional', 'Colegio Particular', 'Otro'] as $colegio) {
            ColegioProcedencia::query()->firstOrCreate(['nombre' => $colegio]);
        }
    }
}
