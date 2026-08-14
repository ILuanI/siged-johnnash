<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\CategoriaEgreso;
use App\Enums\CategoriaIngreso;
use App\Enums\ConceptoPago;
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
use App\Models\User;
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
            'search' => ['nullable', 'string', 'max:255'],
            'categoria' => ['nullable', 'string', 'max:60'],
            'concepto' => ['nullable', 'string', 'max:60'],
        ];

        if ($request->filled('fecha_inicio')) {
            $rules['fecha_fin'][] = 'after_or_equal:fecha_inicio';
        }

        $validated = $request->validate($rules);

        $sort = $validated['sort'] ?? 'fecha';
        $direction = $validated['direction'] ?? 'desc';
        $tipo = $validated['tipo'] ?? 'todos';
        $search = $validated['search'] ?? null;
        $categoria = $validated['categoria'] ?? null;
        $concepto = $validated['concepto'] ?? null;

        // Ingresos: pagos registrados contra cuotas (con sus auditorías).
        $pagos = $tipo === 'egresos'
            ? Pago::query()->whereRaw('1 = 0')->paginate(15)
            : Pago::query()
                ->with(['cuota.comprobantePago.matricula.alumno', 'user', 'auditorias.usuario'])
                ->when($validated['fecha_inicio'] ?? null, fn ($query, $fechaInicio) => $query->whereDate('fecha_pago', '>=', $fechaInicio))
                ->when($validated['fecha_fin'] ?? null, fn ($query, $fechaFin) => $query->whereDate('fecha_pago', '<=', $fechaFin))
                ->when($validated['metodo_pago'] ?? null, fn ($query, $metodoPago) => $query->where('metodo_pago', $metodoPago))
                ->when($categoria, fn ($query, $cat) => $query->whereHas('cuota.comprobantePago', fn ($query) => $query->where('categoria', $cat)))
                ->when($concepto, fn ($query, $conc) => $query->whereHas('cuota.comprobantePago', fn ($query) => $query->where('concepto', $conc)))
                ->when($validated['estado'] ?? null, function ($query, $estado) {
                    // Pagos usan PAGADO; egresos usan REGISTRADO. Ambos comparten ANULADO.
                    $query->where('estado', $estado === 'ANULADO' ? 'ANULADO' : 'PAGADO');
                })
                ->when($search, function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->whereHas('cuota.comprobantePago.matricula.alumno', function ($query) use ($search) {
                                $query
                                    ->where('nombres', 'like', "%{$search}%")
                                    ->orWhere('apellidos', 'like', "%{$search}%")
                                    ->orWhere('dni', 'like', "%{$search}%");
                            })
                            ->orWhereHas('cuota.comprobantePago', function ($query) use ($search) {
                                $query
                                    ->where('concepto', 'like', "%{$search}%")
                                    ->orWhere('descripcion', 'like', "%{$search}%");
                            })
                            ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                    });
                })
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
                ->when($validated['metodo_pago'] ?? null, fn ($query, $metodoPago) => $query->where('metodo_pago', $metodoPago))
                ->when($categoria, fn ($query, $cat) => $query->where('categoria', $cat))
                ->when($concepto, fn ($query, $conc) => $query->where('tipo_egreso', $conc))
                ->when($validated['estado'] ?? null, function ($query, $estado) {
                    // Egresos usan REGISTRADO; pagos usan PAGADO. Ambos comparten ANULADO.
                    $query->where('estado', $estado === 'ANULADO' ? 'ANULADO' : 'REGISTRADO');
                })
                ->when($search, function ($query) use ($search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('tipo_egreso', 'like', "%{$search}%")
                            ->orWhere('descripcion', 'like', "%{$search}%")
                            ->orWhereHas('user', function ($query) use ($search) {
                                $query->where('name', 'like', "%{$search}%");
                            });
                    });
                })
                ->orderBy($sort === 'monto' ? 'total' : 'fecha', $direction)
                ->paginate(15)
                ->withQueryString();

        // Catálogo de categorías contables (unión de ingresos y egresos) para
        // el selector de filtros; si el mantenedor está vacío, usa los enums.
        $categorias = CategoriaFinanciera::query()
            ->orderBy('nombre')
            ->pluck('nombre')
            ->unique()
            ->values()
            ->toArray();

        if (empty($categorias)) {
            $categorias = array_values(array_unique([
                ...array_column(CategoriaIngreso::cases(), 'value'),
                ...array_column(CategoriaEgreso::cases(), 'value'),
            ]));
        }

        // Catálogo de conceptos para el filtro: combina los conceptos de pago
        // (comprobante_pago.concepto) con los tipos de egreso (egreso.tipo_egreso),
        // ya que el filtro de concepto aplica a ambas colecciones.
        $conceptosPago = array_column(ConceptoPago::cases(), 'value');
        $conceptosEgreso = Egreso::query()->distinct()->pluck('tipo_egreso')->filter()->toArray();
        $conceptos = array_values(array_unique(array_merge($conceptosPago, $conceptosEgreso)));

        return Inertia::render('tesoreria/movimientos', [
            'pagos' => $pagos,
            'egresos' => $egresos,
            'categorias' => $categorias,
            'conceptos' => $conceptos,
            'filters' => $request->only(['fecha_inicio', 'fecha_fin', 'metodo_pago', 'estado', 'tipo', 'sort', 'direction', 'search', 'categoria', 'concepto']),
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
                    'fecha_pago' => now()->toDateTimeString(),
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
                'fecha_pago' => now()->toDateTimeString(),
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
        $this->authorize('viewAny', Pago::class);

        $rules = [
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            // Filtros específicos de la tabla de Ingresos del Período.
            'search_ingreso' => ['nullable', 'string', 'max:255'],
            'metodo_pago' => ['nullable', 'string', 'in:EFECTIVO,YAPE,PLIN,TRANSFERENCIA,TARJETA'],
            'categoria_ingreso' => ['nullable', 'string', 'max:60'],
            'concepto' => ['nullable', 'string', 'in:MATRICULA,SIMULACRO,CARNET,EXTRAORDINARIO'],
            'usuario_ingreso' => ['nullable', 'integer', 'exists:users,id'],
            // Filtros específicos de la tabla de Egresos.
            'search_egreso' => ['nullable', 'string', 'max:255'],
            'categoria_egreso' => ['nullable', 'string', 'max:60'],
            'usuario_egreso' => ['nullable', 'integer', 'exists:users,id'],
        ];

        if ($request->filled('fecha_inicio')) {
            $rules['fecha_fin'][] = 'after_or_equal:fecha_inicio';
        }

        $validated = $request->validate($rules);

        // Por defecto se filtra por el mes actual cuando no se envían fechas.
        $fechaInicio = $validated['fecha_inicio'] ?? now()->startOfMonth()->toDateString();
        $fechaFin = $validated['fecha_fin'] ?? now()->endOfMonth()->toDateString();
        $searchIngreso = $validated['search_ingreso'] ?? null;
        $metodoPago = $validated['metodo_pago'] ?? null;
        $categoriaIngreso = $validated['categoria_ingreso'] ?? null;
        $concepto = $validated['concepto'] ?? null;
        $usuarioIngreso = $validated['usuario_ingreso'] ?? null;
        $searchEgreso = $validated['search_egreso'] ?? null;
        $categoriaEgresoFiltro = $validated['categoria_egreso'] ?? null;
        $usuarioEgreso = $validated['usuario_egreso'] ?? null;

        // Consolidado de Ingresos agrupado por concepto del comprobante de pago
        $ingresosPorConceptoRaw = DB::table('pago')
            ->join('cuota', 'pago.id_cuota', '=', 'cuota.id_cuota')
            ->join('comprobante_pago', 'cuota.id_comprobante', '=', 'comprobante_pago.id_comprobante')
            ->leftJoin('matricula', 'comprobante_pago.id_matricula', '=', 'matricula.id_matricula')
            ->leftJoin('alumno', 'matricula.id_alumno', '=', 'alumno.id_alumno')
            ->leftJoin('users', 'pago.user_id', '=', 'users.id')
            ->select('comprobante_pago.concepto', DB::raw('SUM(pago.monto) as total_recaudado'), DB::raw('COUNT(pago.id_pago) as cantidad_pagos'))
            ->when($fechaInicio, fn ($query, $fi) => $query->whereDate('pago.fecha_pago', '>=', $fi))
            ->when($fechaFin, fn ($query, $ff) => $query->whereDate('pago.fecha_pago', '<=', $ff))
            ->when($metodoPago, fn ($query, $mp) => $query->where('pago.metodo_pago', $mp))
            ->when($categoriaIngreso, fn ($query, $cat) => $query->where('comprobante_pago.categoria', $cat))
            ->when($concepto, fn ($query, $conc) => $query->where('comprobante_pago.concepto', $conc))
            ->when($usuarioIngreso, fn ($query, $u) => $query->where('pago.user_id', $u))
            ->when($searchIngreso, function ($query) use ($searchIngreso) {
                $query->where(function ($query) use ($searchIngreso) {
                    $query
                        ->where('alumno.nombres', 'like', "%{$searchIngreso}%")
                        ->orWhere('alumno.apellidos', 'like', "%{$searchIngreso}%")
                        ->orWhere('alumno.dni', 'like', "%{$searchIngreso}%")
                        ->orWhere('comprobante_pago.concepto', 'like', "%{$searchIngreso}%")
                        ->orWhere('comprobante_pago.descripcion', 'like', "%{$searchIngreso}%")
                        ->orWhere('users.name', 'like', "%{$searchIngreso}%");
                });
            })
            // Exclusión mutua: al buscar en egresos, los ingresos no deben cruzarse.
            ->when($searchEgreso, fn ($query) => $query->whereRaw('1 = 0'))
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
            ->when($fechaInicio, fn ($query, $fi) => $query->whereDate('fecha', '>=', $fi))
            ->when($fechaFin, fn ($query, $ff) => $query->whereDate('fecha', '<=', $ff))
            ->when($categoriaEgresoFiltro, fn ($query, $cat) => $query->where('categoria', $cat))
            ->when($usuarioEgreso, fn ($query, $u) => $query->where('user_id', $u))
            ->when($searchEgreso, function ($query) use ($searchEgreso) {
                $query->where(function ($query) use ($searchEgreso) {
                    $query
                        ->where('tipo_egreso', 'like', "%{$searchEgreso}%")
                        ->orWhere('descripcion', 'like', "%{$searchEgreso}%")
                        ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$searchEgreso}%"));
                });
            })
            // Exclusión mutua: al buscar en ingresos, los egresos no deben cruzarse.
            ->when($searchIngreso, fn ($query) => $query->whereRaw('1 = 0'))
            ->sum('total');
        $saldoDisponible = $totalIngresosRecaudados - $totalEgresos;

        // Lista de egresos (incluye anulados con su auditoría)
        $egresos = Egreso::query()
            ->with(['user:id,name', 'auditorias.usuario'])
            ->when($fechaInicio, fn ($query, $fi) => $query->whereDate('fecha', '>=', $fi))
            ->when($fechaFin, fn ($query, $ff) => $query->whereDate('fecha', '<=', $ff))
            ->when($categoriaEgresoFiltro, fn ($query, $cat) => $query->where('categoria', $cat))
            ->when($usuarioEgreso, fn ($query, $u) => $query->where('user_id', $u))
            ->when($searchEgreso, function ($query) use ($searchEgreso) {
                $query->where(function ($query) use ($searchEgreso) {
                    $query
                        ->where('tipo_egreso', 'like', "%{$searchEgreso}%")
                        ->orWhere('descripcion', 'like', "%{$searchEgreso}%")
                        ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$searchEgreso}%"));
                });
            })
            // Exclusión mutua: al buscar en ingresos, los egresos no deben cruzarse.
            ->when($searchIngreso, fn ($query) => $query->whereRaw('1 = 0'))
            ->latest('fecha')
            ->paginate(15)
            ->withQueryString();

        // Ingresos del período (paginados, filtrados por el rango de fechas).
        $pagos = Pago::query()
            ->with(['user:id,name', 'cuota.comprobantePago.matricula.alumno'])
            ->when($fechaInicio, fn ($query, $fi) => $query->whereDate('fecha_pago', '>=', $fi))
            ->when($fechaFin, fn ($query, $ff) => $query->whereDate('fecha_pago', '<=', $ff))
            ->when($metodoPago, fn ($query, $mp) => $query->where('metodo_pago', $mp))
            ->when($categoriaIngreso, fn ($query, $cat) => $query->whereHas('cuota.comprobantePago', fn ($query) => $query->where('categoria', $cat)))
            ->when($concepto, fn ($query, $conc) => $query->whereHas('cuota.comprobantePago', fn ($query) => $query->where('concepto', $conc)))
            ->when($usuarioIngreso, fn ($query, $u) => $query->where('user_id', $u))
            ->when($searchIngreso, function ($query) use ($searchIngreso) {
                $query->where(function ($query) use ($searchIngreso) {
                    $query
                        ->whereHas('cuota.comprobantePago.matricula.alumno', function ($query) use ($searchIngreso) {
                            $query
                                ->where('nombres', 'like', "%{$searchIngreso}%")
                                ->orWhere('apellidos', 'like', "%{$searchIngreso}%")
                                ->orWhere('dni', 'like', "%{$searchIngreso}%");
                        })
                        ->orWhereHas('cuota.comprobantePago', function ($query) use ($searchIngreso) {
                            $query
                                ->where('concepto', 'like', "%{$searchIngreso}%")
                                ->orWhere('descripcion', 'like', "%{$searchIngreso}%");
                        })
                        ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$searchIngreso}%"));
                });
            })
            // Exclusión mutua: al buscar en egresos, los ingresos no deben cruzarse.
            ->when($searchEgreso, fn ($query) => $query->whereRaw('1 = 0'))
            ->latest('fecha_pago')
            ->paginate(15)
            ->withQueryString();

        // Categorías de egreso dinámicas (mantenedor) para el formulario y el
        // filtro específico de la tabla de egresos.
        $categoriasEgreso = CategoriaFinanciera::query()
            ->where('tipo', TipoCategoriaFinanciera::Egreso)
            ->orderBy('es_por_defecto', 'desc')
            ->orderBy('nombre')
            ->get(['nombre', 'descripcion', 'es_por_defecto'])
            ->unique('nombre')
            ->values();

        // Categorías de ingreso dinámicas (mantenedor) para el filtro
        // específico de la tabla de ingresos; si el mantenedor está vacío,
        // usa el enum CategoriaIngreso como respaldo.
        $categoriasIngreso = CategoriaFinanciera::query()
            ->where('tipo', TipoCategoriaFinanciera::Ingreso)
            ->orderBy('es_por_defecto', 'desc')
            ->orderBy('nombre')
            ->pluck('nombre')
            ->unique()
            ->values()
            ->toArray();

        if (empty($categoriasIngreso)) {
            $categoriasIngreso = array_column(CategoriaIngreso::cases(), 'value');
        }

        $igvPorcentajeDefecto = Configuracion::where('clave', 'igv_porcentaje_defecto')->value('valor') ?? '18.00';

        // Usuarios para los filtros por usuario de cada tabla.
        $usuarios = User::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]);

        $conceptos = array_column(ConceptoPago::cases(), 'value');

        return Inertia::render('tesoreria/caja', [
            'ingresosPorConcepto' => $ingresosPorConcepto,
            'totalIngresos' => $totalIngresosRecaudados,
            'totalEgresos' => $totalEgresos,
            'saldoDisponible' => $saldoDisponible,
            'egresos' => $egresos,
            'pagos' => $pagos,
            'categoriasEgreso' => $categoriasEgreso,
            'categoriasIngreso' => $categoriasIngreso,
            'usuarios' => $usuarios,
            'conceptos' => $conceptos,
            'igv_porcentaje_defecto' => $igvPorcentajeDefecto,
            'filters' => [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'search_ingreso' => $searchIngreso,
                'metodo_pago' => $metodoPago,
                'categoria_ingreso' => $categoriaIngreso,
                'concepto' => $concepto,
                'usuario_ingreso' => $usuarioIngreso,
                'search_egreso' => $searchEgreso,
                'categoria_egreso' => $categoriaEgresoFiltro,
                'usuario_egreso' => $usuarioEgreso,
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
