<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\EstadoCuota;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\AuditoriaPago;
use App\Models\Configuracion;
use App\Models\Cuota;
use App\Models\Pago;
use App\Services\Tesoreria\CuotaScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                $query->latest('fecha_matricula')->with(['ciclo', 'comprobantesPago.cuotas.pagos' => function ($q) {
                    $q->where('estado', '!=', 'ANULADO')->with('auditorias.usuario');
                }]);
            }])
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%");
            })
            ->when($estado, function ($query, $estado) {
                match ($estado) {
                    'vencido' => $query->whereHas('matriculas.comprobantesPago.cuotas', function ($q) {
                        $q->where('estado', 'VENCIDA')
                            ->orWhere(fn ($q) => $q->where('estado', 'PENDIENTE')
                                ->whereDate('fecha_vencimiento', '<', today()));
                    }),
                    'proximo_a_vencer' => $query
                        ->whereHas('matriculas.comprobantesPago.cuotas', function ($q) {
                            $q->where('estado', 'PENDIENTE')
                                ->whereDate('fecha_vencimiento', '>=', today())
                                ->whereDate('fecha_vencimiento', '<=', today()->addDays(3));
                        })
                        ->whereDoesntHave('matriculas.comprobantesPago.cuotas', function ($q) {
                            $q->where('estado', 'VENCIDA')
                                ->orWhere(fn ($q) => $q->where('estado', 'PENDIENTE')
                                    ->whereDate('fecha_vencimiento', '<', today()));
                        }),
                    'al_dia' => $query
                        ->whereHas('matriculas.comprobantesPago.cuotas')
                        ->whereDoesntHave('matriculas.comprobantesPago.cuotas', function ($q) {
                            $q->where('estado', 'VENCIDA')
                                ->orWhere(fn ($q) => $q->where('estado', 'PENDIENTE')
                                    ->whereDate('fecha_vencimiento', '<=', today()->addDays(3)));
                        }),
                    'sin_plan' => $query->whereHas('matriculas', function ($q) {
                        $q->whereDoesntHave('comprobantesPago');
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

    public function movimientos(Request $request): Response
    {
        $this->authorize('viewAny', Pago::class);

        $rules = [
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'metodo_pago' => ['nullable', 'string', 'in:EFECTIVO,YAPE,PLIN,TRANSFERENCIA,TARJETA'],
            'estado' => ['nullable', 'string', 'in:PAGADO,ANULADO'],
            'sort' => ['nullable', 'string', 'in:fecha,monto'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];

        if ($request->filled('fecha_inicio')) {
            $rules['fecha_fin'][] = 'after_or_equal:fecha_inicio';
        }

        $validated = $request->validate($rules);

        $sort = $validated['sort'] ?? 'fecha';
        $direction = $validated['direction'] ?? 'desc';

        $pagos = Pago::query()
            ->with(['cuota.comprobantePago.matricula.alumno', 'user', 'auditorias.usuario'])
            ->when($validated['fecha_inicio'] ?? null, fn ($query, $fechaInicio) => $query->whereDate('fecha_pago', '>=', $fechaInicio))
            ->when($validated['fecha_fin'] ?? null, fn ($query, $fechaFin) => $query->whereDate('fecha_pago', '<=', $fechaFin))
            ->when($validated['metodo_pago'] ?? null, fn ($query, $metodoPago) => $query->where('metodo_pago', $metodoPago))
            ->when($validated['estado'] ?? null, fn ($query, $estado) => $query->where('estado', $estado))
            ->orderBy($sort === 'monto' ? 'monto' : 'fecha_pago', $direction)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('tesoreria/movimientos', [
            'pagos' => $pagos,
            'filters' => $request->only(['fecha_inicio', 'fecha_fin', 'metodo_pago', 'estado', 'sort', 'direction']),
        ]);
    }

    public function show(Alumno $alumno): Response
    {
        $alumno->load(['apoderado', 'matriculas' => function ($query) {
            $query->latest('fecha_matricula')->with(['ciclo', 'comprobantesPago.cuotas.pagos' => function ($q) {
                $q->where('estado', '!=', 'ANULADO')->with('auditorias.usuario');
            }]);
        }]);

        return Inertia::render('tesoreria/estado-cuenta', [
            'alumno' => $alumno,
        ]);
    }

    public function pagarComprobante(Request $request): RedirectResponse
    {
        $this->authorize('create', Pago::class);

        $validated = $request->validate([
            'cuota_ids' => ['required', 'array', 'min:1'],
            'cuota_ids.*' => ['required', 'integer', 'exists:cuota,id_cuota'],
            'metodo_pago' => ['required', 'string', 'max:50'],
            'montos' => ['nullable', 'array'],
            'montos.*' => ['required_with:montos', 'numeric', 'min:0.01'],
        ]);

        $processed = 0;
        $errors = [];

        DB::transaction(function () use ($validated, &$processed, &$errors) {
            foreach ($validated['cuota_ids'] as $cuotaId) {
                $cuota = Cuota::query()->lockForUpdate()->find($cuotaId);

                if (! $cuota || $cuota->estado === EstadoCuota::Pagada) {
                    $errors[] = "Cuota #{$cuotaId} ya está pagada o no existe.";

                    continue;
                }

                $totalPagado = $cuota->pagos()
                    ->where('estado', '!=', 'ANULADO')
                    ->sum('monto');
                $restante = $cuota->monto - $totalPagado;

                if ($restante <= 0) {
                    $errors[] = "Cuota #{$cuotaId} no tiene saldo pendiente.";

                    continue;
                }

                $montoPagar = isset($validated['montos'][$cuotaId])
                    ? min($validated['montos'][$cuotaId], $restante)
                    : $restante;

                Pago::create([
                    'id_cuota' => $cuota->id_cuota,
                    'monto' => $montoPagar,
                    'fecha_pago' => now()->toDateString(),
                    'metodo_pago' => $validated['metodo_pago'],
                    'user_id' => auth()->id(),
                ]);

                $cuota->comprobantePago?->decrement('saldo_pendiente', $montoPagar);

                $totalPagadoAhora = $totalPagado + $montoPagar;
                if ($totalPagadoAhora >= $cuota->monto) {
                    $cuota->update(['estado' => EstadoCuota::Pagada]);
                }

                $processed++;
            }
        });

        $message = "{$processed} cuota(s) pagada(s) correctamente.";
        if (! empty($errors)) {
            $message .= ' '.implode(' ', $errors);
        }

        return back()->with('success', $message);
    }

    public function prorrogar(Cuota $cuota, Request $request, CuotaScheduleService $cuotaScheduleService): RedirectResponse
    {
        $this->authorize('update', $cuota);

        $validated = $request->validate([
            'dias' => ['required', 'integer', 'min:1'],
        ]);

        $cuotaScheduleService->aplazar($cuota, $validated['dias']);

        return back()->with('success', 'Fecha de vencimiento prorrogada exitosamente.');
    }

    public function anularPago(Request $request, Pago $pago): RedirectResponse
    {
        $this->authorize('delete', $pago);

        if ($pago->estado === 'ANULADO') {
            return back()->with('error', 'El pago ya se encuentra anulado.');
        }

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($pago, $validated) {
            // Cargar la cuota con bloqueo dentro de la transacción para evitar
            // condiciones de carrera entre anulaciones concurrentes.
            $cuota = $pago->cuota()->lockForUpdate()->firstOrFail();

            // 1. Anular el pago
            $pago->update(['estado' => 'ANULADO']);

            // 2. Registrar la auditoría de la anulación
            AuditoriaPago::create([
                'pago_id' => $pago->id_pago,
                'usuario_id' => auth()->id(),
                'accion' => 'ANULACION',
                'motivo' => $validated['motivo'],
            ]);

            // 3. Recalcular el total pagado de la cuota (excluyendo pagos anulados)
            $totalPagado = $cuota->pagos()
                ->where('estado', '!=', 'ANULADO')
                ->lockForUpdate()
                ->sum('monto');

            // 4. Actualizar el estado de la cuota según el saldo resultante
            $cuota->update([
                'estado' => $totalPagado >= $cuota->monto
                    ? EstadoCuota::Pagada
                    : ($cuota->fecha_vencimiento->lt(today())
                        ? EstadoCuota::Vencida
                        : EstadoCuota::Pendiente),
            ]);

            // 5. Recalcular el saldo pendiente del comprobante a partir de sus cuotas
            $comprobante = $cuota->comprobantePago;
            if ($comprobante) {
                $saldoPendiente = $comprobante->cuotas()
                    ->with('pagos')
                    ->get()
                    ->sum(fn (Cuota $c) => $c->monto - $c->pagos
                        ->where('estado', '!=', 'ANULADO')
                        ->sum('monto'));

                $comprobante->update([
                    'saldo_pendiente' => max(0, $saldoPendiente),
                ]);
            }
        });

        return back()->with('success', 'Pago anulado correctamente.');
    }

    public function pagar(Cuota $cuota, Request $request): RedirectResponse
    {
        $this->authorize('create', Pago::class);

        $validated = $request->validate([
            'monto' => ['required', 'numeric', 'min:0.01'],
            'metodo_pago' => ['required', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($cuota, $validated) {
            // Registrar pago
            Pago::create([
                'id_cuota' => $cuota->id_cuota,
                'monto' => $validated['monto'],
                'fecha_pago' => now()->toDateString(),
                'metodo_pago' => $validated['metodo_pago'],
                'user_id' => auth()->id(),
            ]);

            // Recalcular el total pagado (excluyendo pagos anulados).
            // El nuevo pago ya está incluido en la consulta, por lo que no debe sumarse de nuevo.
            $totalPagado = $cuota->pagos()
                ->where('estado', '!=', 'ANULADO')
                ->lockForUpdate()
                ->sum('monto');

            // Verificar si la cuota está totalmente pagada
            if ($totalPagado >= $cuota->monto) {
                $cuota->update(['estado' => EstadoCuota::Pagada]);
            }

            // Actualizar saldo pendiente en el comprobante
            $cuota->comprobantePago?->decrement('saldo_pendiente', $validated['monto']);
        });

        return back()->with('success', 'Pago registrado exitosamente.');
    }

    public function updateWhatsappTemplates(Request $request): RedirectResponse
    {
        $this->authorize('update', Configuracion::class);

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
