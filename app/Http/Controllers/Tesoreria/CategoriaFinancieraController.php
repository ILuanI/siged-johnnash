<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\TipoCategoriaFinanciera;
use App\Http\Controllers\Controller;
use App\Models\CategoriaFinanciera;
use App\Models\ComprobantePago;
use App\Models\Egreso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CategoriaFinancieraController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('ajustes.index', ['tab' => 'categorias']);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validar($request);

        CategoriaFinanciera::query()->create($validated);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(Request $request, CategoriaFinanciera $categoria): RedirectResponse
    {
        $validated = $this->validar($request, $categoria);

        $categoria->update($validated);

        return back()->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(CategoriaFinanciera $categoria): RedirectResponse
    {
        if ($categoria->es_por_defecto) {
            return back()->with('error', 'La categoría por defecto no puede eliminarse. Establece otra como por defecto primero.');
        }

        $enUso = Egreso::query()->where('categoria', $categoria->nombre)->exists()
            || ComprobantePago::query()->where('categoria', $categoria->nombre)->exists();

        if ($enUso) {
            return back()->with('error', 'La categoría está en uso por egresos o comprobantes y no puede eliminarse.');
        }

        $categoria->delete();

        return back()->with('success', 'Categoría eliminada correctamente.');
    }

    public function setDefault(CategoriaFinanciera $categoria): RedirectResponse
    {
        DB::transaction(function () use ($categoria): void {
            CategoriaFinanciera::query()
                ->where('tipo', $categoria->tipo)
                ->update(['es_por_defecto' => false]);

            $categoria->update(['es_por_defecto' => true]);
        });

        return back()->with('success', 'Categoría establecida como por defecto.');
    }

    /**
     * @return array{nombre: string, tipo: TipoCategoriaFinanciera, descripcion: ?string}
     */
    private function validar(Request $request, ?CategoriaFinanciera $categoria = null): array
    {
        return $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:60',
                Rule::unique('categoria_financiera', 'nombre')
                    ->where(fn ($query) => $query->where('tipo', $request->input('tipo')))
                    ->ignore($categoria?->id),
            ],
            'tipo' => ['required', Rule::enum(TipoCategoriaFinanciera::class)],
            'descripcion' => ['nullable', 'string', 'max:160'],
        ], [
            'nombre.required' => 'El nombre de la categoría es obligatorio.',
            'nombre.max' => 'El nombre no puede superar los 60 caracteres.',
            'nombre.unique' => 'Ya existe una categoría con ese nombre para el tipo seleccionado.',
            'tipo.required' => 'El tipo de categoría es obligatorio.',
            'tipo.enum' => 'El tipo de categoría seleccionado no es válido.',
            'descripcion.max' => 'La descripción no puede superar los 160 caracteres.',
        ]);
    }
}
