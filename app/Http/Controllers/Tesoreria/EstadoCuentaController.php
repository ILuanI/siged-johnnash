<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\EstadoCuota;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Configuracion;
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
        $estado = $request->query('estado');

        $alumnos = Alumno::query()
            ->with(['apoderado', 'matriculas' => function ($query) {
                $query->latest('fecha_matricula')->with(['ciclo', 'comprobantePago.cuotas.pagos']);
            }])
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%");
            })
            ->when($estado, function ($query, $estado) {
                match ($estado) {
                    'vencido' => $query->whereHas('matriculas.comprobantePago.cuotas', function ($q) {
                        $q->where('estado', 'VENCIDA')
                            ->orWhere(fn ($q) => $q->where('estado', 'PENDIENTE')
                                ->whereDate('fecha_vencimiento', '<', now()));
                    }),
                    'proximo_a_vencer' => $query
                        ->whereHas('matriculas.comprobantePago.cuotas', function ($q) {
                            $q->where('estado', 'PENDIENTE')
                                ->whereDate('fecha_vencimiento', '>=', now())
                                ->whereDate('fecha_vencimiento', '<=', now()->addDays(3));
                        })
                        ->whereDoesntHave('matriculas.comprobantePago.cuotas', function ($q) {
                            $q->where('estado', 'VENCIDA')
                                ->orWhere(fn ($q) => $q->where('estado', 'PENDIENTE')
                                    ->whereDate('fecha_vencimiento', '<', now()));
                        }),
                    'al_dia' => $query
                        ->whereHas('matriculas.comprobantePago.cuotas')
                        ->whereDoesntHave('matriculas.comprobantePago.cuotas', function ($q) {
                            $q->where('estado', 'VENCIDA')
                                ->orWhere(fn ($q) => $q->where('estado', 'PENDIENTE')
                                    ->whereDate('fecha_vencimiento', '<=', now()->addDays(3)));
                        }),
                    'sin_plan' => $query->whereHas('matriculas', function ($q) {
                        $q->whereDoesntHave('comprobantePago');
                    }),
                    default => $query,
                };
            })
            ->paginate(10)
            ->withQueryString();

        $vencido = Configuracion::where('clave', 'whatsapp_msg_vencido')->value('valor');
        $proximoVencer = Configuracion::where('clave', 'whatsapp_msg_proximo_a_vencer')->value('valor');

        return Inertia::render('tesoreria/index', [
            'alumnos' => $alumnos,
            'filters' => $request->only(['search', 'estado']),
            'whatsapp_templates' => [
                'vencido' => $vencido,
                'proximo_a_vencer' => $proximoVencer,
            ],
        ]);
    }

    public function show(Alumno $alumno): Response
    {
        $alumno->load(['apoderado', 'matriculas' => function ($query) {
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

    public function updateWhatsappTemplates(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vencido' => ['required', 'string', 'max:1000'],
            'proximo_a_vencer' => ['required', 'string', 'max:1000'],
        ]);

        Configuracion::updateOrCreate(
            ['clave' => 'whatsapp_msg_vencido'],
            ['valor' => $validated['vencido']],
        );

        Configuracion::updateOrCreate(
            ['clave' => 'whatsapp_msg_proximo_a_vencer'],
            ['valor' => $validated['proximo_a_vencer']],
        );

        return back()->with('success', 'Plantillas de WhatsApp actualizadas.');
    }
}
