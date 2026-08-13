import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Building2,
    CreditCard,
    FileSpreadsheet,
    Plus,
    Receipt,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { AnularEgresoDialog } from '@/components/pagos/AnularEgresoDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

const CATEGORIAS_EGRESO_FALLBACK = [
    'OPERATIVO',
    'ADMINISTRATIVO',
    'MANTENIMIENTO',
    'SERVICIOS',
    'ACADEMICO',
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
    if (!dateStr) return '—';
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

type PagoReciente = {
    id_pago: number;
    monto: string | number;
    fecha_pago: string;
    metodo_pago: string;
    user?: { name: string };
    cuota?: {
        comprobante_pago?: {
            concepto: string;
            matricula?: {
                alumno?: {
                    nombres: string;
                    apellidos: string;
                };
            };
        };
    };
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
    pagosRecientes: PagoReciente[];
    categoriasEgreso?: CategoriaEgresoItem[];
    igv_porcentaje_defecto?: string;
    filters: {
        fecha_inicio: string;
        fecha_fin: string;
    };
};

export default function CajaGeneralIndex({
    ingresosPorConcepto,
    totalIngresos,
    totalEgresos,
    saldoDisponible,
    egresos,
    pagosRecientes,
    categoriasEgreso,
    igv_porcentaje_defecto,
}: PageProps) {
    const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);

    // Categorías dinámicas del mantenedor con fallback al catálogo fijo.
    const categoriasEgresoDisponibles =
        categoriasEgreso && categoriasEgreso.length > 0
            ? categoriasEgreso.map((c) => c.nombre)
            : [...CATEGORIAS_EGRESO_FALLBACK];

    const categoriaEgresoPorDefecto =
        categoriasEgreso?.find((c) => c.es_por_defecto)?.nombre ?? 'OPERATIVO';

    const defaultIgvPercent = igv_porcentaje_defecto ? Number(igv_porcentaje_defecto) : 18.00;

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

                {/* Tablas: Egresos y Pagos Recientes */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Lista de Egresos */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#0b145f]">
                                Registro de Egresos y Salidas de Dinero
                            </CardTitle>
                            <CardDescription>
                                Listado detallado de gastos realizados por la
                                institución
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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

                    {/* Pagos Recientes (Ingresos) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#0b145f]">
                                Últimos Ingresos
                            </CardTitle>
                            <CardDescription>
                                Recaudaciones recientes registradas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pagosRecientes.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-slate-500">
                                        No hay pagos recientes.
                                    </p>
                                ) : (
                                    pagosRecientes.map((pago) => {
                                        const alumno =
                                            pago.cuota?.comprobante_pago
                                                ?.matricula?.alumno;
                                        const concepto =
                                            pago.cuota?.comprobante_pago
                                                ?.concepto || 'PAGO';

                                        return (
                                            <div
                                                key={pago.id_pago}
                                                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="truncate text-xs font-semibold text-slate-900">
                                                        {alumno
                                                            ? `${alumno.nombres} ${alumno.apellidos}`
                                                            : 'Ingreso General'}
                                                    </p>
                                                    <div className="mt-0.5 flex items-center gap-1.5">
                                                        <Badge
                                                            variant="outline"
                                                            className="px-1 py-0 text-[10px]"
                                                        >
                                                            {concepto}
                                                        </Badge>
                                                         <span className="text-[11px] text-slate-400">
                                                             {formatDate(pago.fecha_pago)}
                                                         </span>
                                                    </div>
                                                </div>

                                                <span className="text-sm font-bold whitespace-nowrap text-emerald-600">
                                                    +{' '}
                                                    {formatCurrency(pago.monto)}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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
                                        (categoria) => (
                                            <SelectItem
                                                key={categoria}
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
