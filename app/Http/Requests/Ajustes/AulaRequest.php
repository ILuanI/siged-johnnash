<?php

namespace App\Http\Requests\Ajustes;

use App\Models\Aula;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AulaRequest extends FormRequest
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
        $aula = $this->route('aula');
        $id = $aula instanceof Aula ? $aula->id_aula : null;

        return [
            'nombre' => ['required', 'string', 'max:40', Rule::unique('aula', 'nombre')->ignore($id, 'id_aula')],
            'capacidad' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del aula es obligatorio.',
            'nombre.unique' => 'Ya existe un aula con ese nombre.',
            'capacidad.integer' => 'La capacidad debe ser un número entero.',
            'capacidad.min' => 'La capacidad debe ser al menos 1.',
        ];
    }
}
