<?php

namespace Database\Factories;

use App\Enums\EstadoCiclo;
use App\Models\Ciclo;
use App\Models\PeriodoAcademico;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ciclo>
 */
class CicloFactory extends Factory
{
    protected $model = Ciclo::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_periodo' => PeriodoAcademico::factory(),
            'nombre' => 'Ciclo '.fake()->unique()->word(),
            'tipo_ciclo' => fake()->randomElement(['Intensivo', 'Anual', 'Semestral']),
            'fecha_inicio' => now()->startOfYear()->toDateString(),
            'fecha_fin' => now()->endOfYear()->toDateString(),
            'costo_base' => fake()->randomFloat(2, 500, 2000),
            'estado' => EstadoCiclo::Abierto,
        ];
    }
}
