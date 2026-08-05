<?php

namespace Database\Factories;

use App\Models\AuditoriaPago;
use App\Models\Pago;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditoriaPago>
 */
class AuditoriaPagoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pago_id' => Pago::factory(),
            'usuario_id' => User::factory(),
            'accion' => 'ANULACION',
            'motivo' => null,
        ];
    }
}
