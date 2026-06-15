<?php

namespace App\Http\Requests;

use App\Support\ModulosSistema;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'nombre' => ['required', 'string', 'max:40', Rule::unique('rol', 'nombre')],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'permisos' => ['required', 'array'],
        ];

        foreach (ModulosSistema::keys() as $modulo) {
            $rules["permisos.{$modulo}"] = ['required', 'array'];
            $rules["permisos.{$modulo}.puede_ver"] = ['required', 'boolean'];
            $rules["permisos.{$modulo}.puede_editar"] = ['required', 'boolean'];
            $rules["permisos.{$modulo}.puede_eliminar"] = ['required', 'boolean'];
        }

        return $rules;
    }
}
