<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDocenteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'correo' => ['required', 'string', 'email', 'max:255', 'unique:docentes,correo,'.$this->docente->id],
            'telefono' => ['nullable', 'string', 'size:9', 'regex:/^9\d{8}$/'],
            'dni' => ['required', 'string', 'size:8', 'unique:docentes,dni,'.$this->docente->id],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.size' => 'El DNI debe tener exactamente 8 dígitos.',
            'dni.unique' => 'Ya existe un docente registrado con este DNI.',
            'nombres.required' => 'El nombre es obligatorio.',
            'nombres.max' => 'El nombre no puede tener más de 255 caracteres.',
            'apellidos.required' => 'El apellido es obligatorio.',
            'apellidos.max' => 'El apellido no puede tener más de 255 caracteres.',
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'El correo electrónico debe ser una dirección válida.',
            'correo.unique' => 'Ya existe un docente registrado con este correo electrónico.',
            'telefono.size' => 'El teléfono debe tener exactamente 9 dígitos.',
            'telefono.regex' => 'El teléfono debe empezar con 9 y tener 9 dígitos.',
        ];
    }
}
