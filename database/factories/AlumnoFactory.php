<?php

namespace Database\Factories;

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alumno>
 */
class AlumnoFactory extends Factory
{
    protected $model = Alumno::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dni = fake()->unique()->numerify('########');

        return [
            'nombres' => fake()->firstName(),
            'apellidos' => fake()->lastName().' '.fake()->lastName(),
            'dni' => $dni,
            'fecha_nac' => fake()->date(),
            'sexo' => fake()->randomElement(['M', 'F']),
            'telefono' => fake()->phoneNumber(),
            'estado' => EstadoAlumno::Activo,
        ];
    }
}
