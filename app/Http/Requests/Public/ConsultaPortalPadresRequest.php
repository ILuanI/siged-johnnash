<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class ConsultaPortalPadresRequest extends FormRequest
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
            'dni' => ['nullable', 'digits:8'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
        ];
    }
}
