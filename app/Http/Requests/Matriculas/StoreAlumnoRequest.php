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
            'codigo' => ['nullable', 'string', 'max:15', Rule::unique('alumno', 'codigo')],
            'nombres' => ['required', 'string', 'max:80'],
            'apellidos' => ['required', 'string', 'max:80'],
            'dni' => ['nullable', 'digits:8', Rule::unique('alumno', 'dni')],
            'fecha_nac' => ['nullable', 'date', 'before:today'],
            'sexo' => ['nullable', Rule::in(['M', 'F', 'OTRO'])],
            'telefono' => ['nullable', 'string', 'max:20'],
            'correo' => ['nullable', 'email', 'max:120'],
            'direccion' => ['nullable', 'string', 'max:160'],
            'colegio_proc' => ['nullable', 'string', 'max:120'],
            'id_carrera' => ['nullable', 'integer', Rule::exists('carrera', 'id_carrera')],
            'id_apoderado' => ['nullable', 'integer', Rule::exists('apoderado', 'id_apoderado')],
            'apoderado' => ['nullable', 'array'],
            'apoderado.nombres' => ['required_with:apoderado', 'string', 'max:120'],
            'apoderado.dni' => ['nullable', 'digits:8'],
            'apoderado.telefono' => ['nullable', 'string', 'max:20'],
            'apoderado.parentesco' => ['nullable', 'string', 'max:40'],
            'apoderado.correo' => ['nullable', 'email', 'max:120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dni.unique' => 'Ya existe un alumno registrado con este DNI.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'nombres.required' => 'Los nombres del alumno son obligatorios.',
            'apellidos.required' => 'Los apellidos del alumno son obligatorios.',
        ];
    }
}
