import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export type AuditoriaCuotaItem = {
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

type AuditoriaExoneracionTooltipProps = {
    auditorias?: AuditoriaCuotaItem[];
};

export function AuditoriaExoneracionTooltip({
    auditorias,
}: AuditoriaExoneracionTooltipProps) {
    const exoneracion = auditorias
        ?.filter((a) => a.accion === 'EXONERAR')
        .at(-1);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    aria-label="Ver detalle de la exoneración"
                    className="ml-0.5 inline-flex cursor-pointer items-center rounded-full text-slate-400 transition-colors hover:text-violet-600"
                >
                    <Info className="h-3.5 w-3.5" />
                </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs space-y-1">
                <p>
                    <span className="font-semibold">
                        Exonerada por:
                    </span>{' '}
                    {exoneracion?.usuario?.name ?? '—'}
                </p>
                <p>
                    <span className="font-semibold">
                        Fecha de exoneración:
                    </span>{' '}
                    {formatDateTime(exoneracion?.created_at)}
                </p>
                <p>
                    <span className="font-semibold">Motivo:</span>{' '}
                    {exoneracion?.motivo ?? '—'}
                </p>
            </TooltipContent>
        </Tooltip>
    );
}