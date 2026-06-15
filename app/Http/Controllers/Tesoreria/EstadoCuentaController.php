<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\EstadoCuota;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Cuota;
use App\Models\Pago;
use App\Services\Tesoreria\CuotaScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EstadoCuentaController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $alumnos = Alumno::query()
            ->with(['matriculas' => function ($query) {
                $query->latest('fecha_matricula')->with(['comprobantePago.cuotas']);
            }])
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('tesoreria/index', [
            'alumnos' => $alumnos,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Alumno $alumno): Response
    {
        $alumno->load(['matriculas' => function ($query) {
            $query->latest('fecha_matricula')->with(['ciclo', 'comprobantePago.cuotas.pagos']);
        }]);

        return Inertia::render('tesoreria/estado-cuenta', [
            'alumno' => $alumno,
        ]);
    }

    public function prorrogar(Cuota $cuota, Request $request, CuotaScheduleService $cuotaScheduleService): RedirectResponse
    {
        $validated = $request->validate([
            'dias' => ['required', 'integer', 'min:1'],
        ]);

        $cuotaScheduleService->aplazar($cuota, $validated['dias']);

        return back()->with('success', 'Fecha de vencimiento prorrogada exitosamente.');
    }

    public function pagar(Cuota $cuota, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'monto' => ['required', 'numeric', 'min:0.01'],
            'metodo_pago' => ['required', 'string', 'max:50'],
        ]);

        // Registrar pago
        Pago::create([
            'id_cuota' => $cuota->id_cuota,
            'monto' => $validated['monto'],
            'fecha_pago' => now()->toDateString(),
            'metodo_pago' => $validated['metodo_pago'],
            'user_id' => auth()->id(),
        ]);

        // Verificar si la cuota está totalmente pagada
        $totalPagado = $cuota->pagos()->sum('monto') + $validated['monto'];

        if ($totalPagado >= $cuota->monto) {
            $cuota->update(['estado' => EstadoCuota::Pagada]);

            // Actualizar saldo pendiente en el comprobante
            $comprobante = $cuota->comprobantePago;
            $comprobante->decrement('saldo_pendiente', $cuota->monto);
        }

        return back()->with('success', 'Pago registrado exitosamente.');
    }
}
