import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Building2,
    CalendarDays,
    CreditCard,
    FileSpreadsheet,
    Plus,
    Receipt,
    Search,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { caja as cajaIndex } from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import InputError from '@/components/input-error';
import { AnularEgresoDialog } from '@/components/pagos/AnularEgresoDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const METODOS_PAGO = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'YAPE', label: 'Yape' },
    { value: 'PLIN', label: 'Plin' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'TARJETA', label: 'Tarjeta' },
];

const CATEGORIAS_EGRESO_FALLBACK = [
    'OPERATIVO',
    'ADMINISTRATIVO',
    'MANTENIMIENTO',
    'SERVICIOS',
    'ACADEMICO',
    'OTROS',
] as const;

const CATEGORIAS_INGRESO_FALLBACK = [
    'ACADEMICO',
    'SERVICIOS',
    'EVENTOS',
    'ADMINISTRATIVO',
    'OTROS',
] as const;

type CategoriaEgresoItem = {
    nombre: string;
    descripcion: string | null;
    es_por_defecto: boolean;
};

function categoriaBadgeClass(categoria: string): string {
    switch (categoria.toUpperCase()) {
        case 'OPERATIVO':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'ADMINISTRATIVO':
            return 'border-purple-200 bg-purple-50 text-purple-700';
        case 'MANTENIMIENTO':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'SERVICIOS':
            return 'border-cyan-200 bg-cyan-50 text-cyan-700';
        case 'ACADEMICO':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(Number(amount));
}

function formatDate(dateStr: string) {
    if (!dateStr) {
return '—';
}

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
return dateStr;
}

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

type Egreso = {
    id_egreso: number;
    concepto: string;
    categoria: string;
    descripcion: string | null;
    cantidad: number;
    precio: number;
    igv: number;
    total: number;
    fecha: string;
    estado?: string | null;
    user?: {
        id: number;
        name: string;
    };
    auditorias?: {
        id: number;
        accion: string;
        motivo?: string | null;
        created_at?: string | null;
        usuario?: { name: string } | null;
    }[];
};

type PagoMovimiento = {
    id_pago: number;
    fecha_pago: string;
    monto: string | number;
    metodo_pago: string;
    estado?: string | null;
    user?: { id: number; name: string } | null;
    cuota?: {
        comprobante_pago?: {
            concepto: string;
            categoria: string | null;
            matricula?: {
                alumno?: {
                    nombres: string;
                    apellidos: string;
                };
            };
        };
    } | null;
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

type PageProps = {
    ingresosPorConcepto: {
        MATRICULA: number;
        SIMULACRO: number;
        CARNET: number;
        EXTRAORDINARIO: number;
    };
    totalIngresos: number;
    totalEgresos: number;
    saldoDisponible: number;
    egresos: {
        data: Egreso[];
        links: any[];
    };
    pagos: PaginatedCollection<PagoMovimiento>;
    categoriasEgreso?: CategoriaEgresoItem[];
    categoriasIngreso?: string[];
    usuarios?: { id: number; name: string }[];
    conceptos?: string[];
    igv_porcentaje_defecto?: string;
    filters: {
        fecha_inicio: string;
        fecha_fin: string;
        search_ingreso?: string | null;
        metodo_pago?: string | null;
        categoria_ingreso?: string | null;
        concepto?: string | null;
        usuario_ingreso?: number | string | null;
        search_egreso?: string | null;
        categoria_egreso?: string | null;
        usuario_egreso?: number | string | null;
    };
};

export default function CajaGeneralIndex({
    ingresosPorConcepto,
    totalIngresos,
    totalEgresos,
    saldoDisponible,
    egresos,
    pagos,
    categoriasEgreso,
    categoriasIngreso,
    conceptos,
    usuarios,
    igv_porcentaje_defecto,
    filters,
}: PageProps) {
    const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);

    // Única fuente de verdad para los filtros (fechas, ingresos y egresos) y
    // la paginación. `useForm` se sincroniza con `filters` del servidor vía
    // `useEffect` para evitar estados desincronizados entre la UI y la
    // petición de Inertia.
    const formFiltros = useForm({
        fecha_inicio: filters.fecha_inicio ?? '',
        fecha_fin: filters.fecha_fin ?? '',
        search_ingreso: filters.search_ingreso ?? '',
        metodo_pago: filters.metodo_pago ?? '',
        categoria_ingreso: filters.categoria_ingreso ?? '',
        concepto: filters.concepto ?? '',
        usuario_ingreso: filters.usuario_ingreso ? String(filters.usuario_ingreso) : '',
        search_egreso: filters.search_egreso ?? '',
        categoria_egreso: filters.categoria_egreso ?? '',
        usuario_egreso: filters.usuario_egreso ? String(filters.usuario_egreso) : '',
        page: 1,
    });

    const { data: filtros, setData: setFiltro } = formFiltros;

    // Omite los valores vacíos para no enviarlos como query params.
    // Se aplica de forma explícita al construir el payload de `router.get`,
    // ya que `router.get` no utiliza el `transform` del formulario.
    const limpiarDatos = (
        datos: Record<string, string | number>,
    ): Record<string, string | number> => {
        const limpios: Record<string, string | number> = {};
        Object.entries(datos).forEach(([clave, valor]) => {
            if (valor !== '' && valor !== null && valor !== undefined) {
                limpios[clave] = valor;
            }
        });

        return limpios;
    };

    useEffect(() => {
        setFiltro((actual) => ({
            ...actual,
            fecha_inicio: filters.fecha_inicio ?? '',
            fecha_fin: filters.fecha_fin ?? '',
            search_ingreso: filters.search_ingreso ?? '',
            metodo_pago: filters.metodo_pago ?? '',
            categoria_ingreso: filters.categoria_ingreso ?? '',
            concepto: filters.concepto ?? '',
            usuario_ingreso: filters.usuario_ingreso ? String(filters.usuario_ingreso) : '',
            search_egreso: filters.search_egreso ?? '',
            categoria_egreso: filters.categoria_egreso ?? '',
            usuario_egreso: filters.usuario_egreso ? String(filters.usuario_egreso) : '',
        }));
    }, [filters, setFiltro]);

    // Categorías dinámicas del mantenedor con fallback al catálogo fijo.
    const categoriasEgresoDisponibles =
        categoriasEgreso && categoriasEgreso.length > 0
            ? categoriasEgreso.map((c) => c.nombre)
            : [...CATEGORIAS_EGRESO_FALLBACK];

    const categoriasIngresoDisponibles =
        categoriasIngreso && categoriasIngreso.length > 0
            ? categoriasIngreso
            : [...CATEGORIAS_INGRESO_FALLBACK];

    const categoriaEgresoPorDefecto =
        categoriasEgreso?.find((c) => c.es_por_defecto)?.nombre ?? 'OPERATIVO';

    const defaultIgvPercent = igv_porcentaje_defecto ? Number(igv_porcentaje_defecto) : 18.00;

    // Navegación de la tabla paginada de ingresos preservando todos los
    // filtros aplicados por el backend. Construimos el objeto de datos
    // explícito, lo asignamos a `setFiltro` para mantener la UI en sincronía y
    // lo enviamos de forma síncrona como payload de `router.get` (no depende
    // del ref interno de `useForm`), garantizando que los filtros se apliquen
    // en el primer clic.
    const irAPaginaIngresos = (page: number) => {
        const nuevoData: typeof filtros = { ...filtros, page };
        setFiltro(nuevoData);
        router.get(cajaIndex.url(), limpiarDatos(nuevoData), {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    // Accesos rápidos (presets) para seleccionar rangos de fecha comunes.
    const hoy = () => {
        const h = new Date().toISOString().split('T')[0];
        setFiltro('fecha_inicio', h);
        setFiltro('fecha_fin', h);
    };

    const esteMes = () => {
        const now = new Date();
        const inicio = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split('T')[0];
        setFiltro('fecha_inicio', inicio);
        setFiltro('fecha_fin', fin);
    };

    const mesAnterior = () => {
        const now = new Date();
        const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            .toISOString()
            .split('T')[0];
        const fin = new Date(now.getFullYear(), now.getMonth(), 0)
            .toISOString()
            .split('T')[0];
        setFiltro('fecha_inicio', inicio);
        setFiltro('fecha_fin', fin);
    };

    const aplicarFiltros = (e: React.FormEvent) => {
        e.preventDefault();
        // Al aplicar filtros se reinicia la paginación en la primera página.
        // Pasamos el objeto de datos explícito a `setFiltro` para no enviar el
        // estado del render anterior en la primera pulsación.
        const nuevoData: typeof filtros = { ...filtros, page: 1 };
        setFiltro(nuevoData);
        router.get(cajaIndex.url(), limpiarDatos(nuevoData), {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const limpiarFiltros = () => {
        const nuevoData: typeof filtros = {
            fecha_inicio: '',
            fecha_fin: '',
            search_ingreso: '',
            metodo_pago: '',
            categoria_ingreso: '',
            concepto: '',
            usuario_ingreso: '',
            search_egreso: '',
            categoria_egreso: '',
            usuario_egreso: '',
            page: 1,
        };
        setFiltro(nuevoData);
        router.get(cajaIndex.url(), limpiarDatos(nuevoData), {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const hayFiltrosActivos =
        Boolean(filtros.fecha_inicio) ||
        Boolean(filtros.fecha_fin) ||
        Boolean(filtros.search_ingreso) ||
        Boolean(filtros.metodo_pago) ||
        Boolean(filtros.categoria_ingreso) ||
        Boolean(filtros.concepto) ||
        Boolean(filtros.usuario_ingreso) ||
        Boolean(filtros.search_egreso) ||
        Boolean(filtros.categoria_egreso) ||
        Boolean(filtros.usuario_egreso);

    const { data, setData, post, processing, errors, reset } = useForm({
        concepto: '',
        categoria: categoriaEgresoPorDefecto,
        descripcion: '',
        cantidad: '1',
        precio: '',
        aplica_igv: true,
        igv_porcentaje: defaultIgvPercent.toString(),
        igv_tipo: 'ANTES' as 'ANTES' | 'DESPUES',
        fecha: new Date().toISOString().split('T')[0],
    });

    // Real-time calculation summary
    const cantidadNum = Number(data.cantidad) || 0;
    const precioNum = Number(data.precio) || 0;
    const igvPorcentNum = Number(data.igv_porcentaje) || 0;

    let subtotalCalc = 0;
    let igvCalc = 0;
    let totalCalc = 0;

    if (!data.aplica_igv || igvPorcentNum <= 0) {
        subtotalCalc = cantidadNum * precioNum;
        igvCalc = 0;
        totalCalc = subtotalCalc;
    } else {
        const p = igvPorcentNum / 100;

        if (data.igv_tipo === 'ANTES') {
            subtotalCalc = cantidadNum * precioNum;
            igvCalc = Math.round(subtotalCalc * p * 100) / 100;
            totalCalc = subtotalCalc + igvCalc;
        } else {
            totalCalc = cantidadNum * precioNum;
            subtotalCalc = Math.round((totalCalc / (1 + p)) * 100) / 100;
            igvCalc = Math.round((totalCalc - subtotalCalc) * 100) / 100;
        }
    }

    const handleCreateEgreso = (e: React.FormEvent) => {
        e.preventDefault();
        post('/tesoreria/egresos', {
            onSuccess: () => {
                setIsEgresoModalOpen(false);
                reset();
                toast.success('Egreso registrado correctamente.');
            },
            onError: () => {
                toast.error('Ocurrió un error al registrar el egreso.');
            },
        });
    };

    return (
        <>
            <Head title="Caja General - Movimiento Económico" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0b145f]">
                            Caja General y Tesorería
                        </h1>
                        <p className="text-sm text-slate-500">
                            Arqueo de ingresos por concepto, egresos y
                            movimiento económico general
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/tesoreria/estado-cuenta">
                            <Button variant="outline">
                                Ver Estado de Cuentas Alumnos
                            </Button>
                        </Link>

                        <Link href="/ajustes?tab=categorias">
                            <Button variant="outline">
                                Categorías Financieras
                            </Button>
                        </Link>

                        <Button
                            onClick={() => setIsEgresoModalOpen(true)}
                            className="gap-2 bg-[#ff7043] text-white hover:bg-[#f4511e]"
                        >
                            <Plus className="size-4" />
                            Registrar Egreso
                        </Button>
                    </div>
                </div>

                {/* Tarjeta de Filtros Globales: Rango de Fechas */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold text-[#0b145f]">
                            Rango de Fechas
                        </CardTitle>
                        <CardDescription>
                            Filtro global que aplica a las tarjetas de resumen,
                            al consolidado y a ambas tablas (ingresos y egresos).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={aplicarFiltros} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_inicio">
                                        Fecha inicio
                                    </Label>
                                        <Input
                                            id="fecha_inicio"
                                            type="date"
                                            value={filtros.fecha_inicio}
                                            onChange={(e) =>
                                                setFiltro('fecha_inicio', e.target.value)
                                            }
                                        />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fecha_fin">
                                        Fecha fin
                                    </Label>
                                        <Input
                                            id="fecha_fin"
                                            type="date"
                                            value={filtros.fecha_fin}
                                            onChange={(e) =>
                                                setFiltro('fecha_fin', e.target.value)
                                            }
                                        />
                                </div>

                                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Label>Accesos rápidos</Label>
                                    <div className="flex h-9 flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={hoy}
                                            className="gap-1"
                                        >
                                            <CalendarDays className="size-3.5" />
                                            Hoy
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={esteMes}
                                            className="gap-1"
                                        >
                                            <CalendarDays className="size-3.5" />
                                            Este mes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={mesAnterior}
                                            className="gap-1"
                                        >
                                            <CalendarDays className="size-3.5" />
                                            Mes anterior
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                                <Button
                                    type="submit"
                                    className="gap-2 bg-[#0b145f] hover:bg-[#0d1557]"
                                >
                                    <CalendarDays className="size-4" />
                                    Aplicar
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

                {/* Tarjetas de Arqueo General */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Total Recaudado (Ingresos)
                            </CardTitle>
                            <ArrowUpRight className="size-5 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {formatCurrency(totalIngresos)}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Cobrado a través de matrículas, cuotas y pagos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-rose-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Total Egresos Registrados
                            </CardTitle>
                            <ArrowDownLeft className="size-5 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {formatCurrency(totalEgresos)}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Gastos y salidas de caja de la institución
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#0b145f] shadow-sm sm:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                Saldo Disponible en Caja
                            </CardTitle>
                            <Wallet className="size-5 text-[#0b145f]" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${saldoDisponible >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                            >
                                {formatCurrency(saldoDisponible)}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Ingresos Totales - Egresos Totales
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Desglose de Ingresos por Concepto */}
                <div>
                    <h2 className="mb-3 text-lg font-semibold text-[#0b145f]">
                        Consolidado de Ingresos por Concepto
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-blue-900">
                                    <Building2 className="size-4 text-blue-600" />
                                    Matrículas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-blue-950">
                                    {formatCurrency(
                                        ingresosPorConcepto.MATRICULA || 0,
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-amber-200 bg-amber-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-amber-900">
                                    <FileSpreadsheet className="size-4 text-amber-600" />
                                    Simulacros
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-amber-950">
                                    {formatCurrency(
                                        ingresosPorConcepto.SIMULACRO || 0,
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-purple-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-purple-900">
                                    <CreditCard className="size-4 text-purple-600" />
                                    Carnets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-purple-950">
                                    {formatCurrency(
                                        ingresosPorConcepto.CARNET || 0,
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 bg-slate-50/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-slate-900">
                                    <Receipt className="size-4 text-slate-600" />
                                    Extraordinarios
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-slate-950">
                                    {formatCurrency(
                                        ingresosPorConcepto.EXTRAORDINARIO || 0,
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tablas: Egresos e Ingresos del Período */}
                <div className="space-y-6">
                    {/* Lista de Egresos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#0b145f]">
                                Registro de Egresos y Salidas de Dinero
                            </CardTitle>
                            <CardDescription>
                                Listado detallado de gastos realizados por la
                                institución
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Filtros específicos de la tabla de Egresos */}
                            <form
                                onSubmit={aplicarFiltros}
                                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
                            >
                                <p className="mb-3 text-sm font-semibold text-[#0b145f]">
                                    Filtros de Egresos
                                </p>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label htmlFor="search_egreso">
                                            Buscar
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                                                <Input
                                                    id="search_egreso"
                                                    type="text"
                                                    placeholder="Concepto, descripción o usuario..."
                                                    value={filtros.search_egreso}
                                                    onChange={(e) =>
                                                        setFiltro(
                                                            'search_egreso',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pl-8"
                                                />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="categoria_egreso">
                                            Categoría de egreso
                                        </Label>
                                            <Select
                                                value={filtros.categoria_egreso || 'all'}
                                                onValueChange={(val) =>
                                                    setFiltro(
                                                        'categoria_egreso',
                                                        val === 'all' ? '' : val,
                                                    )
                                                }
                                            >
                                            <SelectTrigger id="categoria_egreso">
                                                <SelectValue placeholder="Todas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Todas
                                                </SelectItem>
                                                {categoriasEgresoDisponibles.map(
                                                    (c, index) => (
                                                        <SelectItem
                                                            key={`egreso-${index}-${c}`}
                                                            value={c}
                                                        >
                                                            {c}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="usuario_egreso">
                                            Usuario
                                        </Label>
                                            <Select
                                                value={filtros.usuario_egreso || 'all'}
                                                onValueChange={(val) =>
                                                    setFiltro(
                                                        'usuario_egreso',
                                                        val === 'all' ? '' : val,
                                                    )
                                                }
                                            >
                                            <SelectTrigger id="usuario_egreso">
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Todos
                                                </SelectItem>
                                                {(usuarios ?? []).map((u) => (
                                                    <SelectItem
                                                        key={u.id}
                                                        value={String(u.id)}
                                                    >
                                                        {u.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-3">
                                    <Button
                                        type="submit"
                                        className="gap-2 bg-[#0b145f] hover:bg-[#0d1557]"
                                    >
                                        <CalendarDays className="size-4" />
                                        Aplicar
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

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                                        <tr>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">
                                                Concepto / Descripción
                                            </th>
                                            <th className="p-3">Categoría</th>
                                            <th className="p-3 text-right">
                                                Cant. x Precio
                                            </th>
                                            <th className="p-3 text-right">
                                                Total
                                            </th>
                                            <th className="p-3 text-center">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {egresos.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="p-6 text-center text-slate-500"
                                                >
                                                    No hay egresos registrados.
                                                </td>
                                            </tr>
                                        ) : (
                                            egresos.data.map((egreso) => (
                                                <tr
                                                    key={egreso.id_egreso}
                                                    className="hover:bg-slate-50/50"
                                                >
                                                    <td className="p-3 whitespace-nowrap text-slate-600">
                                                        {formatDate(egreso.fecha)}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="flex items-center gap-2">
                                                            <span className="block font-semibold text-slate-900">
                                                                {
                                                                    egreso.concepto
                                                                }
                                                            </span>
                                                            {egreso.estado ===
                                                                'ANULADO' && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-red-100 text-red-700"
                                                                >
                                                                    ANULADO
                                                                </Badge>
                                                            )}
                                                        </span>
                                                        {egreso.descripcion && (
                                                            <span className="block text-xs text-slate-500">
                                                                {
                                                                    egreso.descripcion
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge
                                                            variant="outline"
                                                            className={categoriaBadgeClass(
                                                                egreso.categoria,
                                                            )}
                                                        >
                                                            {egreso.categoria}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-right whitespace-nowrap text-slate-600">
                                                        {egreso.cantidad} x S/{' '}
                                                        {Number(
                                                            egreso.precio,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-right font-bold whitespace-nowrap text-rose-600">
                                                        -{' '}
                                                        {formatCurrency(
                                                            egreso.total,
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <AnularEgresoDialog
                                                            egreso={egreso}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ingresos del Período (Pagos) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#0b145f]">
                                Ingresos del Período
                            </CardTitle>
                            <CardDescription>
                                Recaudaciones registradas en el rango de
                                fechas seleccionado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Filtros específicos de la tabla de Ingresos */}
                            <form
                                onSubmit={aplicarFiltros}
                                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
                            >
                                <p className="mb-3 text-sm font-semibold text-[#0b145f]">
                                    Filtros de Ingresos
                                </p>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2 lg:col-span-2">
                                        <Label htmlFor="search_ingreso">
                                            Buscar
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                                                <Input
                                                    id="search_ingreso"
                                                    type="text"
                                                    placeholder="Alumno, DNI, concepto, descripción o usuario..."
                                                    value={filtros.search_ingreso}
                                                    onChange={(e) =>
                                                        setFiltro(
                                                            'search_ingreso',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pl-8"
                                                />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="concepto">
                                            Concepto
                                        </Label>
                                            <Select
                                                value={filtros.concepto || 'all'}
                                                onValueChange={(val) =>
                                                    setFiltro(
                                                        'concepto',
                                                        val === 'all' ? '' : val,
                                                    )
                                                }
                                            >
                                            <SelectTrigger id="concepto">
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Todos
                                                </SelectItem>
                                                {(conceptos ?? []).map((c, index) => (
                                                    <SelectItem
                                                        key={`concepto-${index}-${c}`}
                                                        value={c}
                                                    >
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="categoria_ingreso">
                                            Categoría de ingreso
                                        </Label>
                                            <Select
                                                value={filtros.categoria_ingreso || 'all'}
                                                onValueChange={(val) =>
                                                    setFiltro(
                                                        'categoria_ingreso',
                                                        val === 'all' ? '' : val,
                                                    )
                                                }
                                            >
                                            <SelectTrigger id="categoria_ingreso">
                                                <SelectValue placeholder="Todas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Todas
                                                </SelectItem>
                                                {categoriasIngresoDisponibles.map(
                                                    (c, index) => (
                                                        <SelectItem
                                                            key={`ingreso-${index}-${c}`}
                                                            value={c}
                                                        >
                                                            {c}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="metodo_pago">
                                            Método de pago
                                        </Label>
                                            <Select
                                                value={filtros.metodo_pago || 'all'}
                                                onValueChange={(val) =>
                                                    setFiltro(
                                                        'metodo_pago',
                                                        val === 'all' ? '' : val,
                                                    )
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
                                        <Label htmlFor="usuario_ingreso">
                                            Usuario
                                        </Label>
                                            <Select
                                                value={filtros.usuario_ingreso || 'all'}
                                                onValueChange={(val) =>
                                                    setFiltro(
                                                        'usuario_ingreso',
                                                        val === 'all' ? '' : val,
                                                    )
                                                }
                                            >
                                            <SelectTrigger id="usuario_ingreso">
                                                <SelectValue placeholder="Todos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Todos
                                                </SelectItem>
                                                {(usuarios ?? []).map((u) => (
                                                    <SelectItem
                                                        key={u.id}
                                                        value={String(u.id)}
                                                    >
                                                        {u.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-3">
                                    <Button
                                        type="submit"
                                        className="gap-2 bg-[#0b145f] hover:bg-[#0d1557]"
                                    >
                                        <CalendarDays className="size-4" />
                                        Aplicar
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

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                                        <tr>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Concepto</th>
                                            <th className="p-3">
                                                Categoría
                                            </th>
                                            <th className="p-3">
                                                Detalle / Alumno
                                            </th>
                                            <th className="p-3">
                                                Método de Pago
                                            </th>
                                            <th className="p-3 text-right">
                                                Monto
                                            </th>
                                            <th className="p-3">Usuario</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pagos.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="p-6 text-center text-slate-500"
                                                >
                                                    No hay ingresos
                                                    registrados en el
                                                    período.
                                                </td>
                                            </tr>
                                        ) : (
                                            pagos.data.map((pago) => {
                                                const comprobante =
                                                    pago.cuota
                                                        ?.comprobante_pago;
                                                const alumno =
                                                    comprobante?.matricula
                                                        ?.alumno;
                                                const detalle = alumno
                                                    ? `${alumno.nombres} ${alumno.apellidos}`
                                                    : 'Ingreso General';
                                                const concepto =
                                                    comprobante?.concepto ??
                                                    '—';
                                                const categoria =
                                                    comprobante?.categoria ??
                                                    '—';

                                                return (
                                                    <tr
                                                        key={pago.id_pago}
                                                        className="hover:bg-slate-50/50"
                                                    >
                                                        <td className="p-3 whitespace-nowrap text-slate-600">
                                                            {formatDate(
                                                                pago.fecha_pago,
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-emerald-50 text-emerald-700"
                                                            >
                                                                {concepto}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-slate-700">
                                                            {categoria}
                                                        </td>
                                                        <td className="p-3 text-slate-900">
                                                            {detalle}
                                                        </td>
                                                        <td className="p-3 whitespace-nowrap text-slate-600">
                                                            {
                                                                pago.metodo_pago
                                                            }
                                                        </td>
                                                        <td className="p-3 text-right font-bold whitespace-nowrap text-emerald-600">
                                                            +{' '}
                                                            {formatCurrency(
                                                                pago.monto,
                                                            )}
                                                        </td>
                                                        <td className="p-3 whitespace-nowrap text-slate-600">
                                                            {pago.user?.name ??
                                                                '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación de ingresos (preserva filtros de fecha) */}
                            {pagos.last_page > 1 && (
                                <div className="mt-6 flex flex-col items-center gap-3">
                                    <p className="text-xs text-slate-400">
                                        Mostrando {pagos.from ?? 0}–
                                        {pagos.to ?? 0} de {pagos.total}{' '}
                                        ingresos
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={
                                                pagos.current_page === 1
                                            }
                                            onClick={() =>
                                                irAPaginaIngresos(
                                                    pagos.current_page - 1,
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            Anterior
                                        </Button>
                                        {Array.from(
                                            { length: pagos.last_page },
                                            (_, i) => i + 1,
                                        ).map((page) => {
                                            const isActive =
                                                page === pagos.current_page;
                                            const show =
                                                page === 1 ||
                                                page === pagos.last_page ||
                                                Math.abs(
                                                    page - pagos.current_page,
                                                ) <= 2;

                                            if (!show) {
                                                if (
                                                    page === 2 ||
                                                    page ===
                                                        pagos.last_page - 1
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
                                                        irAPaginaIngresos(
                                                            page,
                                                        )
                                                    }
                                                    className={cn(
                                                        'min-w-[36px] cursor-pointer',
                                                        isActive &&
                                                            'bg-[#0b145f] hover:bg-[#0d1557]',
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
                                                pagos.current_page ===
                                                pagos.last_page
                                            }
                                            onClick={() =>
                                                irAPaginaIngresos(
                                                    pagos.current_page + 1,
                                                )
                                            }
                                            className="cursor-pointer"
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal para Registrar Egreso */}
            <Dialog
                open={isEgresoModalOpen}
                onOpenChange={setIsEgresoModalOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0b145f]">
                            Registrar Egreso / Salida de Dinero
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCreateEgreso} className="space-y-4">
                        <div>
                            <Label htmlFor="concepto">Concepto de Egreso</Label>
                            <Input
                                id="concepto"
                                placeholder="Ej: Servicio de Luz, Pago de Fotocopias, Mantenimiento"
                                value={data.concepto}
                                onChange={(e) =>
                                    setData('concepto', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.concepto} />
                        </div>

                        <div>
                            <Label htmlFor="categoria">Categoría</Label>
                            <Select
                                value={data.categoria}
                                onValueChange={(val) =>
                                    setData('categoria', val)
                                }
                            >
                                <SelectTrigger
                                    id="categoria"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoriasEgresoDisponibles.map(
                                        (categoria, index) => (
                                            <SelectItem
                                                key={`modal-${index}-${categoria}`}
                                                value={categoria}
                                            >
                                                {categoria}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.categoria} />
                        </div>

                        <div>
                            <Label htmlFor="descripcion">
                                Descripción (Opcional)
                            </Label>
                            <Input
                                id="descripcion"
                                placeholder="Detalle adicional del gasto"
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                            />
                            <InputError message={errors.descripcion} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="cantidad">Cantidad</Label>
                                <Input
                                    id="cantidad"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.cantidad}
                                    onChange={(e) =>
                                        setData('cantidad', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.cantidad} />
                            </div>

                            <div>
                                <Label htmlFor="precio">
                                    Precio Unitario / Costo
                                </Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.precio}
                                    onChange={(e) =>
                                        setData('precio', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.precio} />
                            </div>
                        </div>

                        {/* IGV Configuration & Summary */}
                        <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="aplica_igv"
                                    checked={data.aplica_igv}
                                    onCheckedChange={(checked) => setData('aplica_igv', checked === true)}
                                />
                                <Label htmlFor="aplica_igv" className="text-sm font-medium text-slate-900 cursor-pointer">
                                    Aplica IGV
                                </Label>
                            </div>

                            {data.aplica_igv && (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <Label htmlFor="igv_porcentaje">Porcentaje IGV (%)</Label>
                                        <Input
                                            id="igv_porcentaje"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={data.igv_porcentaje}
                                            onChange={(e) => setData('igv_porcentaje', e.target.value)}
                                        />
                                        <InputError message={errors.igv_porcentaje} />
                                    </div>

                                    <div>
                                        <Label htmlFor="igv_tipo">Tipo IGV</Label>
                                        <Select
                                            value={data.igv_tipo}
                                            onValueChange={(val) => setData('igv_tipo', val as 'ANTES' | 'DESPUES')}
                                        >
                                            <SelectTrigger id="igv_tipo" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ANTES">No incluido (Antes de IGV)</SelectItem>
                                                <SelectItem value="DESPUES">Incluido (Después de IGV)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.igv_tipo} />
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 rounded border bg-white p-3 text-xs space-y-1 text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(subtotalCalc)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IGV ({data.aplica_igv ? data.igv_porcentaje : '0'}%):</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(igvCalc)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 text-sm font-bold text-[#0b145f]">
                                    <span>Total Final:</span>
                                    <span>{formatCurrency(totalCalc)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="fecha">Fecha de Egreso</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={data.fecha}
                                onChange={(e) =>
                                    setData('fecha', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.fecha} />
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEgresoModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#ff7043] text-white hover:bg-[#f4511e]"
                            >
                                Guardar Egreso
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
