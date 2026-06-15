<?php

namespace App\Http\Requests\Cursos;

use App\Models\Horario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCursoRequest extends FormRequest
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
        return [
            'nombre' => ['required', 'string', 'max:80', Rule::unique('curso', 'nombre')],
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
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del curso es obligatorio.',
            'nombre.unique' => 'Ya existe un curso registrado con este nombre.',
            'color.required' => 'El color del curso es obligatorio.',
            'color.regex' => 'El formato del color debe ser un hexadecimal válido (ej. #FF7043).',
            'id_docente.required' => 'El docente es obligatorio.',
            'id_docente.exists' => 'El docente seleccionado no es válido.',
            'id_ciclo.required' => 'El ciclo académico es obligatorio.',
            'id_ciclo.exists' => 'El ciclo seleccionado no es válido.',
            'id_aula.required' => 'El aula es obligatoria.',
            'id_aula.exists' => 'El aula seleccionada no es válida.',
            'dias.required' => 'Debe seleccionar al menos un día de clases.',
            'dias.min' => 'Debe seleccionar al menos un día de clases.',
            'hora_inicio.required' => 'La hora de inicio es obligatoria.',
            'hora_inicio.date_format' => 'La hora de inicio debe tener el formato HH:MM.',
            'hora_fin.required' => 'La hora de fin es obligatoria.',
            'hora_fin.date_format' => 'La hora de fin debe tener el formato HH:MM.',
            'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validarCruces($validator);
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $dias = $this->input('dias', []);

        if (is_string($dias)) {
            $dias = explode(',', $dias);
        }

        $this->merge([
            'dias' => collect($dias)
                ->map(fn (mixed $dia): string => mb_strtoupper(trim((string) $dia)))
                ->filter()
                ->values()
                ->all(),
        ]);
    }

    protected function validarCruces(Validator $validator, ?int $ignorarAsignacionId = null): void
    {
        if ($validator->errors()->any()) {
            return;
        }

        foreach ($this->input('dias', []) as $dia) {
            if ($this->tieneCruceDocente($dia, $ignorarAsignacionId)) {
                $validator->errors()->add('id_docente', 'El docente ya tiene un curso programado en ese ciclo, dia y horario.');

                return;
            }

            if ($this->tieneCruceAula($dia, $ignorarAsignacionId)) {
                $validator->errors()->add('id_aula', 'El aula ya esta ocupada en ese ciclo, dia y horario.');

                return;
            }
        }
    }

    private function tieneCruceDocente(string $dia, ?int $ignorarAsignacionId): bool
    {
        return Horario::query()
            ->where('dia_semana', $dia)
            ->where('hora_inicio', '<', $this->input('hora_fin'))
            ->where('hora_fin', '>', $this->input('hora_inicio'))
            ->whereHas('asignacion', function ($query) use ($ignorarAsignacionId): void {
                $query->where('id_ciclo', $this->integer('id_ciclo'))
                    ->where('id_docente', $this->integer('id_docente'))
                    ->when($ignorarAsignacionId, fn ($q): mixed => $q->where('id_asignacion', '!=', $ignorarAsignacionId));
            })
            ->exists();
    }

    private function tieneCruceAula(string $dia, ?int $ignorarAsignacionId): bool
    {
        return Horario::query()
            ->where('dia_semana', $dia)
            ->where('hora_inicio', '<', $this->input('hora_fin'))
            ->where('hora_fin', '>', $this->input('hora_inicio'))
            ->whereHas('asignacion', function ($query) use ($ignorarAsignacionId): void {
                $query->where('id_ciclo', $this->integer('id_ciclo'))
                    ->where('id_aula', $this->integer('id_aula'))
                    ->when($ignorarAsignacionId, fn ($q): mixed => $q->where('id_asignacion', '!=', $ignorarAsignacionId));
            })
            ->exists();
    }
}
