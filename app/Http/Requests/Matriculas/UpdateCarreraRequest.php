<?php

namespace App\Http\Requests\Matriculas;

use App\Models\Carrera;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCarreraRequest extends FormRequest
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
        /** @var Carrera|null $carrera */
        $carrera = $this->route('carrera');

        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('carrera', 'nombre')
                    ->where('id_area', $this->integer('id_area'))
                    ->ignore($carrera?->id_carrera, 'id_carrera'),
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
            'nombre.unique' => 'Esta carrera ya existe en el area seleccionada.',
            'id_area.required' => 'El area es obligatoria.',
            'id_area.exists' => 'El area seleccionada no es valida.',
            'puntaje_max.gte' => 'El puntaje maximo debe ser mayor o igual al minimo.',
        ];
    }
}
