<?php

namespace App\Http\Requests\Cursos;

use App\Models\Curso;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCursoRequest extends StoreCursoRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $curso = $this->route('curso');

        return [
            'nombre' => [
                'required',
                'string',
                'max:80',
                Rule::unique('curso', 'nombre')->ignore($curso instanceof Curso ? $curso->id_curso : null, 'id_curso'),
            ],
            'area_conoc' => ['nullable', 'string', 'max:40'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'id_docente' => ['required', 'integer', 'exists:docentes,id'],
            'id_ciclo' => ['required', 'integer', 'exists:ciclo,id_ciclo'],
            'id_aula' => ['required', 'integer', 'exists:aula,id_aula'],
            'dias' => ['required', 'array', 'min:1'],
            'dias.*' => ['required', Rule::in(['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'])],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validarCruces($validator, $this->asignacionActualId());
            },
        ];
    }

    private function asignacionActualId(): ?int
    {
        $curso = $this->route('curso');

        if (! $curso instanceof Curso) {
            return null;
        }

        return $curso->asignaciones()
            ->where('id_ciclo', $this->integer('id_ciclo'))
            ->value('id_asignacion');
    }
}
