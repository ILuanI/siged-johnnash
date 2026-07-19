<?php

namespace App\Http\Requests\Asistencias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertAsistenciaRequest extends FormRequest
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
            'id_alumno' => ['required', 'integer', Rule::exists('alumno', 'id_alumno')],
            'fecha' => ['required', 'date'],
            'estado' => ['required', Rule::in(['ASISTIO', 'TARDANZA', 'FALTO', 'JUSTIFICADO'])],
            'id_asignacion' => ['nullable', 'integer', Rule::exists('asignacion_docente', 'id_asignacion')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'id_alumno.required' => 'Debes indicar el alumno.',
            'id_alumno.exists' => 'El alumno seleccionado no existe.',
            'fecha.required' => 'Debes indicar la fecha de asistencia.',
            'estado.in' => 'El estado de asistencia no es válido.',
        ];
    }
}
