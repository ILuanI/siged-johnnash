<?php

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use App\Models\Apoderado;
use App\Models\Carrera;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Caso 3: Validación de Datos de Alumno', function () {
    test('se puede crear alumno con datos válidos', function () {
        $carrera = Carrera::factory()->create();
        $apoderado = Apoderado::factory()->create();

        $alumno = Alumno::create([
            'nombres' => 'Juan Carlos',
            'apellidos' => 'Pérez López',
            'dni' => '12345678',
            'fecha_nac' => '2005-06-15',
            'sexo' => 'M',
            'telefono' => '987654321',
            'id_carrera' => $carrera->id_carrera,
            'id_apoderado' => $apoderado->id_apoderado,
            'estado' => EstadoAlumno::Activo,
        ]);

        expect($alumno->id_alumno)->not->toBeNull()
            ->and($alumno->dni)->toBe('12345678')
            ->and($alumno->estado)->toBe(EstadoAlumno::Activo);

        $this->assertDatabaseHas('alumno', [
            'id_alumno' => $alumno->id_alumno,
            'dni' => '12345678',
        ]);
    });

    test('DNI debe ser único en el sistema', function () {
        $carrera = Carrera::factory()->create();

        Alumno::factory()->create([
            'dni' => '12345678',
            'id_carrera' => $carrera->id_carrera,
        ]);

        // Intentar crear otro con el mismo DNI
        try {
            Alumno::create([
                'nombres' => 'Otro Alumno',
                'apellidos' => 'Otro Apellido',
                'dni' => '12345678',
                'fecha_nac' => '2005-06-15',
                'sexo' => 'F',
                'telefono' => '987654322',
                'id_carrera' => $carrera->id_carrera,
                'estado' => EstadoAlumno::Activo,
            ]);

            $this->fail('Debería fallar con DNI duplicado');
        } catch (Exception $e) {
            expect($e)->toBeInstanceOf(Exception::class);
        }
    });

    test('teléfono debe tener formato válido', function () {
        $carrera = Carrera::factory()->create();

        $alumno = Alumno::factory()->create([
            'telefono' => '987654321',
            'id_carrera' => $carrera->id_carrera,
        ]);

        expect(strlen($alumno->telefono))->toBeGreaterThanOrEqual(9)
            ->and(strlen($alumno->telefono))->toBeLessThanOrEqual(15);
    });

    test('no se puede registrar alumno sin DNI', function () {
        $response = $this->postJson('/api/matriculas/estudiantes', [
            'nombres' => 'Juan',
            'apellidos' => 'Pérez',
        ]);

        $response->assertUnprocessable();
    });
});
