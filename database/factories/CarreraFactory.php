<?php

namespace Database\Factories;

use App\Models\Area;
use App\Models\Carrera;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Carrera>
 */
class CarreraFactory extends Factory
{
    protected $model = Carrera::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_area' => Area::factory(),
            'nombre' => fake()->unique()->words(3, true),
            'puntaje_min' => 10,
            'puntaje_max' => 20,
        ];
    }
}
