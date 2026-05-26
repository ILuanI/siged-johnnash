<?php

namespace Database\Factories;

use App\Models\PeriodoAcademico;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PeriodoAcademico>
 */
class PeriodoAcademicoFactory extends Factory
{
    protected $model = PeriodoAcademico::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => 'Periodo '.fake()->unique()->year(),
            'anio' => (int) now()->format('Y'),
            'estado' => 'ABIERTO',
        ];
    }
}
