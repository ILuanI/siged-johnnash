<?php

namespace App\Http\Requests\Matriculas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCarreraRequest extends FormRequest
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
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('carrera', 'nombre')->where('id_area', $this->integer('id_area')),
            ],
            'id_area' => ['required', 'integer', Rule::exists('area', 'id_area')],
            'puntaje_min' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'puntaje_max' => ['nullable', 'numeric', 'min:0', 'max:20', 'gte:puntaje_min'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la carrera es obligatorio.',
            'nombre.unique' => 'Esta carrera ya existe en el área seleccionada.',
            'id_area.required' => 'El área es obligatoria.',
            'id_area.exists' => 'El área seleccionada no es válida.',
            'puntaje_min.numeric' => 'El puntaje mínimo debe ser un número.',
            'puntaje_min.min' => 'El puntaje mínimo no puede ser menor a 0.',
            'puntaje_min.max' => 'El puntaje mínimo no puede ser mayor a 20.',
            'puntaje_max.numeric' => 'El puntaje máximo debe ser un número.',
            'puntaje_max.min' => 'El puntaje máximo no puede ser menor a 0.',
            'puntaje_max.max' => 'El puntaje máximo no puede ser mayor a 20.',
            'puntaje_max.gte' => 'El puntaje máximo debe ser mayor o igual al mínimo.',
        ];
    }
}
