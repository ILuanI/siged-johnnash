<?php

namespace Database\Factories;

use App\Models\AuditoriaCuota;
use App\Models\Cuota;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditoriaCuota>
 */
class AuditoriaCuotaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cuota_id' => Cuota::factory(),
            'usuario_id' => User::factory(),
            'accion' => 'EXONERAR',
            'motivo' => null,
        ];
    }
}