<?php

namespace Database\Factories;

use App\Enums\EstadoMatricula;
use App\Enums\ModalidadMatricula;
use App\Enums\TipoPagoMatricula;
use App\Models\Alumno;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Matricula;
use App\Models\PeriodoAcademico;
use App\Models\Turno;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Matricula>
 */
class MatriculaFactory extends Factory
{
    protected $model = Matricula::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_alumno' => Alumno::factory(),
            'id_ciclo' => Ciclo::factory(),
            'id_periodo' => PeriodoAcademico::factory(),
            'id_turno' => Turno::factory(),
            'id_aula' => Aula::factory(),
            'fecha_matricula' => now()->toDateString(),
            'modalidad' => ModalidadMatricula::Presencial,
            'tipo_pago' => TipoPagoMatricula::Contado,
            'costo_total' => 1200,
            'estado' => EstadoMatricula::Vigente,
        ];
    }
}
