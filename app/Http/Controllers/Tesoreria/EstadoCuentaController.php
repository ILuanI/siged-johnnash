<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\EstadoCuota;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\ComprobantePago;
use App\Models\Configuracion;
use App\Models\Cuota;
use App\Models\Egreso;
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
                $query->latest('fecha_matricula')->with(['ciclo', 'comprobantesPago.cuotas.pagos']);
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

    public function show(Alumno $alumno): Response
    {
        $alumno->load(['apoderado', 'matriculas' => function ($query) {
            $query->latest('fecha_matricula')->with(['ciclo', 'comprobantesPago.cuotas.pagos']);
        }]);

        return Inertia::render('tesoreria/estado-cuenta', [
            'alumno' => $alumno,
        ]);
    }

    public function pagarComprobante(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cuota_ids' => ['required', 'array', 'min:1'],
            'cuota_ids.*' => ['required', 'integer', 'exists:cuota,id_cuota'],
            'metodo_pago' => ['required', 'string', 'max:50'],
        ]);

        $processed = 0;
        $errors = [];

        foreach ($validated['cuota_ids'] as $cuotaId) {
            $cuota = Cuota::query()->find($cuotaId);

            if (! $cuota || $cuota->estado === EstadoCuota::Pagada) {
                $errors[] = "Cuota #{$cuotaId} ya está pagada o no existe.";

                continue;
            }

            $totalPagado = $cuota->pagos()->sum('monto');
            $restante = $cuota->monto - $totalPagado;

            if ($restante <= 0) {
                $errors[] = "Cuota #{$cuotaId} no tiene saldo pendiente.";

                continue;
            }

            Pago::create([
                'id_cuota' => $cuota->id_cuota,
                'monto' => $restante,
                'fecha_pago' => now()->toDateString(),
                'metodo_pago' => $validated['metodo_pago'],
                'user_id' => auth()->id(),
            ]);

            $cuota->update(['estado' => EstadoCuota::Pagada]);
            $cuota->comprobantePago?->decrement('saldo_pendiente', $cuota->monto);
            $processed++;
        }

        $message = "{$processed} cuota(s) pagada(s) correctamente.";
        if (! empty($errors)) {
            $message .= ' '.implode(' ', $errors);
        }

        return back()->with('success', $message);
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

    public function caja(Request $request): Response
    {
        $fechaInicio = $request->query('fecha_inicio', now()->startOfMonth()->toDateString());
        $fechaFin = $request->query('fecha_fin', now()->endOfMonth()->toDateString());

        // Consolidado de Ingresos agrupado por concepto del comprobante de pago
        $ingresosPorConceptoRaw = DB::table('pago')
            ->join('cuota', 'pago.id_cuota', '=', 'cuota.id_cuota')
            ->join('comprobante_pago', 'cuota.id_comprobante', '=', 'comprobante_pago.id_comprobante')
            ->select('comprobante_pago.concepto', DB::raw('SUM(pago.monto) as total_recaudado'), DB::raw('COUNT(pago.id_pago) as cantidad_pagos'))
            ->groupBy('comprobante_pago.concepto')
            ->get();

        $ingresosPorConcepto = [
            'MATRICULA' => 0.0,
            'SIMULACRO' => 0.0,
            'CARNET' => 0.0,
            'EXTRAORDINARIO' => 0.0,
        ];

        $totalIngresosRecaudados = 0.0;

        foreach ($ingresosPorConceptoRaw as $item) {
            $conceptoKey = strtoupper($item->concepto);
            $totalMonto = (float) $item->total_recaudado;
            $ingresosPorConcepto[$conceptoKey] = $totalMonto;
            $totalIngresosRecaudados += $totalMonto;
        }

        // Total egresos
        $totalEgresos = (float) Egreso::query()->sum('total');
        $saldoDisponible = $totalIngresosRecaudados - $totalEgresos;

        // Lista de egresos
        $egresos = Egreso::query()
            ->with('user:id,name')
            ->latest('fecha')
            ->paginate(15)
            ->withQueryString();

        // Pagos recientes
        $pagosRecientes = Pago::query()
            ->with(['user:id,name', 'cuota.comprobantePago.matricula.alumno'])
            ->latest('fecha_pago')
            ->take(10)
            ->get();

        return Inertia::render('tesoreria/caja', [
            'ingresosPorConcepto' => $ingresosPorConcepto,
            'totalIngresos' => $totalIngresosRecaudados,
            'totalEgresos' => $totalEgresos,
            'saldoDisponible' => $saldoDisponible,
            'egresos' => $egresos,
            'pagosRecientes' => $pagosRecientes,
            'filters' => [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
            ],
        ]);
    }

    public function updateComprobante(Request $request, ComprobantePago $comprobante): RedirectResponse
    {
        $validated = $request->validate([
            'costo_total' => ['required', 'numeric', 'min:0.01'],
        ], [
            'costo_total.required' => 'El costo total es obligatorio.',
            'costo_total.numeric' => 'El costo total debe ser un número válido.',
            'costo_total.min' => 'El costo total no puede ser cero o negativo.',
        ]);

        DB::transaction(function () use ($comprobante, $validated): void {
            $nuevoCosto = (float) $validated['costo_total'];

            // Total ya pagado en las cuotas asociadas
            $totalPagado = Pago::query()
                ->whereIn('id_cuota', $comprobante->cuotas->pluck('id_cuota'))
                ->sum('monto');

            $nuevoSaldoPendiente = max(0, $nuevoCosto - $totalPagado);

            $comprobante->update([
                'costo_total' => $nuevoCosto,
                'saldo_pendiente' => $nuevoSaldoPendiente,
            ]);

            // Si hay matrícula asociada, actualizar su monto_total también
            if ($comprobante->matricula && $comprobante->concepto?->value === 'MATRICULA') {
                $comprobante->matricula->update(['monto_total' => $nuevoCosto]);
            }

            // Recalcular cuotas pendientes
            $cuotasPendientes = $comprobante->cuotas()->where('estado', '!=', EstadoCuota::Pagada)->get();

            if ($cuotasPendientes->count() > 0) {
                $montoPorCuota = round($nuevoSaldoPendiente / $cuotasPendientes->count(), 2);
                $diferencia = round($nuevoSaldoPendiente - ($montoPorCuota * $cuotasPendientes->count()), 2);

                foreach ($cuotasPendientes as $index => $cuota) {
                    $montoFinal = $montoPorCuota + ($index === $cuotasPendientes->count() - 1 ? $diferencia : 0);
                    $cuota->update(['monto' => max(0, $montoFinal)]);
                }
            }
        });

        return back()->with('success', 'Monto total del comprobante y cuotas pendientes actualizadas correctamente.');
    }

    public function updateCuota(Request $request, Cuota $cuota): RedirectResponse
    {
        $validated = $request->validate([
            'monto' => ['required', 'numeric', 'min:0'],
            'fecha_vencimiento' => ['required', 'date'],
        ], [
            'monto.required' => 'El monto de la cuota es obligatorio.',
            'fecha_vencimiento.required' => 'La fecha de vencimiento es obligatoria.',
        ]);

        DB::transaction(function () use ($cuota, $validated): void {
            $cuota->update([
                'monto' => (float) $validated['monto'],
                'fecha_vencimiento' => $validated['fecha_vencimiento'],
            ]);

            // Recalcular saldo pendiente en el comprobante
            $comprobante = $cuota->comprobantePago;
            if ($comprobante) {
                $sumCuotas = $comprobante->cuotas()->sum('monto');
                $totalPagado = Pago::query()
                    ->whereIn('id_cuota', $comprobante->cuotas->pluck('id_cuota'))
                    ->sum('monto');

                $comprobante->update([
                    'costo_total' => $sumCuotas,
                    'saldo_pendiente' => max(0, $sumCuotas - $totalPagado),
                ]);
            }
        });

        return back()->with('success', 'Cuota actualizada correctamente.');
    }
}
