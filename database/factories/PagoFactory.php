<?php

namespace Database\Factories;

use App\Models\Cuota;
use App\Models\Pago;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pago>
 */
class PagoFactory extends Factory
{
    protected $model = Pago::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_cuota' => Cuota::factory(),
            'user_id' => User::factory(),
            'fecha_pago' => now(),
            'monto' => 100.00,
            'metodo_pago' => 'EFECTIVO',
            'estado' => 'PAGADO',
        ];
    }
}
