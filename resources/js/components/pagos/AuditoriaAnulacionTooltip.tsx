import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export type AuditoriaPagoItem = {
    id: number;
    accion: string;
    motivo?: string | null;
    created_at?: string | null;
    usuario?: { name: string } | null;
};

function formatDateTime(dateStr?: string | null) {
    if (!dateStr) {
        return '—';
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

type AuditoriaAnulacionTooltipProps = {
    auditorias?: AuditoriaPagoItem[];
};

export function AuditoriaAnulacionTooltip({
    auditorias,
}: AuditoriaAnulacionTooltipProps) {
    const anulacion = auditorias
        ?.filter((a) => a.accion === 'ANULACION')
        .at(-1);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    aria-label="Ver detalle de la anulación"
                    className="ml-0.5 inline-flex cursor-pointer items-center rounded-full text-slate-400 transition-colors hover:text-red-600"
                >
                    <Info className="h-3.5 w-3.5" />
                </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs space-y-1">
                <p>
                    <span className="font-semibold">
                        Anulado por:
                    </span>{' '}
                    {anulacion?.usuario?.name ?? '—'}
                </p>
                <p>
                    <span className="font-semibold">
                        Fecha de anulación:
                    </span>{' '}
                    {formatDateTime(anulacion?.created_at)}
                </p>
                <p>
                    <span className="font-semibold">Motivo:</span>{' '}
                    {anulacion?.motivo ?? '—'}
                </p>
            </TooltipContent>
        </Tooltip>
    );
}
