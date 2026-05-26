<?php

namespace Database\Factories;

use App\Models\Aula;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aula>
 */
class AulaFactory extends Factory
{
    protected $model = Aula::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => 'Aula '.fake()->unique()->numberBetween(101, 999),
            'capacidad' => fake()->numberBetween(20, 40),
        ];
    }
}
