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
