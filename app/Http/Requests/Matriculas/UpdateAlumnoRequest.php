<?php

namespace App\Http\Requests\Matriculas;

use App\Enums\EstadoAlumno;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAlumnoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('dni')) {
            $this->merge([
                'dni' => trim((string) $this->input('dni')),
            ]);
        }

        if ($this->has('apoderado') && blank($this->input('apoderado.nombres'))) {
            $this->request->remove('apoderado');
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $alumno = $this->route('alumno');

        return [
            'nombres' => ['required', 'string', 'max:80'],
            'apellidos' => ['required', 'string', 'max:80'],
            'dni' => [
                'required',
                'digits:8',
                Rule::unique('alumno', 'dni')->ignore($alumno?->id_alumno, 'id_alumno'),
            ],
            'fecha_nac' => ['nullable', 'date', 'before:today'],
            'sexo' => ['nullable', Rule::in(['M', 'F', 'OTRO'])],
            'telefono' => ['nullable', 'string', 'max:20'],
            'colegio_procedencia_id' => ['nullable', 'integer', Rule::exists('colegio_procedencia', 'id_colegio_procedencia')],
            'id_carrera' => ['nullable', 'integer', Rule::exists('carrera', 'id_carrera')],
            'estado' => ['nullable', Rule::enum(EstadoAlumno::class)],
            'apoderado' => ['nullable', 'array'],
            'apoderado.nombres' => ['required_with:apoderado', 'string', 'max:120'],
            'apoderado.telefono' => ['nullable', 'string', 'max:20'],
        ];
    }
}
