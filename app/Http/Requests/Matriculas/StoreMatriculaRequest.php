<?php

namespace App\Http\Requests\Matriculas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMatriculaRequest extends FormRequest
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
            'id_ciclo' => ['required', 'integer', Rule::exists('ciclo', 'id_ciclo')],
            'id_periodo' => ['required', 'integer', Rule::exists('periodo_academico', 'id_periodo')],
            'id_turno' => ['required', 'integer', Rule::exists('turno', 'id_turno')],
            'id_aula' => ['required', 'integer', Rule::exists('aula', 'id_aula')],
            'fecha_matricula' => ['nullable', 'date'],
            'modalidad' => ['nullable', Rule::in(['PRESENCIAL', 'VIRTUAL'])],
            'tipo_pago' => ['nullable', Rule::in(['CONTADO', 'CREDITO'])],
            'costo_matricula' => ['nullable', 'numeric', 'min:0'],
            'costo_simulacro' => ['nullable', 'numeric', 'min:0'],
            'costo_carnet' => ['nullable', 'numeric', 'min:0'],
            'cuotas_matricula' => ['nullable', 'integer', 'min:1', 'max:4'],
            'cuotas_simulacro' => ['nullable', 'integer', 'min:1', 'max:4'],
            'fecha_primera_cuota' => ['nullable', 'date'],
            'dias_entre_cuotas' => ['nullable', 'integer', 'min:1', 'max:365'],
            'pagar_ahora' => ['boolean', 'nullable'],
            'metodo_pago' => ['nullable', 'string', 'max:50', 'required_if:pagar_ahora,true'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'id_alumno.exists' => 'El alumno indicado no está registrado.',
            'id_ciclo.exists' => 'El ciclo académico indicado no existe.',
            'id_periodo.exists' => 'El periodo académico indicado no existe.',
            'id_turno.exists' => 'El turno indicado no existe.',
            'id_aula.exists' => 'El aula indicada no existe.',
            'metodo_pago.required_if' => 'El método de pago es obligatorio si desea pagar ahora.',
        ];
    }
}
