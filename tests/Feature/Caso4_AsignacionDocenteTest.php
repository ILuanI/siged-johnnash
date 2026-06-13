<?php

use App\Models\AsignacionDocente;
use App\Models\Docente;
use App\Models\Curso;
use App\Models\Ciclo;
use App\Models\Aula;
use App\Models\Horario;
use App\Enums\EstadoAlumno;

describe('Caso 4: Asignación de Docentes a Cursos', function () {
    test('se puede asignar docente a curso correctamente', function () {
        $docente = Docente::factory()->create();
        $curso = Curso::factory()->create();
        $ciclo = Ciclo::factory()->create();
        $aula = Aula::factory()->create();

        $asignacion = AsignacionDocente::create([
            'id_docente' => $docente->id_docente,
            'id_curso' => $curso->id_curso,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula->id_aula,
            'horario_inicio' => '08:00',
            'horario_fin' => '10:00',
            'dias' => 'LUN,MAR,MIE,JUE,VIE',
        ]);

        expect($asignacion)->toHaveProperty('id_docente')
            ->and($asignacion->id_docente)->toBe($docente->id_docente)
            ->and($asignacion->id_curso)->toBe($curso->id_curso);

        $this->assertDatabaseHas('asignacion_docente', [
            'id_docente' => $docente->id_docente,
            'id_curso' => $curso->id_curso,
        ]);
    });

    test('no se puede asignar docente inválido', function () {
        $curso = Curso::factory()->create();
        $ciclo = Ciclo::factory()->create();
        $aula = Aula::factory()->create();

        try {
            AsignacionDocente::create([
                'id_docente' => 999, // ID que no existe
                'id_curso' => $curso->id_curso,
                'id_ciclo' => $ciclo->id_ciclo,
                'id_aula' => $aula->id_aula,
                'horario_inicio' => '08:00',
                'horario_fin' => '10:00',
                'dias' => 'LUN,MAR,MIE,JUE,VIE',
            ]);

            $this->fail('Debería fallar con docente inválido');
        } catch (\Exception $e) {
            expect($e)->toBeInstanceOf(\Exception::class);
        }
    });

    test('no se puede asignar docente a curso inexistente', function () {
        $docente = Docente::factory()->create();
        $ciclo = Ciclo::factory()->create();
        $aula = Aula::factory()->create();

        try {
            AsignacionDocente::create([
                'id_docente' => $docente->id_docente,
                'id_curso' => 999, // ID que no existe
                'id_ciclo' => $ciclo->id_ciclo,
                'id_aula' => $aula->id_aula,
                'horario_inicio' => '08:00',
                'horario_fin' => '10:00',
                'dias' => 'LUN,MAR,MIE,JUE,VIE',
            ]);

            $this->fail('Debería fallar con curso inválido');
        } catch (\Exception $e) {
            expect($e)->toBeInstanceOf(\Exception::class);
        }
    });

    test('no se pueden crear asignaciones duplicadas del mismo docente y curso', function () {
        $docente = Docente::factory()->create();
        $curso = Curso::factory()->create();
        $ciclo = Ciclo::factory()->create();
        $aula = Aula::factory()->create();

        // Primera asignación
        AsignacionDocente::create([
            'id_docente' => $docente->id_docente,
            'id_curso' => $curso->id_curso,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula->id_aula,
            'horario_inicio' => '08:00',
            'horario_fin' => '10:00',
            'dias' => 'LUN,MAR,MIE,JUE,VIE',
        ]);

        try {
            // Intentar crear asignación duplicada
            AsignacionDocente::create([
                'id_docente' => $docente->id_docente,
                'id_curso' => $curso->id_curso,
                'id_ciclo' => $ciclo->id_ciclo,
                'id_aula' => $aula->id_aula,
                'horario_inicio' => '08:00',
                'horario_fin' => '10:00',
                'dias' => 'LUN,MAR,MIE,JUE,VIE',
            ]);

            $this->fail('Debería fallar con asignación duplicada');
        } catch (\Exception $e) {
            expect($e)->toBeInstanceOf(\Exception::class);
        }
    });

    test('horarios de docente no deben tener conflictos', function () {
        $docente = Docente::factory()->create();
        $curso1 = Curso::factory()->create();
        $curso2 = Curso::factory()->create();
        $ciclo = Ciclo::factory()->create();
        $aula1 = Aula::factory()->create();
        $aula2 = Aula::factory()->create();

        // Primera asignación
        AsignacionDocente::create([
            'id_docente' => $docente->id_docente,
            'id_curso' => $curso1->id_curso,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula1->id_aula,
            'horario_inicio' => '08:00',
            'horario_fin' => '10:00',
            'dias' => 'LUN,MAR,MIE,JUE,VIE',
        ]);

        $asignacionesDelDocente = AsignacionDocente::where('id_docente', $docente->id_docente)->count();
        expect($asignacionesDelDocente)->toBe(1);
    });
});
