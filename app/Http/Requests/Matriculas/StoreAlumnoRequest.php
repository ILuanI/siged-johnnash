<?php

namespace App\Http\Requests\Matriculas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlumnoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('dni')) {
            $this->merge([
                'codigo' => $this->input('dni'),
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
        return [
            'codigo' => ['required', 'digits:8', Rule::unique('alumno', 'codigo')],
            'nombres' => ['required', 'string', 'max:80'],
            'apellidos' => ['required', 'string', 'max:80'],
            'dni' => ['required', 'digits:8', Rule::unique('alumno', 'dni')],
            'fecha_nac' => ['nullable', 'date', 'before:today'],
            'sexo' => ['nullable', Rule::in(['M', 'F', 'OTRO'])],
            'telefono' => ['nullable', 'string', 'max:20'],
            'colegio_procedencia_id' => ['nullable', 'integer', Rule::exists('colegio_procedencia', 'id_colegio_procedencia')],
            'id_carrera' => ['nullable', 'integer', Rule::exists('carrera', 'id_carrera')],
            'id_apoderado' => ['nullable', 'integer', Rule::exists('apoderado', 'id_apoderado')],
            'apoderado' => ['nullable', 'array'],
            'apoderado.nombres' => ['required_with:apoderado', 'string', 'max:120'],
            'apoderado.telefono' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.unique' => 'El código de alumno ya existe.',
            'codigo.digits' => 'El código del alumno debe ser el DNI de 8 dígitos.',
            'nombres.required' => 'El nombre del alumno es obligatorio.',
            'apellidos.required' => 'El apellido del alumno es obligatorio.',
            'dni.required' => 'El DNI del alumno es obligatorio.',
            'dni.unique' => 'Ya existe un alumno registrado con este DNI.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'fecha_nac.date' => 'La fecha de nacimiento no es una fecha válida.',
            'fecha_nac.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'sexo.in' => 'El género seleccionado no es válido.',
            'colegio_procedencia_id.exists' => 'El colegio de procedencia seleccionado no es válido.',
            'id_carrera.exists' => 'La carrera seleccionada no es válida.',
            'apoderado.nombres.required_with' => 'El nombre del apoderado es obligatorio si se ingresan sus datos.',
        ];
    }
}
