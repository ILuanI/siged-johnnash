<?php

namespace Database\Factories;

use App\Models\AsignacionDocente;
use App\Models\Horario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Horario>
 */
class HorarioFactory extends Factory
{
    protected $model = Horario::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $inicio = fake()->randomElement(['07:00', '08:00', '09:00', '10:30', '14:00', '16:00']);

        return [
            'id_asignacion' => AsignacionDocente::factory(),
            'dia_semana' => fake()->randomElement(['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']),
            'hora_inicio' => $inicio,
            'hora_fin' => match ($inicio) {
                '07:00' => '08:30',
                '08:00' => '10:00',
                '09:00' => '10:30',
                '10:30' => '12:00',
                '14:00' => '15:30',
                default => '17:30',
            },
        ];
    }
}
