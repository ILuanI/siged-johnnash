<?php

namespace App\Http\Requests\Matriculas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('codigo')) {
            $this->merge([
                'codigo' => mb_strtoupper((string) $this->input('codigo')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'codigo' => ['required', 'string', 'size:1', 'alpha', Rule::unique('area', 'codigo')],
            'nombre' => ['required', 'string', 'max:80', Rule::unique('area', 'nombre')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.required' => 'El codigo del area es obligatorio.',
            'codigo.size' => 'El codigo del area debe tener una letra.',
            'codigo.unique' => 'Ya existe un area con ese codigo.',
            'nombre.required' => 'El nombre del area es obligatorio.',
            'nombre.unique' => 'Ya existe un area con ese nombre.',
        ];
    }
}
