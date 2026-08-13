import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';
import {
    index as tesoreriaIndex,
    movimientos as movimientosIndex,
} from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { AuditoriaAnulacionTooltip } from '@/components/pagos/AuditoriaAnulacionTooltip';
import type { AuditoriaPagoItem } from '@/components/pagos/AuditoriaAnulacionTooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type PagoMovimiento = {
    id_pago: number;
    fecha_pago: string;
    monto: string;
    metodo_pago: string;
    estado: string;
    user: { name: string } | null;
    auditorias?: AuditoriaPagoItem[];
    cuota: {
        comprobante_pago: {
            matricula: {
                alumno: {
                    nombres: string;
                    apellidos: string;
                    dni?: string | null;
                };
            };
        };
    };
};

type EgresoMovimiento = {
    id_egreso: number;
    fecha: string;
    concepto: string;
    categoria: string;
    descripcion: string | null;
    cantidad: number;
    precio: number;
    igv: number;
    total: string;
    metodo_pago: string;
    estado: string;
    user: { name: string } | null;
    auditorias?: AuditoriaPagoItem[];
};

/**
 * Un movimiento del libro diario. Un pago o egreso anulado se descompone en
 * dos movimientos: el original (PAGO/EGRESO) y su reverso (ANULACION).
 */
type Movimiento = {
    key: string;
    tipo: 'PAGO' | 'EGRESO' | 'ANULACION';
    fecha: string;
    detalle: string;
    monto: number;
    metodo_pago: string;
    estado: 'PAGADO' | 'REGISTRADO' | 'ANULADO';
    registradoPor: string;
    auditorias?: AuditoriaPagoItem[];
};

type PaginatedCollection<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type MovimientosProps = {
    pagos: PaginatedCollection<PagoMovimiento>;
    egresos: PaginatedCollection<EgresoMovimiento>;
    filters: {
        fecha_inicio?: string | null;
        fecha_fin?: string | null;
        metodo_pago?: string | null;
        estado?: string | null;
        tipo?: 'todos' | 'ingresos' | 'egresos' | null;
        sort?: 'fecha' | 'monto' | null;
        direction?: 'asc' | 'desc' | null;
    };
};

const METODOS_PAGO = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'YAPE', label: 'Yape' },
    { value: 'PLIN', label: 'Plin' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'TARJETA', label: 'Tarjeta' },
];

const ESTADOS = [
    { value: 'PAGADO', label: 'Pagado' },
    { value: 'REGISTRADO', label: 'Registrado' },
    { value: 'ANULADO', label: 'Anulado' },
];

const TIPOS = [
    { value: 'todos', label: 'Todos' },
    { value: 'ingresos', label: 'Ingresos' },
    { value: 'egresos', label: 'Egresos' },
];

const POR_PAGINA = 15;

function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(Number(amount));
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export default function Movimientos({ pagos, egresos, filters }: MovimientosProps) {
    const [fechaInicio, setFechaInicio] = useState(filters.fecha_inicio ?? '');
    const [fechaFin, setFechaFin] = useState(filters.fecha_fin ?? '');
    const [metodoPago, setMetodoPago] = useState(filters.metodo_pago ?? '');
    const [estado, setEstado] = useState(filters.estado ?? '');
    const [tipo, setTipo] = useState(filters.tipo ?? 'todos');

    const aplicarFiltros = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            movimientosIndex.url(),
            {
                fecha_inicio: fechaInicio || undefined,
                fecha_fin: fechaFin || undefined,
                metodo_pago: metodoPago || undefined,
                estado: estado || undefined,
                tipo: tipo || undefined,
                sort: filters.sort || undefined,
                direction: filters.direction || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const limpiarFiltros = () => {
        setFechaInicio('');
        setFechaFin('');
        setMetodoPago('');
        setEstado('');
        setTipo('todos');
        router.get(
            movimientosIndex.url(),
            {},
            { preserveState: true, replace: true },
        );
    };

    const irAPagina = (page: number) => {
        router.get(
            movimientosIndex.url(),
            {
                fecha_inicio: filters.fecha_inicio || undefined,
                fecha_fin: filters.fecha_fin || undefined,
                metodo_pago: filters.metodo_pago || undefined,
                estado: filters.estado || undefined,
                tipo: filters.tipo || undefined,
                sort: filters.sort || undefined,
                direction: filters.direction || undefined,
                page,
            },
            { preserveState: true, replace: true },
        );
    };

    const cambiarOrden = (columna: 'fecha' | 'monto') => {
        const nuevaDireccion =
            filters.sort === columna && filters.direction === 'desc'
                ? 'asc'
                : 'desc';

        router.get(
            movimientosIndex.url(),
            {
                fecha_inicio: filters.fecha_inicio || undefined,
                fecha_fin: filters.fecha_fin || undefined,
                metodo_pago: filters.metodo_pago || undefined,
                estado: filters.estado || undefined,
                tipo: filters.tipo || undefined,
                sort: columna,
                direction: nuevaDireccion,
            },
            { preserveState: true, replace: true },
        );
    };

    const nombreAlumno = (pago: PagoMovimiento) => {
        const alumno = pago.cuota?.comprobante_pago?.matricula?.alumno;

        if (!alumno) {
            return '—';
        }

        return `${alumno.apellidos}, ${alumno.nombres}`;
    };

    // Construye el libro diario: cada pago o egreso anulado genera dos
    // movimientos (el original y su reverso), cada vigente genera uno.
    // Los ingresos (pagos) son positivos; los egresos, negativos; el reverso
    // de una anulación cancela el signo del movimiento original.
    const movimientos: Movimiento[] = [
        ...pagos.data.flatMap((pago) => {
            const anulacion = pago.auditorias
                ?.filter((a) => a.accion === 'ANULACION')
                .at(-1);

            const base = {
                detalle: nombreAlumno(pago),
                metodo_pago: pago.metodo_pago,
                auditorias: pago.auditorias,
            };

            if (pago.estado === 'ANULADO') {
                return [
                    {
                        ...base,
                        key: `pago-${pago.id_pago}-pago`,
                        tipo: 'PAGO' as const,
                        fecha: pago.fecha_pago,
                        monto: Number(pago.monto),
                        estado: 'PAGADO' as const,
                        registradoPor: pago.user?.name ?? '—',
                    },
                    {
                        ...base,
                        key: `pago-${pago.id_pago}-anulacion`,
                        tipo: 'ANULACION' as const,
                        fecha: anulacion?.created_at ?? pago.fecha_pago,
                        monto: -Number(pago.monto),
                        estado: 'ANULADO' as const,
                        registradoPor: anulacion?.usuario?.name ?? '—',
                    },
                ];
            }

            return [
                {
                    ...base,
                    key: `pago-${pago.id_pago}-pago`,
                    tipo: 'PAGO' as const,
                    fecha: pago.fecha_pago,
                    monto: Number(pago.monto),
                    estado: 'PAGADO' as const,
                    registradoPor: pago.user?.name ?? '—',
                },
            ];
        }),
        ...egresos.data.flatMap((egreso) => {
            const anulacion = egreso.auditorias
                ?.filter((a) => a.accion === 'ANULACION')
                .at(-1);

            const base = {
                detalle: egreso.concepto,
                metodo_pago: egreso.metodo_pago || 'EFECTIVO',
                auditorias: egreso.auditorias,
            };

            if (egreso.estado === 'ANULADO') {
                return [
                    {
                        ...base,
                        key: `egreso-${egreso.id_egreso}-egreso`,
                        tipo: 'EGRESO' as const,
                        fecha: egreso.fecha,
                        monto: -Number(egreso.total),
                        estado: 'REGISTRADO' as const,
                        registradoPor: egreso.user?.name ?? '—',
                    },
                    {
                        ...base,
                        key: `egreso-${egreso.id_egreso}-anulacion`,
                        tipo: 'ANULACION' as const,
                        fecha: anulacion?.created_at ?? egreso.fecha,
                        monto: Number(egreso.total),
                        estado: 'ANULADO' as const,
                        registradoPor: anulacion?.usuario?.name ?? '—',
                    },
                ];
            }

            return [
                {
                    ...base,
                    key: `egreso-${egreso.id_egreso}-egreso`,
                    tipo: 'EGRESO' as const,
                    fecha: egreso.fecha,
                    monto: -Number(egreso.total),
                    estado: 'REGISTRADO' as const,
                    registradoPor: egreso.user?.name ?? '—',
                },
            ];
        }),
    ];

    // El backend ya ordena cada colección en SQL; aquí se reordena el array
    // transformado para que las líneas de ANULACION (cuya fecha es la de la
    // auditoría, no la del movimiento original) queden en la posición correcta
    // dentro de la página según el orden activo. El sort de JS es estable.
    const sortColumn = filters.sort ?? 'fecha';
    const sortDirection = filters.direction ?? 'desc';

    movimientos.sort((a, b) => {
        const comparacion =
            sortColumn === 'monto'
                ? a.monto - b.monto
                : a.fecha.slice(0, 10).localeCompare(b.fecha.slice(0, 10));

        return sortDirection === 'asc' ? comparacion : -comparacion;
    });

    const hayFiltrosActivos =
        Boolean(filters.fecha_inicio) ||
        Boolean(filters.fecha_fin) ||
        Boolean(filters.metodo_pago) ||
        Boolean(filters.estado) ||
        Boolean(filters.tipo && filters.tipo !== 'todos');

    // Paginación combinada de ambas colecciones (misma página en cada una).
    const pagination = {
        current_page: Math.max(pagos.current_page, egresos.current_page),
        last_page: Math.max(pagos.last_page, egresos.last_page),
        total: (pagos.total ?? 0) + (egresos.total ?? 0),
    };
    const desde = pagination.total > 0
        ? (pagination.current_page - 1) * POR_PAGINA + 1
        : 0;
    const hasta = Math.min(pagination.current_page * POR_PAGINA, pagination.total);

    return (
        <>
            <Head title="Movimientos de Tesorería" />

            <header className="border-b bg-white px-8 py-6">
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                    <ArrowLeft className="size-4" />
                    <a
                        href={tesoreriaIndex.url()}
                        className="hover:text-slate-800"
                    >
                        Volver a Tesorería
                    </a>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Movimientos de Tesorería
                </h1>
                <p className="text-sm text-slate-500">
                    Libro diario de ingresos (pagos) y egresos registrados y
                    anulados
                </p>
            </header>

            <div className="flex-1 px-8 py-6">
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <form
                            onSubmit={aplicarFiltros}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="fecha_inicio">
                                    Fecha inicio
                                </Label>
                                <Input
                                    id="fecha_inicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) =>
                                        setFechaInicio(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fecha_fin">Fecha fin</Label>
                                <Input
                                    id="fecha_fin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) =>
                                        setFechaFin(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo</Label>
                                <Select
                                    value={tipo}
                                    onValueChange={(val) =>
                                        setTipo(
                                            val as
                                                | 'todos'
                                                | 'ingresos'
                                                | 'egresos',
                                        )
                                    }
                                >
                                    <SelectTrigger id="tipo">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS.map((t) => (
                                            <SelectItem
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="metodo_pago">
                                    Método de pago
                                </Label>
                                <Select
                                    value={metodoPago || 'all'}
                                    onValueChange={(val) =>
                                        setMetodoPago(val === 'all' ? '' : val)
                                    }
                                >
                                    <SelectTrigger id="metodo_pago">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        {METODOS_PAGO.map((m) => (
                                            <SelectItem
                                                key={m.value}
                                                value={m.value}
                                            >
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select
                                    value={estado || 'all'}
                                    onValueChange={(val) =>
                                        setEstado(val === 'all' ? '' : val)
                                    }
                                >
                                    <SelectTrigger id="estado">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        {ESTADOS.map((e) => (
                                            <SelectItem
                                                key={e.value}
                                                value={e.value}
                                            >
                                                {e.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
                                <Button
                                    type="submit"
                                    className="gap-2 bg-[#1a237e] hover:bg-[#0d1557]"
                                >
                                    <Search className="size-4" />
                                    Buscar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={limpiarFiltros}
                                    disabled={!hayFiltrosActivos}
                                    className="gap-2"
                                >
                                    <X className="size-4" />
                                    Limpiar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        {movimientos.length === 0 ? (
                            <div className="rounded-xl border border-dashed bg-white p-12 text-center">
                                <p className="text-slate-600">
                                    No hay movimientos que coincidan con los
                                    filtros.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cambiarOrden('fecha')
                                                        }
                                                        className={cn(
                                                            'inline-flex cursor-pointer items-center gap-1 hover:text-slate-900',
                                                            sortColumn ===
                                                                'fecha' &&
                                                                'text-[#1a237e]',
                                                        )}
                                                    >
                                                        Fecha de Movimiento
                                                        {sortColumn ===
                                                        'fecha' ? (
                                                            sortDirection ===
                                                            'asc' ? (
                                                                <ChevronUp className="size-3.5" />
                                                            ) : (
                                                                <ChevronDown className="size-3.5" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="size-3.5 text-slate-400" />
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead>Detalle</TableHead>
                                                <TableHead className="text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            cambiarOrden('monto')
                                                        }
                                                        className={cn(
                                                            'inline-flex cursor-pointer items-center gap-1',
                                                            sortColumn ===
                                                                'monto' &&
                                                                'text-[#1a237e]',
                                                        )}
                                                    >
                                                        Monto
                                                        {sortColumn ===
                                                        'monto' ? (
                                                            sortDirection ===
                                                            'asc' ? (
                                                                <ChevronUp className="size-3.5" />
                                                            ) : (
                                                                <ChevronDown className="size-3.5" />
                                                            )
                                                        ) : (
                                                            <ChevronsUpDown className="size-3.5 text-slate-400" />
                                                        )}
                                                    </button>
                                                </TableHead>
                                                <TableHead>Método</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>
                                                    Registrado por
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {movimientos.map((mov) => (
                                                <TableRow key={mov.key}>
                                                    <TableCell className="whitespace-nowrap">
                                                        {formatDate(mov.fecha)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {mov.detalle}
                                                    </TableCell>
                                                    <TableCell
                                                        className={cn(
                                                            'text-right font-semibold',
                                                            mov.tipo ===
                                                                'ANULACION'
                                                                ? 'text-red-600'
                                                                : mov.tipo ===
                                                                    'EGRESO'
                                                                  ? 'text-rose-600'
                                                                  : 'text-slate-900',
                                                        )}
                                                    >
                                                        {formatCurrency(
                                                            mov.monto,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {mov.metodo_pago}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="flex items-center gap-1">
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    mov.estado ===
                                                                        'PAGADO' &&
                                                                        'bg-green-100 text-green-700',
                                                                    mov.estado ===
                                                                        'REGISTRADO' &&
                                                                        'bg-blue-100 text-blue-700',
                                                                    mov.estado ===
                                                                        'ANULADO' &&
                                                                        'bg-red-100 text-red-700',
                                                                )}
                                                            >
                                                                {mov.estado}
                                                            </Badge>
                                                            {mov.estado ===
                                                                'ANULADO' && (
                                                                <AuditoriaAnulacionTooltip
                                                                    auditorias={
                                                                        mov.auditorias
                                                                    }
                                                                />
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {mov.registradoPor}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {pagination.last_page > 1 && (
                                    <div className="mt-6 flex flex-col items-center gap-3">
                                        <p className="text-xs text-slate-400">
                                            Mostrando {desde}–{hasta} de{' '}
                                            {pagination.total} movimientos
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={
                                                    pagination.current_page === 1
                                                }
                                                onClick={() =>
                                                    irAPagina(
                                                        pagination.current_page -
                                                            1,
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                Anterior
                                            </Button>
                                            {Array.from(
                                                {
                                                    length: pagination.last_page,
                                                },
                                                (_, i) => i + 1,
                                            ).map((page) => {
                                                const isActive =
                                                    page ===
                                                    pagination.current_page;
                                                const show =
                                                    page === 1 ||
                                                    page ===
                                                        pagination.last_page ||
                                                    Math.abs(
                                                        page -
                                                            pagination
                                                                .current_page,
                                                    ) <= 2;

                                                if (!show) {
                                                    if (
                                                        page === 2 ||
                                                        page ===
                                                            pagination
                                                                .last_page - 1
                                                    ) {
                                                        return (
                                                            <span
                                                                key={page}
                                                                className="px-1 text-slate-300"
                                                            >
                                                                ...
                                                            </span>
                                                        );
                                                    }

                                                    return null;
                                                }

                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={
                                                            isActive
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            irAPagina(page)
                                                        }
                                                        className={cn(
                                                            'min-w-[36px] cursor-pointer',
                                                            isActive &&
                                                                'bg-[#1a237e] hover:bg-[#0d1557]',
                                                        )}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={
                                                    pagination.current_page ===
                                                    pagination.last_page
                                                }
                                                onClick={() =>
                                                    irAPagina(
                                                        pagination.current_page +
                                                            1,
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}