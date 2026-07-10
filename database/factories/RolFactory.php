<?php

namespace Database\Factories;

use App\Models\Rol;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rol>
 */
class RolFactory extends Factory
{
    protected $model = Rol::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->word(),
            'descripcion' => fake()->optional()->sentence(),
        ];
    }

    public function administrador(): static
    {
        return $this->state(fn (array $attributes) => [
            'nombre' => 'Administrador',
            'descripcion' => 'Acceso completo al sistema',
        ]);
    }
}
