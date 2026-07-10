<?php

namespace Database\Factories;

use App\Models\Matricula;
use App\Models\PrediccionDesercion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PrediccionDesercion>
 */
class PrediccionDesercionFactory extends Factory
{
    protected $model = PrediccionDesercion::class;

    public function definition(): array
    {
        return [
            'id_matricula' => Matricula::factory(),
            'riesgo_pct' => fake()->randomFloat(2, 0, 100),
            'nivel_riesgo' => fake()->randomElement(['BAJO', 'MEDIO', 'ALTO']),
            'tasa_asistencia' => fake()->randomFloat(2, 50, 100),
            'promedio_examenes' => fake()->randomFloat(2, 0, 20),
            'fecha_calculo' => now(),
        ];
    }
}
