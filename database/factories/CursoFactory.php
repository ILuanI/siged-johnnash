<?php

namespace Database\Factories;

use App\Models\Curso;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Curso>
 */
class CursoFactory extends Factory
{
    protected $model = Curso::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->randomElement([
                'Aritmetica',
                'Algebra',
                'Geometria',
                'Fisica',
                'Quimica',
                'Razonamiento Matematico',
                'Biologia',
                'Lenguaje',
            ]).' '.fake()->unique()->numberBetween(1, 999),
            'area_conoc' => fake()->randomElement(['Matematica', 'Ciencias', 'Letras', 'Razonamiento']),
            'color' => fake()->randomElement(['#1a237e', '#ff7043', '#2e7d32', '#0288d1', '#8e24aa']),
        ];
    }
}
