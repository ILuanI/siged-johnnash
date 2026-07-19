<?php

namespace Database\Factories;

use App\Models\Apoderado;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Apoderado>
 */
class ApoderadoFactory extends Factory
{
    protected $model = Apoderado::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombres' => fake()->name(),
            'telefono' => fake()->numerify('9########'),
        ];
    }
}
