<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\CategoriaEgreso;
use App\Http\Controllers\Controller;
use App\Models\Egreso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EgresoController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'concepto' => ['required', 'string', 'max:60'],
            'categoria' => ['required', Rule::enum(CategoriaEgreso::class)],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'cantidad' => ['required', 'numeric', 'min:0.01'],
            'precio' => ['required', 'numeric', 'min:0'],
            'igv' => ['nullable', 'numeric', 'min:0'],
            'fecha' => ['required', 'date'],
        ], [
            'concepto.required' => 'El concepto o tipo de egreso es obligatorio.',
            'categoria.required' => 'La categoría del egreso es obligatoria.',
            'categoria.enum' => 'La categoría seleccionada no es válida.',
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
            'categoria' => ['required', Rule::enum(CategoriaEgreso::class)],
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

    public function destroy(Egreso $egreso): RedirectResponse
    {
        $egreso->delete();

        return back()->with('success', 'Egreso eliminado correctamente.');
    }
}
