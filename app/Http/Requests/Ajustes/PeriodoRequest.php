<?php

namespace App\Http\Requests\Ajustes;

use App\Models\PeriodoAcademico;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PeriodoRequest extends FormRequest
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
        $periodo = $this->route('periodo');
        $id = $periodo instanceof PeriodoAcademico ? $periodo->id_periodo : null;

        return [
            'nombre' => ['required', 'string', 'max:80', Rule::unique('periodo_academico', 'nombre')->ignore($id, 'id_periodo')],
            'anio' => ['required', 'integer', 'between:2000,2100'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'estado' => ['required', Rule::in(['ABIERTO', 'CERRADO'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del periodo es obligatorio.',
            'nombre.unique' => 'Ya existe un periodo con ese nombre.',
            'anio.required' => 'El año es obligatorio.',
            'anio.between' => 'El año debe estar entre 2000 y 2100.',
            'estado.in' => 'El estado debe ser ABIERTO o CERRADO.',
        ];
    }
}
