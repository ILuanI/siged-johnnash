<?php

namespace App\Http\Requests\Matriculas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCursoRequest extends FormRequest
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
            'nombre' => ['required', 'string', 'max:80', Rule::unique('curso', 'nombre')],
            'area_conoc' => ['nullable', 'string', 'max:40'],
            'color' => ['required', 'string', 'size:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del curso es obligatorio.',
            'nombre.max' => 'El nombre del curso no puede exceder 80 caracteres.',
            'nombre.unique' => 'Ya existe un curso con ese nombre.',
            'area_conoc.max' => 'El área de conocimiento no puede exceder 40 caracteres.',
            'color.required' => 'El color es obligatorio.',
            'color.size' => 'El color debe tener 7 caracteres (ej. #FF7043).',
            'color.regex' => 'El color debe ser un código hexadecimal válido (ej. #FF7043).',
        ];
    }
}
