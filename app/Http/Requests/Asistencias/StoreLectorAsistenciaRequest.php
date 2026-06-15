<?php

namespace App\Http\Requests\Asistencias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLectorAsistenciaRequest extends FormRequest
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
            'dni' => ['required', 'digits:8'],
            'id_asignacion' => ['nullable', 'integer', Rule::exists('asignacion_docente', 'id_asignacion')],
            'nombres_convenio' => ['nullable', 'string', 'max:160'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dni.required' => 'Escanea o ingresa un DNI.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'id_asignacion.exists' => 'La asignación académica seleccionada no es válida.',
        ];
    }
}
