import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Banknote,
    Building2,
    CreditCard,
    DollarSign,
    FileSpreadsheet,
    Plus,
    Receipt,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { confirmAction } from '@/lib/confirm';

function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(Number(amount));
}

type Egreso = {
    id_egreso: number;
    concepto: string;
    descripcion: string | null;
    cantidad: number;
    precio: number;
    igv: number;
    total: number;
    fecha: string;
    user?: {
        id: number;
        name: string;
    };
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
}: PageProps) {
    const [isEgresoModalOpen, setIsEgresoModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        concepto: '',
        descripcion: '',
        cantidad: '1',
        precio: '',
        igv: '0',
        fecha: new Date().toISOString().split('T')[0],
    });

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

    const handleDeleteEgreso = async (egreso: Egreso) => {
        const confirmed = await confirmAction({
            title: 'Eliminar Egreso',
            text: `¿Estás seguro de eliminar el egreso de S/ ${egreso.total.toFixed(2)} por "${egreso.concepto}"?`,
            confirmButtonText: 'Sí, eliminar',
        });

        if (confirmed) {
            router.delete(`/tesoreria/egresos/${egreso.id_egreso}`, {
                onSuccess: () => toast.success('Egreso eliminado correctamente.'),
            });
        }
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
                            Arqueo de ingresos por concepto, egresos y movimiento económico general
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/tesoreria/estado-cuenta">
                            <Button variant="outline">
                                Ver Estado de Cuentas Alumnos
                            </Button>
                        </Link>

                        <Button
                            onClick={() => setIsEgresoModalOpen(true)}
                            className="bg-[#ff7043] hover:bg-[#f4511e] text-white gap-2"
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
                            <p className="text-xs text-slate-500 mt-1">
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
                            <p className="text-xs text-slate-500 mt-1">
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
                            <div className={`text-2xl font-bold ${saldoDisponible >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {formatCurrency(saldoDisponible)}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Ingresos Totales - Egresos Totales
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Desglose de Ingresos por Concepto */}
                <div>
                    <h2 className="text-lg font-semibold text-[#0b145f] mb-3">
                        Consolidado de Ingresos por Concepto
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-blue-50/50 border-blue-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                                    <Building2 className="size-4 text-blue-600" />
                                    Matrículas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-blue-950">
                                    {formatCurrency(ingresosPorConcepto.MATRICULA || 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-50/50 border-amber-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-amber-900 flex items-center gap-2">
                                    <FileSpreadsheet className="size-4 text-amber-600" />
                                    Simulacros
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-amber-950">
                                    {formatCurrency(ingresosPorConcepto.SIMULACRO || 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-purple-50/50 border-purple-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-purple-900 flex items-center gap-2">
                                    <CreditCard className="size-4 text-purple-600" />
                                    Carnets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-purple-950">
                                    {formatCurrency(ingresosPorConcepto.CARNET || 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-50/50 border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                                    <Receipt className="size-4 text-slate-600" />
                                    Extraordinarios
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-slate-950">
                                    {formatCurrency(ingresosPorConcepto.EXTRAORDINARIO || 0)}
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
                                Listado detallado de gastos realizados por la institución
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                                        <tr>
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Concepto / Descripción</th>
                                            <th className="p-3 text-right">Cant. x Precio</th>
                                            <th className="p-3 text-right">Total</th>
                                            <th className="p-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {egresos.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-slate-500">
                                                    No hay egresos registrados.
                                                </td>
                                            </tr>
                                        ) : (
                                            egresos.data.map((egreso) => (
                                                <tr key={egreso.id_egreso} className="hover:bg-slate-50/50">
                                                    <td className="p-3 whitespace-nowrap text-slate-600">
                                                        {egreso.fecha}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="font-semibold text-slate-900 block">
                                                            {egreso.concepto}
                                                        </span>
                                                        {egreso.descripcion && (
                                                            <span className="text-xs text-slate-500 block">
                                                                {egreso.descripcion}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right text-slate-600 whitespace-nowrap">
                                                        {egreso.cantidad} x S/ {Number(egreso.precio).toFixed(2)}
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-rose-600 whitespace-nowrap">
                                                        - {formatCurrency(egreso.total)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteEgreso(egreso)}
                                                            className="text-rose-600 hover:text-rose-800"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
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
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No hay pagos recientes.
                                    </p>
                                ) : (
                                    pagosRecientes.map((pago) => {
                                        const alumno = pago.cuota?.comprobante_pago?.matricula?.alumno;
                                        const concepto = pago.cuota?.comprobante_pago?.concepto || 'PAGO';

                                        return (
                                            <div
                                                key={pago.id_pago}
                                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                                            >
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-xs font-semibold text-slate-900 truncate">
                                                        {alumno ? `${alumno.nombres} ${alumno.apellidos}` : 'Ingreso General'}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                            {concepto}
                                                        </Badge>
                                                        <span className="text-[11px] text-slate-400">
                                                            {pago.fecha_pago}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">
                                                    + {formatCurrency(pago.monto)}
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
            <Dialog open={isEgresoModalOpen} onOpenChange={setIsEgresoModalOpen}>
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
                                onChange={(e) => setData('concepto', e.target.value)}
                                required
                            />
                            <InputError message={errors.concepto} />
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                            <Input
                                id="descripcion"
                                placeholder="Detalle adicional del gasto"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
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
                                    onChange={(e) => setData('cantidad', e.target.value)}
                                    required
                                />
                                <InputError message={errors.cantidad} />
                            </div>

                            <div>
                                <Label htmlFor="precio">Precio Unitario / Costo</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.precio}
                                    onChange={(e) => setData('precio', e.target.value)}
                                    required
                                />
                                <InputError message={errors.precio} />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="fecha">Fecha de Egreso</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={data.fecha}
                                onChange={(e) => setData('fecha', e.target.value)}
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
                                className="bg-[#ff7043] hover:bg-[#f4511e] text-white"
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
