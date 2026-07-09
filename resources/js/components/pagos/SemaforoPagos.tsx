import { Badge } from '@/components/ui/badge';
const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('T')[0].split('-');

    return new Date(Number(y), Number(m) - 1, Number(d));
};

type CuotaEstado = 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

export interface CuotaSemaforo {
    estado: CuotaEstado;
    fecha_vencimiento: string; // ISO date YYYY-MM-DD
}

interface SemaforoPagosProps {
    cuotas: CuotaSemaforo[];
    className?: string;
}

export function SemaforoPagos({ cuotas, className }: SemaforoPagosProps) {
    if (!cuotas || cuotas.length === 0) {
        return (
            <Badge
                variant="outline"
                className={`bg-gray-100 text-gray-500 hover:bg-gray-200 ${className || ''}`}
            >
                Sin Pagos
            </Badge>
        );
    }

    const pendientes = cuotas.filter((c) => c.estado !== 'PAGADA');

    if (pendientes.length === 0) {
        return (
            <Badge
                variant="outline"
                className={`border-green-200 bg-green-100 text-green-700 hover:bg-green-200 ${className || ''}`}
            >
                Al Día
            </Badge>
        );
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today for accurate day comparisons

    const hasVencidas = pendientes.some((c) => {
        if (c.estado === 'VENCIDA') {
return true;
}

        const vDate = parseDate(c.fecha_vencimiento);

        return vDate < now;
    });

    if (hasVencidas) {
        return (
            <Badge
                variant="outline"
                className={`border-red-200 bg-red-100 text-red-700 hover:bg-red-200 ${className || ''}`}
            >
                Vencido
            </Badge>
        );
    }

    // Check if any is yellow (due in <= 3 days)
    const hasProximasVencer = pendientes.some((c) => {
        const vDate = parseDate(c.fecha_vencimiento);
        const diffTime = vDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 3;
    });

    if (hasProximasVencer) {
        return (
            <Badge
                variant="outline"
                className={`border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 ${className || ''}`}
            >
                Próximo a Vencer
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className={`border-green-200 bg-green-100 text-green-700 hover:bg-green-200 ${className || ''}`}
        >
            Al Día
        </Badge>
    );
}
