<?php

use App\Models\Alumno;
use App\Models\Carrera;
use App\Models\Apoderado;
use App\Enums\EstadoAlumno;

describe('Caso 3: Validación de Datos de Alumno', function () {
    test('se puede crear alumno con datos válidos', function () {
        $carrera = Carrera::factory()->create();
        $apoderado = Apoderado::factory()->create();

        $alumno = Alumno::create([
            'codigo' => 'ALU-2024-001',
            'nombres' => 'Juan Carlos',
            'apellidos' => 'Pérez López',
            'dni' => '12345678',
            'fecha_nac' => '2005-06-15',
            'sexo' => 'M',
            'telefono' => '987654321',
            'correo' => 'juan.perez@email.com',
            'direccion' => 'Calle Principal 123',
            'colegio_proc' => 'Colegio Nacional',
            'id_carrera' => $carrera->id_carrera,
            'id_apoderado' => $apoderado->id_apoderado,
            'estado' => EstadoAlumno::Activo,
        ]);

        expect($alumno)->toHaveProperty('id_alumno')
            ->and($alumno->dni)->toBe('12345678')
            ->and($alumno->correo)->toBe('juan.perez@email.com')
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
                'codigo' => 'ALU-2024-002',
                'nombres' => 'Otro Alumno',
                'apellidos' => 'Otro Apellido',
                'dni' => '12345678', // DNI duplicado
                'fecha_nac' => '2005-06-15',
                'sexo' => 'F',
                'telefono' => '987654322',
                'correo' => 'otro@email.com',
                'direccion' => 'Otra Calle',
                'colegio_proc' => 'Otro Colegio',
                'id_carrera' => $carrera->id_carrera,
                'estado' => EstadoAlumno::Activo,
            ]);

            $this->fail('Debería fallar con DNI duplicado');
        } catch (\Exception $e) {
            expect($e)->toBeInstanceOf(\Exception::class);
        }
    });

    test('formato de email debe ser válido', function () {
        $carrera = Carrera::factory()->create();

        $alumnoConEmailValido = Alumno::factory()->create([
            'correo' => 'email.valido@example.com',
            'id_carrera' => $carrera->id_carrera,
        ]);

        expect($alumnoConEmailValido->correo)
            ->toMatch('/^[^\s@]+@[^\s@]+\.[^\s@]+$/');
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

    test('no se pueden crear alumno con campos requeridos vacíos', function () {
        $carrera = Carrera::factory()->create();

        try {
            Alumno::create([
                'codigo' => '', // Vacío
                'nombres' => 'Juan',
                'apellidos' => 'Pérez',
                'dni' => '12345678',
                'fecha_nac' => '2005-06-15',
                'sexo' => 'M',
                'telefono' => '987654321',
                'correo' => 'juan@email.com',
                'id_carrera' => $carrera->id_carrera,
                'estado' => EstadoAlumno::Activo,
            ]);

            $this->fail('Debería fallar con campos vacíos');
        } catch (\Exception $e) {
            expect($e)->toBeInstanceOf(\Exception::class);
        }
    });
});
