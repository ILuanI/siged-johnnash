import { Head, router } from '@inertiajs/react';
import { Pencil, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    index as tesoreriaIndex,
    pagar as tesoreriaPagar,
    prorrogar as tesoreriaProrrogar,
    updateWhatsappTemplates as tesoreriaUpdateTemplates,
} from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { SemaforoPagos } from '@/components/pagos/SemaforoPagos';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { estadoBadgeClass, getPaymentStatus, getWhatsAppUrl } from '@/lib/matriculas';
import { cn } from '@/lib/utils';

const FILTROS_ESTADO = [
    { key: '', label: 'Todos', className: '' },
    {
        key: 'al_dia',
        label: 'Al día',
        className:
            'border-green-300 bg-green-50 text-green-700 hover:bg-green-100',
    },
    {
        key: 'proximo_a_vencer',
        label: 'Próximo a vencer',
        className:
            'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
    {
        key: 'vencido',
        label: 'Vencido',
        className: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100',
    },
    {
        key: 'sin_plan',
        label: 'Sin plan',
        className: 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100',
    },
];

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

function CuotaItem({ cuota }: { cuota: any }) {
    const [openPago, setOpenPago] = useState(false);
    const [openProrroga, setOpenProrroga] = useState(false);
    const [montoPago, setMontoPago] = useState(cuota.monto);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');
    const [diasProrroga, setDiasProrroga] = useState('7');
    const [processing, setProcessing] = useState(false);

    const handlePago = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            tesoreriaPagar.url({ cuota: cuota.id_cuota }),
            {
                monto: montoPago,
                metodo_pago: metodoPago,
            },
            {
                onSuccess: () => {
                    setOpenPago(false);
                    toast.success('Pago registrado correctamente');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleProrroga = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            tesoreriaProrrogar.url({ cuota: cuota.id_cuota }),
            {
                dias: diasProrroga,
            },
            {
                onSuccess: () => {
                    setOpenProrroga(false);
                    toast.success('Fecha de vencimiento prorrogada');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const isPagada = cuota.estado === 'PAGADA';
    const totalPagado =
        cuota.pagos?.reduce(
            (sum: number, p: any) => sum + Number(p.monto),
            0,
        ) || 0;
    const restante = Math.max(0, Number(cuota.monto) - totalPagado);

    return (
        <div className="flex items-center justify-between border-b py-4 last:border-0">
            <div>
                <p className="font-semibold text-slate-800">
                    Cuota {cuota.numero_cuota}
                </p>
                <p className="text-sm text-slate-500">
                    Vence: {formatDate(parseDate(cuota.fecha_vencimiento))}
                </p>
                {cuota.pagos && cuota.pagos.length > 0 && (
                    <div className="mt-1 text-xs text-slate-400">
                        Abonado: {formatCurrency(totalPagado)}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold text-slate-900">
                        {formatCurrency(cuota.monto)}
                    </p>
                    <Badge
                        variant="outline"
                        className={
                            isPagada
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : cuota.estado === 'VENCIDA'
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }
                    >
                        {cuota.estado}
                    </Badge>
                </div>

                {!isPagada && (
                    <div className="flex gap-2">
                        {/* PAGO MODAL */}
                        <Dialog open={openPago} onOpenChange={setOpenPago}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="bg-[#4caf50] hover:bg-[#43a047] cursor-pointer text-white"
                                >
                                    Pagar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Registrar Pago - Cuota{' '}
                                        {cuota.numero_cuota}
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handlePago}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label>
                                            Monto a Pagar (Restante:{' '}
                                            {formatCurrency(restante)})
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            max={restante}
                                            value={montoPago}
                                            onChange={(e) =>
                                                setMontoPago(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Método de Pago</Label>
                                        <Select
                                            value={metodoPago}
                                            onValueChange={setMetodoPago}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EFECTIVO">
                                                    Efectivo
                                                </SelectItem>
                                                <SelectItem value="TRANSFERENCIA">
                                                    Transferencia / Yape / Plin
                                                </SelectItem>
                                                <SelectItem value="TARJETA">
                                                    Tarjeta de Débito/Crédito
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#ff7043] hover:bg-[#f4511e]"
                                    >
                                        {processing
                                            ? 'Procesando...'
                                            : 'Confirmar Pago'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* PRORROGA MODAL */}
                        <Dialog
                            open={openProrroga}
                            onOpenChange={setOpenProrroga}
                        >
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="cursor-pointer">
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
                                        className="w-full bg-[#ff7043] hover:bg-[#f4511e]"
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

function ConfigWhatsAppDialog({ plantillas, open, onOpenChange }: {
    plantillas: { vencido: string; proximo_a_vencer: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [vencido, setVencido] = useState(plantillas.vencido);
    const [proximoVencer, setProximoVencer] = useState(plantillas.proximo_a_vencer);
    const [processing, setProcessing] = useState(false);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.put(
            tesoreriaUpdateTemplates.url(),
            { vencido, proximo_a_vencer: proximoVencer },
            {
                onSuccess: () => {
                    onOpenChange(false);
                    toast.success('Plantillas de WhatsApp actualizadas');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Plantillas de WhatsApp
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-red-600 font-semibold">Estado: VENCIDO</Label>
                        <textarea
                            value={vencido}
                            onChange={(e) => setVencido(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-[#1a237e]/20 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-yellow-600 font-semibold">Estado: PRÓXIMO A VENCER</Label>
                        <textarea
                            value={proximoVencer}
                            onChange={(e) => setProximoVencer(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-[#1a237e]/20 focus:outline-none"
                        />
                    </div>
                    <p className="text-xs text-slate-400">
                        Usa {'{nombre}'}, {'{apellidos}'} y {'{dni}'} como variables que se reemplazarán automáticamente.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} size="sm" className="bg-[#1a237e] hover:bg-[#0d1557]">
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function WhatsAppDialog({ estudiante, cuotas, plantillas, open, onOpenChange }: {
    estudiante: any;
    cuotas: any[];
    plantillas: { vencido: string; proximo_a_vencer: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const paymentStatus = getPaymentStatus(cuotas);
    const statusLabel = paymentStatus === 'vencido' ? 'VENCIDO' : 'PRÓXIMO A VENCER';
    const apoderado = estudiante.apoderado;

    const plantillaBase = paymentStatus === 'vencido' ? plantillas.vencido : plantillas.proximo_a_vencer;

    const [telefonoSeleccionado, setTelefonoSeleccionado] = useState(
        estudiante.telefono || apoderado?.telefono || '',
    );
    const [mensaje, setMensaje] = useState(
        plantillaBase.replace(/\{nombre\}/g, estudiante.nombres).replace(/\{apellidos\}/g, estudiante.apellidos).replace(/\{dni\}/g, estudiante.dni || ''),
    );

    const opcionesTelefono: { label: string; value: string }[] = [];
    if (estudiante.telefono) {
        opcionesTelefono.push({
            label: `Alumno: ${estudiante.telefono}`,
            value: estudiante.telefono,
        });
    }
    if (apoderado?.telefono) {
        opcionesTelefono.push({
            label: `Apoderado (${apoderado.nombres}): ${apoderado.telefono}`,
            value: apoderado.telefono,
        });
    }

    const handleEnviar = () => {
        const url = getWhatsAppUrl(telefonoSeleccionado, mensaje);
        if (url) {
            window.open(url, '_blank');
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Enviar WhatsApp
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-600">
                            <strong>Alumno:</strong> {estudiante.apellidos}, {estudiante.nombres}
                        </p>
                        <p className="text-sm text-slate-600">
                            <strong>Estado:</strong>{' '}
                            <span className={paymentStatus === 'vencido' ? 'font-semibold text-red-600' : 'font-semibold text-yellow-600'}>
                                {statusLabel}
                            </span>
                        </p>
                    </div>

                    {opcionesTelefono.length === 0 ? (
                        <p className="text-sm text-red-500">
                            Este alumno no tiene teléfono registrado ni apoderado con teléfono.
                        </p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label>Enviar a</Label>
                                <Select
                                    value={telefonoSeleccionado}
                                    onValueChange={setTelefonoSeleccionado}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {opcionesTelefono.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Mensaje personalizado</Label>
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    rows={5}
                                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-[#1a237e]/20 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#25D366] hover:bg-[#1ebe5c] text-white gap-2"
                                    onClick={handleEnviar}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Enviar WhatsApp
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function TesoreriaIndex({ alumnos, filters, whatsapp_templates }: any) {
    const getInitials = useInitials();
    const [busqueda, setBusqueda] = useState(filters.search ?? '');
    const [activeAlumnoId, setActiveAlumnoId] = useState<number | null>(null);
    const [whatsAppAlumno, setWhatsAppAlumno] = useState<any | null>(null);
    const [configWhatsAppOpen, setConfigWhatsAppOpen] = useState(false);
    const estadoActivo = filters.estado ?? '';
    const plantillas = whatsapp_templates ?? { vencido: '', proximo_a_vencer: '' };

    // Filtros ultra rápidos con debouncing en cliente
    useEffect(() => {
        const timer = setTimeout(() => {
            if (busqueda !== (filters.search ?? '')) {
                router.get(
                    tesoreriaIndex.url(),
                    {
                        search: busqueda || undefined,
                        estado: estadoActivo || undefined,
                    },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [busqueda]);

    const buscar = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            tesoreriaIndex.url(),
            {
                search: busqueda || undefined,
                estado: estadoActivo || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const cambiarFiltro = (estado: string) => {
        router.get(
            tesoreriaIndex.url(),
            {
                search: busqueda || undefined,
                estado: estado || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const activeAlumno = alumnos.data.find(
        (a: any) => a.id_alumno === activeAlumnoId
    );
    const lastMatricula = activeAlumno?.matriculas?.[0];
    const comprobante = lastMatricula?.comprobante_pago;
    const cuotas = comprobante?.cuotas || [];

    return (
        <>
            <Head title="Tesorería - Pagos y Deudas" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Estado Financiero de Estudiantes
                        </h1>
                        <p className="text-sm text-slate-500">
                            Monitor de deudas y pagos
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer gap-2"
                        onClick={() => setConfigWhatsAppOpen(true)}
                    >
                        <Pencil className="size-3.5" />
                        Plantillas WhatsApp
                    </Button>
                </div>

                <form onSubmit={buscar} className="relative mt-5 max-w-xl">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o DNI…"
                        className="border-slate-200 bg-slate-50 pl-10"
                    />
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                    {FILTROS_ESTADO.map((f) => {
                        const activo = estadoActivo === f.key;

                        return (
                            <button
                                key={f.key}
                                onClick={() => cambiarFiltro(f.key)}
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                                    activo
                                        ? f.className ||
                                              'border-slate-300 bg-slate-800 text-white hover:bg-slate-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                                )}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className="flex-1 px-8 py-6">
                {alumnos.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center">
                        <p className="text-slate-600">
                            No hay estudiantes que coincidan con la búsqueda.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {alumnos.data.map((estudiante: any) => {
                            const lastMatricula = estudiante.matriculas?.[0];
                            const cuotas =
                                lastMatricula?.comprobante_pago?.cuotas || [];

                            return (
                                <li key={estudiante.id_alumno}>
                                    <div className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left">
                                        <Avatar className="size-12">
                                            <AvatarFallback className="bg-[#1a237e]/10 text-[#1a237e]">
                                                {getInitials(
                                                    `${estudiante.nombres} ${estudiante.apellidos}`,
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-slate-900">
                                                {estudiante.apellidos},{' '}
                                                {estudiante.nombres}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {estudiante.dni
                                                    ? `DNI ${estudiante.dni}`
                                                    : 'Sin DNI'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    className={cn(
                                                        'shrink-0 rounded-full text-xs uppercase',
                                                        estadoBadgeClass(
                                                            estudiante.estado,
                                                        ),
                                                    )}
                                                >
                                                    {estudiante.estado}
                                                </Badge>
                                                {cuotas.length > 0 ? (
                                                    <SemaforoPagos
                                                        cuotas={cuotas}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Sin plan de pago
                                                    </span>
                                                )}
                                            </div>
                                            {['vencido', 'proximo_a_vencer'].includes(
                                                getPaymentStatus(cuotas),
                                            ) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10"
                                                    onClick={() => setWhatsAppAlumno(estudiante)}
                                                    title="Enviar WhatsApp"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                    </svg>
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer"
                                                onClick={() => setActiveAlumnoId(estudiante.id_alumno)}
                                            >
                                                Ver Cuenta
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Modal de Estado de Cuenta */}
            <Dialog
                open={activeAlumnoId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveAlumnoId(null);
                    }
                }}
            >
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Estado de Cuenta
                        </DialogTitle>
                    </DialogHeader>

                    {activeAlumno && (
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {activeAlumno.apellidos}, {activeAlumno.nombres}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {activeAlumno.dni ? `DNI: ${activeAlumno.dni}` : 'Sin DNI'}
                                    </p>
                                </div>
                                {cuotas.length > 0 && (
                                    <SemaforoPagos
                                        cuotas={cuotas}
                                        className="px-3 py-1 text-sm"
                                    />
                                )}
                            </div>

                            {comprobante ? (
                                <div className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xs font-semibold text-slate-400 uppercase">
                                                    Costo Total
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-xl font-bold">
                                                    {formatCurrency(comprobante.costo_total)}
                                                </div>
                                                <p className="mt-1 text-[10px] text-slate-400">
                                                    Matrícula {lastMatricula?.ciclo?.nombre}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xs font-semibold text-slate-400 uppercase">
                                                    Saldo Pendiente
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-xl font-bold text-slate-900">
                                                    {formatCurrency(comprobante.saldo_pendiente)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-xs font-semibold text-slate-400 uppercase">
                                                    Estado
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Badge
                                                    variant={
                                                        Number(comprobante.saldo_pendiente) === 0
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className={cn(
                                                        'rounded-full text-xs uppercase',
                                                        Number(comprobante.saldo_pendiente) === 0
                                                            ? 'bg-green-100 text-green-700 border-green-200'
                                                            : 'bg-red-100 text-red-700 border-red-200'
                                                    )}
                                                >
                                                    {Number(comprobante.saldo_pendiente) === 0
                                                        ? 'PAGADO COMPLETAMENTE'
                                                        : 'CON DEUDA'}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader className="pb-3 border-b">
                                            <CardTitle className="text-base font-semibold">Plan de Cuotas</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {cuotas.length > 0 ? (
                                                <div className="divide-y">
                                                    {cuotas.map((cuota: any) => (
                                                        <CuotaItem
                                                            key={cuota.id_cuota}
                                                            cuota={cuota}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="py-6 text-center text-sm text-slate-400">
                                                    No se generaron cuotas para esta matrícula.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-slate-400 text-sm">
                                        No hay comprobantes ni plan de pago registrado para la matrícula actual de este alumno.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {whatsAppAlumno && (
                <WhatsAppDialog
                    estudiante={whatsAppAlumno}
                    cuotas={whatsAppAlumno.matriculas?.[0]?.comprobante_pago?.cuotas || []}
                    plantillas={plantillas}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) {
                            setWhatsAppAlumno(null);
                        }
                    }}
                />
            )}

            <ConfigWhatsAppDialog
                plantillas={plantillas}
                open={configWhatsAppOpen}
                onOpenChange={setConfigWhatsAppOpen}
            />
        </>
    );
}
