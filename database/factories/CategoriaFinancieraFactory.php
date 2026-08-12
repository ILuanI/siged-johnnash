<?php

namespace Database\Factories;

use App\Enums\TipoCategoriaFinanciera;
use App\Models\CategoriaFinanciera;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategoriaFinanciera>
 */
class CategoriaFinancieraFactory extends Factory
{
    protected $model = CategoriaFinanciera::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->lexify('CATEGORIA-????'),
            'tipo' => fake()->randomElement(TipoCategoriaFinanciera::cases()),
            'es_por_defecto' => false,
            'descripcion' => fake()->optional()->sentence(6),
        ];
    }

    public function ingreso(): static
    {
        return $this->state(fn () => [
            'tipo' => TipoCategoriaFinanciera::Ingreso,
        ]);
    }

    public function egreso(): static
    {
        return $this->state(fn () => [
            'tipo' => TipoCategoriaFinanciera::Egreso,
        ]);
    }

    public function porDefecto(): static
    {
        return $this->state(fn () => [
            'es_por_defecto' => true,
        ]);
    }
}
