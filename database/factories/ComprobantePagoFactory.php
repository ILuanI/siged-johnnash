<?php

namespace Database\Factories;

use App\Enums\ConceptoPago;
use App\Models\ComprobantePago;
use App\Models\Matricula;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComprobantePago>
 */
class ComprobantePagoFactory extends Factory
{
    protected $model = ComprobantePago::class;

    public function definition(): array
    {
        return [
            'id_matricula' => Matricula::factory(),
            'numero' => fake()->unique()->numerify('B###-########'),
            'tipo' => fake()->randomElement(['BOLETA', 'FACTURA']),
            'concepto' => ConceptoPago::Matricula,
            'fecha_emision' => fake()->date(),
            'costo_total' => 1500.00,
            'saldo_pendiente' => 1000.00,
        ];
    }
}
