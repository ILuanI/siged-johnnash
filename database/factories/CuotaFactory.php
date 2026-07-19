<?php

namespace Database\Factories;

use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cuota>
 */
class CuotaFactory extends Factory
{
    protected $model = Cuota::class;

    public function definition(): array
    {
        return [
            'id_comprobante' => ComprobantePago::factory(),
            'numero_cuota' => fake()->numberBetween(1, 4),
            'monto' => 500.00,
            'fecha_vencimiento' => fake()->date(),
            'estado' => EstadoCuota::Pendiente,
        ];
    }
}
