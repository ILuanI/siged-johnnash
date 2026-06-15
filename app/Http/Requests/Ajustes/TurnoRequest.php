<?php

namespace App\Http\Requests\Ajustes;

use App\Models\Turno;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TurnoRequest extends FormRequest
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
        $turno = $this->route('turno');
        $id = $turno instanceof Turno ? $turno->id_turno : null;

        return [
            'nombre' => ['required', 'string', 'max:40', Rule::unique('turno', 'nombre')->ignore($id, 'id_turno')],
            'hora_inicio' => ['nullable', 'date_format:H:i'],
            'hora_fin' => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del turno es obligatorio.',
            'nombre.unique' => 'Ya existe un turno con ese nombre.',
            'hora_inicio.date_format' => 'La hora de inicio debe tener el formato HH:MM.',
            'hora_fin.date_format' => 'La hora de fin debe tener el formato HH:MM.',
            'hora_fin.after' => 'La hora de fin debe ser posterior a la de inicio.',
        ];
    }
}
