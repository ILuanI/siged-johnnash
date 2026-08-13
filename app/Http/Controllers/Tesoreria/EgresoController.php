<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\CategoriaEgreso;
use App\Enums\TipoCategoriaFinanciera;
use App\Http\Controllers\Controller;
use App\Models\AuditoriaEgreso;
use App\Models\CategoriaFinanciera;
use App\Models\Egreso;
use Carbon\Carbon;
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

    /**
     * Combina la fecha seleccionada por el usuario con la hora actual del
     * registro. De esta forma se respeta el día elegido en el formulario y se
     * conserva la hora en que se guardó (tipo dateTime).
     */
    private function fechaSeleccionadaConHoraActual(array $validated): Carbon
    {
        return Carbon::parse($validated['fecha'])
            ->setTimeFromTimeString(now()->toTimeString());
    }

    private function calcularIgv(array $validated, Request $request): array
    {
        $aplicaIgv = $request->boolean('aplica_igv', true);
        $igvPorcentaje = (float) ($validated['igv_porcentaje'] ?? 18.00);
        $igvTipo = $validated['igv_tipo'] ?? 'ANTES';
        $cantidad = (float) $validated['cantidad'];
        $precioEntrada = (float) $validated['precio'];

        $precioGuardar = $precioEntrada;
        $igvGuardar = 0.0;

        if ($aplicaIgv && $igvPorcentaje > 0) {
            $p = $igvPorcentaje / 100;
            if ($igvTipo === 'ANTES') {
                $subtotal = $cantidad * $precioEntrada;
                $igvGuardar = round($subtotal * $p, 2);
                $precioGuardar = $precioEntrada;
            } else {
                $totalBruto = $cantidad * $precioEntrada;
                $subtotal = round($totalBruto / (1 + $p), 2);
                $igvGuardar = round($totalBruto - $subtotal, 2);
                $precioGuardar = $cantidad > 0 ? round($subtotal / $cantidad, 4) : 0;
            }
        } else {
            $igvGuardar = 0.0;
            $precioGuardar = $precioEntrada;
        }

        return [
            'aplica_igv' => $aplicaIgv,
            'igv_porcentaje' => $igvPorcentaje,
            'igv_tipo' => $igvTipo,
            'cantidad' => $cantidad,
            'precio' => $precioGuardar,
            'igv' => $igvGuardar,
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'concepto' => ['required', 'string', 'max:60'],
            'categoria' => ['required', Rule::in($this->categoriasValidas())],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'cantidad' => ['required', 'numeric', 'min:0.01'],
            'precio' => ['required', 'numeric', 'min:0'],
            'aplica_igv' => ['nullable', 'boolean'],
            'igv_porcentaje' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'igv_tipo' => ['nullable', 'string', 'in:ANTES,DESPUES'],
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

        $datosCalculados = $this->calcularIgv($validated, $request);

        Egreso::create([
            'tipo_egreso' => $validated['concepto'],
            'categoria' => $validated['categoria'],
            'descripcion' => $validated['descripcion'] ?? null,
            'cantidad' => $datosCalculados['cantidad'],
            'precio' => $datosCalculados['precio'],
            'igv' => $datosCalculados['igv'],
            'aplica_igv' => $datosCalculados['aplica_igv'],
            'igv_porcentaje' => $datosCalculados['igv_porcentaje'],
            'igv_tipo' => $datosCalculados['igv_tipo'],
            'fecha' => $this->fechaSeleccionadaConHoraActual($validated),
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
            'aplica_igv' => ['nullable', 'boolean'],
            'igv_porcentaje' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'igv_tipo' => ['nullable', 'string', 'in:ANTES,DESPUES'],
            'igv' => ['nullable', 'numeric', 'min:0'],
            'fecha' => ['required', 'date'],
        ]);

        $datosCalculados = $this->calcularIgv($validated, $request);

        $egreso->update([
            'tipo_egreso' => $validated['concepto'],
            'categoria' => $validated['categoria'],
            'descripcion' => $validated['descripcion'] ?? null,
            'cantidad' => $datosCalculados['cantidad'],
            'precio' => $datosCalculados['precio'],
            'igv' => $datosCalculados['igv'],
            'aplica_igv' => $datosCalculados['aplica_igv'],
            'igv_porcentaje' => $datosCalculados['igv_porcentaje'],
            'igv_tipo' => $datosCalculados['igv_tipo'],
            'fecha' => $this->fechaSeleccionadaConHoraActual($validated),
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
