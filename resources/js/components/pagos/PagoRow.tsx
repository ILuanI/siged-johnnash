import { router } from '@inertiajs/react';
import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { anularPago } from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import {
    AuditoriaAnulacionTooltip,
    type AuditoriaPagoItem,
} from '@/components/pagos/AuditoriaAnulacionTooltip';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
    return new Date(dateStr);
}

function formatDate(date: Date) {
    if (isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export type PagoRowProps = {
    pago: {
        id_pago: number;
        monto: string | number;
        fecha_pago: string;
        metodo_pago?: string | null;
        estado?: string | null;
        auditorias?: AuditoriaPagoItem[];
    };
};

export function PagoRow({ pago }: PagoRowProps) {
    const { puede } = usePermisos();
    const [open, setOpen] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [processing, setProcessing] = useState(false);
    const puedeAnular = puede('pagos', 'eliminar');

    const esAnulado = pago.estado === 'ANULADO';

    const handleAnular = () => {
        setProcessing(true);
        router.post(
            anularPago.url({ pago: pago.id_pago }),
            { motivo },
            {
                onSuccess: () => {
                    setOpen(false);
                    setMotivo('');
                    toast.success('Pago anulado correctamente');
                },
                onError: () => {
                    toast.error('No se pudo anular el pago');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">
                    {formatCurrency(pago.monto)}
                </span>
                <span className="text-slate-400">·</span>
                {formatDate(parseDate(pago.fecha_pago))}
                {pago.metodo_pago && (
                    <>
                        <span className="text-slate-400">·</span>
                        {pago.metodo_pago}
                    </>
                )}

                {esAnulado && (
                    <AuditoriaAnulacionTooltip
                        auditorias={pago.auditorias}
                    />
                )}
            </div>

            {puedeAnular && !esAnulado && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Undo2 className="mr-1 h-3 w-3" />
                            Deshacer pago
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Anular pago</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                ¿Estás seguro de que deseas anular el pago de{' '}
                                <strong>{formatCurrency(pago.monto)}</strong>{' '}
                                realizado el{' '}
                                {formatDate(parseDate(pago.fecha_pago))}? Esta
                                acción no se puede deshacer.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="motivo-anulacion">
                                    Motivo de anulación
                                </Label>
                                <Textarea
                                    id="motivo-anulacion"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Indica el motivo de la anulación (obligatorio)"
                                    maxLength={500}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleAnular}
                                    disabled={processing || !motivo.trim()}
                                >
                                    {processing
                                        ? 'Anulando...'
                                        : 'Sí, anular pago'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
