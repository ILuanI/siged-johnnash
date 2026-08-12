<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\EstadoCuota;
use App\Enums\TipoCategoriaFinanciera;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\AuditoriaCuota;
use App\Models\AuditoriaPago;
use App\Models\CategoriaFinanciera;
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
                $query->latest('fecha_matricula')->with([
                    'ciclo',
                    'comprobantesPago.cuotas.auditorias.usuario',
                    'comprobantesPago.cuotas.pagos' => function ($q) {
                        $q->where('estado', '!=', 'ANULADO')->with('auditorias.usuario');
                    },
                ]);
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
            'estado' => ['nullable', 'string', 'in:PAGADO,REGISTRADO,ANULADO'],
            'tipo' => ['nullable', 'string', 'in:todos,ingresos,egresos'],
            'sort' => ['nullable', 'string', 'in:fecha,monto'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];

        if ($request->filled('fecha_inicio')) {
            $rules['fecha_fin'][] = 'after_or_equal:fecha_inicio';
        }

        $validated = $request->validate($rules);

        $sort = $validated['sort'] ?? 'fecha';
        $direction = $validated['direction'] ?? 'desc';
        $tipo = $validated['tipo'] ?? 'todos';

        // Ingresos: pagos registrados contra cuotas (con sus auditorías).
        $pagos = $tipo === 'egresos'
            ? Pago::query()->whereRaw('1 = 0')->paginate(15)
            : Pago::query()
                ->with(['cuota.comprobantePago.matricula.alumno', 'user', 'auditorias.usuario'])
                ->when($validated['fecha_inicio'] ?? null, fn ($query, $fechaInicio) => $query->whereDate('fecha_pago', '>=', $fechaInicio))
                ->when($validated['fecha_fin'] ?? null, fn ($query, $fechaFin) => $query->whereDate('fecha_pago', '<=', $fechaFin))
                ->when($validated['metodo_pago'] ?? null, fn ($query, $metodoPago) => $query->where('metodo_pago', $metodoPago))
                ->when($validated['estado'] ?? null, fn ($query, $estado) => $query->where('estado', $estado))
                ->orderBy($sort === 'monto' ? 'monto' : 'fecha_pago', $direction)
                ->paginate(15)
                ->withQueryString();

        // Egresos: salidas de caja (con sus auditorías de anulación).
        $egresos = $tipo === 'ingresos'
            ? Egreso::query()->whereRaw('1 = 0')->paginate(15)
            : Egreso::query()
                ->with(['user:id,name', 'auditorias.usuario'])
                ->when($validated['fecha_inicio'] ?? null, fn ($query, $fechaInicio) => $query->whereDate('fecha', '>=', $fechaInicio))
                ->when($validated['fecha_fin'] ?? null, fn ($query, $fechaFin) => $query->whereDate('fecha', '<=', $fechaFin))
                ->when($validated['estado'] ?? null, fn ($query, $estado) => $query->where('estado', $estado))
                ->orderBy($sort === 'monto' ? 'total' : 'fecha', $direction)
                ->paginate(15)
                ->withQueryString();

        return Inertia::render('tesoreria/movimientos', [
            'pagos' => $pagos,
            'egresos' => $egresos,
            'filters' => $request->only(['fecha_inicio', 'fecha_fin', 'metodo_pago', 'estado', 'tipo', 'sort', 'direction']),
        ]);
    }

    public function show(Alumno $alumno): Response
    {
        $alumno->load(['apoderado', 'matriculas' => function ($query) {
            $query->latest('fecha_matricula')->with([
                'ciclo',
                'comprobantesPago.cuotas.auditorias.usuario',
                'comprobantesPago.cuotas.pagos' => function ($q) {
                    $q->where('estado', '!=', 'ANULADO')->with('auditorias.usuario');
                },
            ]);
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

                if (! $cuota || $cuota->estado === EstadoCuota::Pagada || $cuota->estado === EstadoCuota::Exonerada) {
                    $errors[] = "Cuota #{$cuotaId} ya está pagada, exonerada o no existe.";

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

    public function exonerar(Cuota $cuota, Request $request): RedirectResponse
    {
        $this->authorize('exonerar', $cuota);

        $validated = $request->validate([
            'motivo' => ['required', 'string', 'max:500'],
        ]);

        $exonerada = DB::transaction(function () use ($cuota, $validated): bool {
            // Bloquear la cuota dentro de la transacción para evitar
            // condiciones de carrera entre exoneraciones concurrentes.
            $cuota = Cuota::query()->lockForUpdate()->findOrFail($cuota->id_cuota);

            // Una cuota pagada o ya exonerada no puede exonerarse.
            if ($cuota->estado === EstadoCuota::Pagada || $cuota->estado === EstadoCuota::Exonerada) {
                return false;
            }

            // 1. Exonerar la cuota
            $cuota->update(['estado' => EstadoCuota::Exonerada]);

            // 2. Registrar la auditoría de la exoneración
            AuditoriaCuota::create([
                'cuota_id' => $cuota->id_cuota,
                'usuario_id' => auth()->id(),
                'accion' => 'EXONERAR',
                'motivo' => $validated['motivo'],
            ]);

            // 3. Recalcular el saldo pendiente del comprobante: las cuotas
            //    exoneradas dejan de contar como pendientes.
            $comprobante = $cuota->comprobantePago;
            if ($comprobante) {
                $saldoPendiente = $comprobante->cuotas()
                    ->with('pagos')
                    ->get()
                    ->sum(fn (Cuota $c) => $c->estado === EstadoCuota::Exonerada
                        ? 0
                        : $c->monto - $c->pagos
                            ->where('estado', '!=', 'ANULADO')
                            ->sum('monto'));

                $comprobante->update([
                    'saldo_pendiente' => max(0, $saldoPendiente),
                ]);
            }

            return true;
        });

        if (! $exonerada) {
            return back()->with('error', 'La cuota no puede exonerarse: ya está pagada o exonerada.');
        }

        return back()->with('success', 'Cuota exonerada correctamente.');
    }

    public function pagar(Cuota $cuota, Request $request): RedirectResponse
    {
        $this->authorize('create', Pago::class);

        $validated = $request->validate([
            'monto' => ['required', 'numeric', 'min:0.01'],
            'metodo_pago' => ['required', 'string', 'max:50'],
        ]);

        if ($cuota->estado === EstadoCuota::Pagada || $cuota->estado === EstadoCuota::Exonerada) {
            return back()->with('error', 'La cuota ya está pagada o exonerada.');
        }

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

        // Total egresos (los anulados dejan de contar como salida de caja)
        $totalEgresos = (float) Egreso::query()
            ->where('estado', '!=', 'ANULADO')
            ->sum('total');
        $saldoDisponible = $totalIngresosRecaudados - $totalEgresos;

        // Lista de egresos (incluye anulados con su auditoría)
        $egresos = Egreso::query()
            ->with(['user:id,name', 'auditorias.usuario'])
            ->latest('fecha')
            ->paginate(15)
            ->withQueryString();

        // Pagos recientes
        $pagosRecientes = Pago::query()
            ->with(['user:id,name', 'cuota.comprobantePago.matricula.alumno'])
            ->latest('fecha_pago')
            ->take(10)
            ->get();

        // Categorías de egreso dinámicas (mantenedor) para el formulario
        $categoriasEgreso = CategoriaFinanciera::query()
            ->where('tipo', TipoCategoriaFinanciera::Egreso)
            ->orderBy('es_por_defecto', 'desc')
            ->orderBy('nombre')
            ->get(['nombre', 'descripcion', 'es_por_defecto']);

        return Inertia::render('tesoreria/caja', [
            'ingresosPorConcepto' => $ingresosPorConcepto,
            'totalIngresos' => $totalIngresosRecaudados,
            'totalEgresos' => $totalEgresos,
            'saldoDisponible' => $saldoDisponible,
            'egresos' => $egresos,
            'pagosRecientes' => $pagosRecientes,
            'categoriasEgreso' => $categoriasEgreso,
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
