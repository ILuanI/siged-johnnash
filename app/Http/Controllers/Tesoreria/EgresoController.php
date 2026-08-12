<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\CategoriaEgreso;
use App\Enums\TipoCategoriaFinanciera;
use App\Http\Controllers\Controller;
use App\Models\AuditoriaEgreso;
use App\Models\CategoriaFinanciera;
use App\Models\Egreso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EgresoController extends Controller
{
    /**
     * Catálogo de categorías de egreso: las del mantenedor
     * (`categoria_financiera`) más las del enum como fallback.
     *
     * @return list<string>
     */
    private function categoriasValidas(): array
    {
        return CategoriaFinanciera::query()
            ->where('tipo', TipoCategoriaFinanciera::Egreso)
            ->pluck('nombre')
            ->merge(array_column(CategoriaEgreso::cases(), 'value'))
            ->unique()
            ->values()
            ->all();
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'concepto' => ['required', 'string', 'max:60'],
            'categoria' => ['required', Rule::in($this->categoriasValidas())],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'cantidad' => ['required', 'numeric', 'min:0.01'],
            'precio' => ['required', 'numeric', 'min:0'],
            'igv' => ['nullable', 'numeric', 'min:0'],
            'fecha' => ['required', 'date'],
        ], [
            'concepto.required' => 'El concepto o tipo de egreso es obligatorio.',
            'categoria.required' => 'La categoría del egreso es obligatoria.',
            'categoria.in' => 'La categoría seleccionada no es válida.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'precio.required' => 'El precio unitario o costo es obligatorio.',
            'fecha.required' => 'La fecha del egreso es obligatoria.',
        ]);

        $cantidad = (float) $validated['cantidad'];
        $precio = (float) $validated['precio'];
        $igv = (float) ($validated['igv'] ?? 0);

        Egreso::create([
            'tipo_egreso' => $validated['concepto'],
            'categoria' => $validated['categoria'],
            'descripcion' => $validated['descripcion'] ?? null,
            'cantidad' => $cantidad,
            'precio' => $precio,
            'igv' => $igv,
            'fecha' => $validated['fecha'],
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Egreso registrado correctamente.');
    }

    public function update(Request $request, Egreso $egreso): RedirectResponse
    {
        $validated = $request->validate([
            'concepto' => ['required', 'string', 'max:60'],
            'categoria' => ['required', Rule::in($this->categoriasValidas())],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'cantidad' => ['required', 'numeric', 'min:0.01'],
            'precio' => ['required', 'numeric', 'min:0'],
            'igv' => ['nullable', 'numeric', 'min:0'],
            'fecha' => ['required', 'date'],
        ]);

        $cantidad = (float) $validated['cantidad'];
        $precio = (float) $validated['precio'];
        $igv = (float) ($validated['igv'] ?? 0);

        $egreso->update([
            'tipo_egreso' => $validated['concepto'],
            'categoria' => $validated['categoria'],
            'descripcion' => $validated['descripcion'] ?? null,
            'cantidad' => $cantidad,
            'precio' => $precio,
            'igv' => $igv,
            'fecha' => $validated['fecha'],
        ]);

        return back()->with('success', 'Egreso actualizado correctamente.');
    }

    public function anular(Request $request, Egreso $egreso): RedirectResponse
    {
        $this->authorize('delete', $egreso);

        if ($egreso->estado === 'ANULADO') {
            return back()->with('error', 'El egreso ya se encuentra anulado.');
        }

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'max:500'],
        ], [
            'motivo.required' => 'El motivo de anulación es obligatorio.',
        ]);

        DB::transaction(function () use ($egreso, $validated) {
            // 1. Anular el egreso (soft delete: el registro se conserva)
            $egreso->update(['estado' => 'ANULADO']);

            // 2. Registrar la auditoría de la anulación
            AuditoriaEgreso::create([
                'egreso_id' => $egreso->id_egreso,
                'usuario_id' => auth()->id(),
                'accion' => 'ANULACION',
                'motivo' => $validated['motivo'],
            ]);
        });

        return back()->with('success', 'Egreso anulado correctamente.');
    }
}
