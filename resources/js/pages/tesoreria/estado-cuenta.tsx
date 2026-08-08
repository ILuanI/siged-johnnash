import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    exonerar as exonerarCuota,
    index as tesoreriaIndex,
    prorrogar as tesoreriaProrrogar,
} from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { ComprobantePago } from '@/components/pagos/ComprobantePago';
import type { ComprobanteCuotaItem } from '@/components/pagos/ComprobantePago';
import {
    AuditoriaExoneracionTooltip,
    type AuditoriaCuotaItem,
} from '@/components/pagos/AuditoriaExoneracionTooltip';
import { PagoRow } from '@/components/pagos/PagoRow';
import { SemaforoPagos } from '@/components/pagos/SemaforoPagos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePermisos } from '@/hooks/use-permisos';

function formatCurrency(amount: string | number) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(Number(amount));
}

function parseDate(dateStr: string) {
    const [y, m, d] = dateStr.split('T')[0].split('-');

    return new Date(Number(y), Number(m) - 1, Number(d));
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

const CONCEPTO_BADGE: Record<string, string> = {
    MATRICULA: 'bg-orange-100 text-orange-700 border-orange-200',
    SIMULACRO: 'bg-blue-100 text-blue-700 border-blue-200',
    CARNET: 'bg-purple-100 text-purple-700 border-purple-200',
    EXTRAORDINARIO: 'bg-gray-100 text-gray-700 border-gray-200',
};

const CONCEPTO_LABEL: Record<string, string> = {
    MATRICULA: 'Matrícula',
    SIMULACRO: 'Simulacro',
    CARNET: 'Carnet',
    EXTRAORDINARIO: 'Extraordinario',
};

function CuotaItem({
    cuota,
    isSelected,
    montoPagar,
    onAdd,
    onRemove,
    onAmountChange,
}: {
    cuota: any;
    isSelected: boolean;
    montoPagar: number;
    onAdd: () => void;
    onRemove: () => void;
    onAmountChange: (amount: number) => void;
}) {
    const [openProrroga, setOpenProrroga] = useState(false);
    const [diasProrroga, setDiasProrroga] = useState('7');
    const [processing, setProcessing] = useState(false);
    const [openExonerar, setOpenExonerar] = useState(false);
    const [motivoExonerar, setMotivoExonerar] = useState('');
    const [processingExonerar, setProcessingExonerar] = useState(false);
    const { puede } = usePermisos();
    const puedeExonerar = puede('pagos', 'eliminar');

    const handleProrroga = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            tesoreriaProrrogar.url({ cuota: cuota.id_cuota }),
            { dias: diasProrroga },
            {
                onSuccess: () => {
                    setOpenProrroga(false);
                    toast.success('Fecha de vencimiento prorrogada');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleExonerar = () => {
        setProcessingExonerar(true);
        router.post(
            exonerarCuota.url({ cuota: cuota.id_cuota }),
            { motivo: motivoExonerar },
            {
                onSuccess: () => {
                    setOpenExonerar(false);
                    setMotivoExonerar('');
                    toast.success('Cuota exonerada correctamente');
                },
                onError: () => {
                    toast.error('No se pudo exonerar la cuota');
                },
                onFinish: () => setProcessingExonerar(false),
            },
        );
    };

    const isPagada = cuota.estado === 'PAGADA';
    const esExonerada = cuota.estado === 'EXONERADA';
    const noAccionable = isPagada || esExonerada;
    const totalPagado =
        cuota.pagos?.reduce(
            (sum: number, p: any) => sum + Number(p.monto),
            0,
        ) || 0;
    const restante = Math.max(0, Number(cuota.monto) - totalPagado);

    return (
        <div
            className={`flex items-center justify-between border-b py-3 last:border-0 ${
                isSelected ? 'bg-orange-50' : ''
            }`}
        >
            <div>
                <p className="font-semibold text-slate-800">
                    Cuota {cuota.numero_cuota}
                    {cuota.concepto && (
                        <span
                            className={`ml-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                CONCEPTO_BADGE[cuota.concepto] ??
                                'border-gray-200 bg-gray-100 text-gray-700'
                            }`}
                        >
                            {CONCEPTO_LABEL[cuota.concepto] ?? cuota.concepto}
                        </span>
                    )}
                </p>
                <p className="text-sm text-slate-500">
                    Vence: {formatDate(parseDate(cuota.fecha_vencimiento))}
                </p>
                {totalPagado > 0 && (
                    <div className="mt-1 text-xs text-slate-400">
                        Abonado: {formatCurrency(totalPagado)}
                    </div>
                )}
                {cuota.pagos?.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {cuota.pagos.map((p: any) => (
                            <PagoRow key={p.id_pago} pago={p} />
                        ))}
                    </div>
                )}
                {isSelected && (
                    <div className="mt-2 flex items-center gap-2">
                        <Label className="text-xs text-slate-500">
                            A pagar:
                        </Label>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">S/</span>
                            <Input
                                type="number"
                                min="0.01"
                                max={restante}
                                step="0.01"
                                value={montoPagar}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    onAmountChange(Math.min(val, restante));
                                }}
                                className="h-7 w-24 border-0 border-b border-dotted border-slate-400 bg-transparent px-1 py-0 text-xs font-semibold text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="font-bold text-slate-900">
                        {formatCurrency(restante > 0 ? restante : cuota.monto)}
                    </p>
                    <div className="flex items-center justify-end">
                        <Badge
                            variant="outline"
                            className={
                                isPagada
                                    ? 'bg-green-100 text-green-700'
                                    : cuota.estado === 'VENCIDA'
                                      ? 'bg-red-100 text-red-700'
                                      : esExonerada
                                        ? 'bg-violet-100 text-violet-700'
                                        : 'bg-yellow-100 text-yellow-700'
                            }
                        >
                            {cuota.estado}
                        </Badge>
                        {esExonerada && (
                            <AuditoriaExoneracionTooltip
                                auditorias={cuota.auditorias}
                            />
                        )}
                    </div>
                </div>

                {!noAccionable && (
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant={isSelected ? 'destructive' : 'default'}
                            onClick={isSelected ? onRemove : onAdd}
                            className={
                                isSelected
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-[#4caf50] hover:bg-[#43a047]'
                            }
                        >
                            {isSelected ? (
                                <>
                                    <Minus className="mr-1 h-3 w-3" /> Quitar
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-1 h-3 w-3" /> Agregar
                                </>
                            )}
                        </Button>

                        {puedeExonerar && (
                            <Dialog
                                open={openExonerar}
                                onOpenChange={setOpenExonerar}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                                    >
                                        Exonerar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Exonerar Cuota
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600">
                                            ¿Estás seguro de que deseas exonerar
                                            la cuota{' '}
                                            <strong>
                                                {cuota.numero_cuota}
                                            </strong>{' '}
                                            de{' '}
                                            <strong>
                                                {formatCurrency(cuota.monto)}
                                            </strong>
                                            ? Esta acción no se puede deshacer.
                                        </p>
                                        <div className="space-y-2">
                                            <Label htmlFor="motivo-exoneracion">
                                                Motivo de exoneración
                                            </Label>
                                            <Textarea
                                                id="motivo-exoneracion"
                                                value={motivoExonerar}
                                                onChange={(e) =>
                                                    setMotivoExonerar(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Indica el motivo de la exoneración (obligatorio)"
                                                maxLength={500}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setOpenExonerar(false)
                                                }
                                                disabled={processingExonerar}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="default"
                                                className="bg-violet-600 hover:bg-violet-700"
                                                onClick={handleExonerar}
                                                disabled={
                                                    processingExonerar ||
                                                    !motivoExonerar.trim()
                                                }
                                            >
                                                {processingExonerar
                                                    ? 'Exonerando...'
                                                    : 'Sí, exonerar cuota'}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Dialog
                            open={openProrroga}
                            onOpenChange={setOpenProrroga}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    Prorrogar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Prorrogar Fecha de Vencimiento
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handleProrroga}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label>
                                            Días de Prórroga Adicionales
                                        </Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={diasProrroga}
                                            onChange={(e) =>
                                                setDiasProrroga(e.target.value)
                                            }
                                            required
                                        />
                                        <p className="text-xs text-slate-500">
                                            La nueva fecha será{' '}
                                            {diasProrroga &&
                                            !isNaN(Number(diasProrroga))
                                                ? (() => {
                                                      const d = parseDate(
                                                          cuota.fecha_vencimiento,
                                                      );
                                                      d.setDate(
                                                          d.getDate() +
                                                              Number(
                                                                  diasProrroga,
                                                              ),
                                                      );

                                                      return formatDate(d);
                                                  })()
                                                : '...'}
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        Confirmar Prórroga
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EstadoCuentaShow({ alumno }: any) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [selectedAmounts, setSelectedAmounts] = useState<
        Record<number, number>
    >({});
    const lastMatricula = alumno.matriculas?.[0];
    const comprobantes = lastMatricula?.comprobantes_pago || [];
    const cuotas: (ComprobanteCuotaItem & { estado: string })[] =
        comprobantes.flatMap((c: any) =>
            (c.cuotas || []).map((cu: any) => ({
                ...cu,
                concepto: c.concepto,
                comprobante_numero: c.numero,
            })),
        );
    const costoTotal = comprobantes.reduce(
        (sum: number, c: any) => sum + Number(c.costo_total),
        0,
    );
    const saldoPendiente = comprobantes.reduce(
        (sum: number, c: any) => sum + Number(c.saldo_pendiente),
        0,
    );

    const selectedCuotas = cuotas.filter((c) => selectedIds.has(c.id_cuota));

    const toggleCuota = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
                setSelectedAmounts((prev) => {
                    const next2 = { ...prev };
                    delete next2[id];

                    return next2;
                });
            } else {
                next.add(id);
                const cuota = cuotas.find((c) => c.id_cuota === id);

                if (cuota) {
                    const totalPagado =
                        cuota.pagos?.reduce(
                            (sum: number, p: any) => sum + Number(p.monto),
                            0,
                        ) || 0;
                    const restante = Math.max(
                        0,
                        Number(cuota.monto) - totalPagado,
                    );
                    setSelectedAmounts((prev) => ({ ...prev, [id]: restante }));
                }
            }

            return next;
        });
    };

    const handleAmountChange = (id: number, amount: number) => {
        setSelectedAmounts((prev) => ({ ...prev, [id]: amount }));
    };

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-8">
            <Head title={`Estado de Cuenta - ${alumno.nombres}`} />

            <div className="mb-4">
                <Link
                    href={tesoreriaIndex.url()}
                    className="mb-3 flex items-center text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Volver a Tesorería
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Estado de Cuenta
                        </h1>
                        <p className="text-slate-500">
                            {alumno.nombres} {alumno.apellidos}
                            {alumno.dni ? ` · DNI: ${alumno.dni}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {cuotas.length > 0 && (
                            <SemaforoPagos
                                cuotas={cuotas}
                                className="px-3 py-1 text-sm"
                            />
                        )}
                    </div>
                </div>
            </div>

            {comprobantes.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <ComprobantePago
                            selectedCuotas={selectedCuotas}
                            amounts={selectedAmounts}
                            onClear={() => {
                                setSelectedIds(new Set());
                                setSelectedAmounts({});
                            }}
                            alumno={alumno}
                            cicloNombre={lastMatricula?.ciclo?.nombre}
                            modalidad={lastMatricula?.modalidad}
                            tipoPago={lastMatricula?.tipo_pago}
                            fechaMatricula={lastMatricula?.fecha_matricula}
                        />
                    </div>

                    <div className="space-y-4 lg:col-span-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-slate-500 uppercase">
                                        Costo Total
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold">
                                        {formatCurrency(costoTotal)}
                                    </div>
                                    <p className="mt-1 text-[10px] text-slate-400">
                                        Matrícula {lastMatricula?.ciclo?.nombre}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-slate-500 uppercase">
                                        Saldo Pendiente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-slate-900">
                                        {formatCurrency(saldoPendiente)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-slate-500 uppercase">
                                        Estado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge
                                        variant={
                                            saldoPendiente <= 0
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {saldoPendiente <= 0
                                            ? 'PAGADO COMPLETAMENTE'
                                            : 'CON DEUDA'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Plan de Cuotas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {cuotas.length > 0 ? (
                                    <div className="divide-y">
                                        {cuotas.map((cuota: any) => (
                                            <CuotaItem
                                                key={cuota.id_cuota}
                                                cuota={cuota}
                                                isSelected={selectedIds.has(
                                                    cuota.id_cuota,
                                                )}
                                                montoPagar={
                                                    selectedAmounts[
                                                        cuota.id_cuota
                                                    ] ??
                                                    (() => {
                                                        const totalPagado =
                                                            cuota.pagos?.reduce(
                                                                (
                                                                    sum: number,
                                                                    p: any,
                                                                ) =>
                                                                    sum +
                                                                    Number(
                                                                        p.monto,
                                                                    ),
                                                                0,
                                                            ) || 0;

                                                        return Math.max(
                                                            0,
                                                            Number(
                                                                cuota.monto,
                                                            ) - totalPagado,
                                                        );
                                                    })()
                                                }
                                                onAmountChange={(amount) =>
                                                    handleAmountChange(
                                                        cuota.id_cuota,
                                                        amount,
                                                    )
                                                }
                                                onAdd={() =>
                                                    toggleCuota(cuota.id_cuota)
                                                }
                                                onRemove={() =>
                                                    toggleCuota(cuota.id_cuota)
                                                }
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-sm text-slate-500">
                                        No se generaron cuotas para esta
                                        matrícula.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center text-slate-500">
                        No hay comprobantes ni plan de pago registrado para la
                        matrícula actual de este alumno.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
