import { router } from '@inertiajs/react';
import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { anular } from '@/actions/App/Http/Controllers/Tesoreria/EgresoController';
import { AuditoriaAnulacionTooltip } from '@/components/pagos/AuditoriaAnulacionTooltip';
import type { AuditoriaPagoItem } from '@/components/pagos/AuditoriaAnulacionTooltip';
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

export type EgresoAnulable = {
    id_egreso: number;
    concepto: string;
    total: number;
    fecha: string;
    estado?: string | null;
    auditorias?: AuditoriaPagoItem[];
};

type AnularEgresoDialogProps = {
    egreso: EgresoAnulable;
};

export function AnularEgresoDialog({ egreso }: AnularEgresoDialogProps) {
    const { puede } = usePermisos();
    const [open, setOpen] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [processing, setProcessing] = useState(false);
    const puedeAnular = puede('pagos', 'eliminar');

    const esAnulado = egreso.estado === 'ANULADO';

    const handleAnular = () => {
        setProcessing(true);
        router.post(
            anular.url({ egreso: egreso.id_egreso }),
            { motivo },
            {
                onSuccess: () => {
                    setOpen(false);
                    setMotivo('');
                    toast.success('Egreso anulado correctamente');
                },
                onError: () => {
                    toast.error('No se pudo anular el egreso');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="flex items-center justify-end gap-1">
            {esAnulado && (
                <AuditoriaAnulacionTooltip auditorias={egreso.auditorias} />
            )}

            {puedeAnular && !esAnulado && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <Undo2 className="mr-1 h-3 w-3" />
                            Anular
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Anular egreso</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                ¿Estás seguro de que deseas anular el egreso de{' '}
                                <strong>{formatCurrency(egreso.total)}</strong>{' '}
                                por{' '}
                                <strong>{egreso.concepto}</strong>? Esta acción
                                no se puede deshacer.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="motivo-anulacion-egreso">
                                    Motivo de anulación
                                </Label>
                                <Textarea
                                    id="motivo-anulacion-egreso"
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
                                        : 'Sí, anular egreso'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}