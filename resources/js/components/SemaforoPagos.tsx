import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CuotaSemaforo = {
    estado: string;
    fecha_vencimiento: string | null;
};

type SemaforoEstado = 'AL_DIA' | 'PROXIMO' | 'VENCIDO';

type SemaforoPagosProps = {
    cuotas?: CuotaSemaforo[];
    estado?: SemaforoEstado;
    className?: string;
};

export default function SemaforoPagos({ cuotas = [], estado, className }: SemaforoPagosProps) {
    const estadoActual = estado ?? calcularEstado(cuotas);
    const config = {
        AL_DIA: {
            label: 'Pagos al día',
            icon: CheckCircle2,
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
        },
        PROXIMO: {
            label: 'Próximo a vencer',
            icon: AlertTriangle,
            className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50',
        },
        VENCIDO: {
            label: 'Vencido',
            icon: XCircle,
            className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50',
        },
    } satisfies Record<SemaforoEstado, { label: string; icon: typeof CheckCircle2; className: string }>;
    const Icon = config[estadoActual].icon;

    return (
        <Badge
            variant="outline"
            className={cn('gap-1.5 px-3 py-1 text-sm font-semibold', config[estadoActual].className, className)}
        >
            <Icon className="size-3.5" />
            {config[estadoActual].label}
        </Badge>
    );
}

function calcularEstado(cuotas: CuotaSemaforo[]): SemaforoEstado {
    const pendientes = cuotas.filter((cuota) => cuota.estado !== 'PAGADA');

    if (pendientes.length === 0) {
        return 'AL_DIA';
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diasHastaVencimiento = pendientes
        .filter((cuota) => cuota.fecha_vencimiento)
        .map((cuota) => {
            const vencimiento = new Date(`${cuota.fecha_vencimiento}T00:00:00`);

            return Math.ceil((vencimiento.getTime() - hoy.getTime()) / 86_400_000);
        });

    if (pendientes.some((cuota) => cuota.estado === 'VENCIDA') || diasHastaVencimiento.some((dias) => dias < 0)) {
        return 'VENCIDO';
    }

    if (diasHastaVencimiento.some((dias) => dias <= 3)) {
        return 'PROXIMO';
    }

    return 'AL_DIA';
}
