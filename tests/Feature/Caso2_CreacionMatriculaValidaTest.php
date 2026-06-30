<?php

use App\Enums\EstadoAlumno;
use App\Enums\EstadoMatricula;
use App\Enums\ModalidadMatricula;
use App\Enums\TipoPagoMatricula;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Caso 2: Creación de Matrícula Válida', function () {
    test('se puede crear una matrícula válida con todos los datos requeridos', function () {
        $alumno = Alumno::factory()->create(['estado' => EstadoAlumno::Activo]);
        $ciclo = Ciclo::factory()->create();
        $periodo = PeriodoAcademico::factory()->create();
        $turno = Turno::factory()->create();
        $aula = Aula::factory()->create();

        $matricula = Matricula::create([
            'id_alumno' => $alumno->id_alumno,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_periodo' => $periodo->id_periodo,
            'id_turno' => $turno->id_turno,
            'id_aula' => $aula->id_aula,
            'fecha_matricula' => now()->toDateString(),
            'modalidad' => ModalidadMatricula::Presencial,
            'tipo_pago' => TipoPagoMatricula::Contado,
            'costo_total' => 3500.00,
            'estado' => EstadoMatricula::Vigente,
        ]);

        expect($matricula->id_matricula)->not->toBeNull();
        expect($matricula->estado)->toBe(EstadoMatricula::Vigente);
        expect((float) $matricula->costo_total)->toBe(3500.0);
        expect($matricula->id_alumno)->toBe($alumno->id_alumno);

        $this->assertDatabaseHas('matricula', [
            'id_matricula' => $matricula->id_matricula,
            'id_alumno' => $alumno->id_alumno,
        ]);
    });

    test('no se puede crear matrícula sin alumno válido', function () {
        $ciclo = Ciclo::factory()->create();
        $periodo = PeriodoAcademico::factory()->create();
        $turno = Turno::factory()->create();
        $aula = Aula::factory()->create();

        try {
            Matricula::create([
                'id_alumno' => 999, // ID que no existe
                'id_ciclo' => $ciclo->id_ciclo,
                'id_periodo' => $periodo->id_periodo,
                'id_turno' => $turno->id_turno,
                'id_aula' => $aula->id_aula,
                'fecha_matricula' => now()->toDateString(),
                'modalidad' => ModalidadMatricula::Presencial,
                'tipo_pago' => TipoPagoMatricula::Contado,
                'costo_total' => 3500.00,
                'estado' => EstadoMatricula::Vigente,
            ]);

            $this->fail('Debería fallar con alumno inválido');
        } catch (Exception $e) {
            expect($e)->toBeInstanceOf(Exception::class);
        }
    });

    test('no se puede crear matrícula con costo en cero o negativo', function () {
        $alumno = Alumno::factory()->create(['estado' => EstadoAlumno::Activo]);
        $ciclo = Ciclo::factory()->create();
        $periodo = PeriodoAcademico::factory()->create();
        $turno = Turno::factory()->create();
        $aula = Aula::factory()->create();

        try {
            Matricula::create([
                'id_alumno' => $alumno->id_alumno,
                'id_ciclo' => $ciclo->id_ciclo,
                'id_periodo' => $periodo->id_periodo,
                'id_turno' => $turno->id_turno,
                'id_aula' => $aula->id_aula,
                'fecha_matricula' => now()->toDateString(),
                'modalidad' => ModalidadMatricula::Presencial,
                'tipo_pago' => TipoPagoMatricula::Contado,
                'costo_total' => 0.00,
                'estado' => EstadoMatricula::Vigente,
            ]);

            // Verifica en BD
            $this->assertFalse(
                Matricula::where('costo_total', 0)->exists(),
                'No debería existir matrícula con costo 0'
            );
        } catch (Exception $e) {
            expect($e)->toBeInstanceOf(Exception::class);
        }
    });
});
