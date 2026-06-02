<?php

namespace Database\Factories;

use App\Models\AsignacionDocente;
use App\Models\Aula;
use App\Models\Ciclo;
use App\Models\Curso;
use App\Models\Docente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AsignacionDocente>
 */
class AsignacionDocenteFactory extends Factory
{
    protected $model = AsignacionDocente::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_docente' => Docente::factory(),
            'id_curso' => Curso::factory(),
            'id_ciclo' => Ciclo::factory(),
            'id_aula' => Aula::factory(),
        ];
    }
}
