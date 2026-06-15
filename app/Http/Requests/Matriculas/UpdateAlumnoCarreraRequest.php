<?php

namespace App\Http\Requests\Matriculas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAlumnoCarreraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'id_carrera' => ['required', 'integer', Rule::exists('carrera', 'id_carrera')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'id_carrera.required' => 'Selecciona la nueva carrera del alumno.',
            'id_carrera.exists' => 'La carrera seleccionada no es valida.',
        ];
    }
}
