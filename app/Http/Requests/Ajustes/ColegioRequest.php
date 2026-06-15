<?php

namespace App\Http\Requests\Ajustes;

use App\Models\ColegioProcedencia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ColegioRequest extends FormRequest
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
        $colegio = $this->route('colegio');
        $id = $colegio instanceof ColegioProcedencia ? $colegio->id_colegio_procedencia : null;

        return [
            'nombre' => ['required', 'string', 'max:120', Rule::unique('colegio_procedencia', 'nombre')->ignore($id, 'id_colegio_procedencia')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del colegio es obligatorio.',
            'nombre.unique' => 'Ya existe un colegio con ese nombre.',
        ];
    }
}
