export function calcularEdad(fechaNac: string | null): number | null {
    if (!fechaNac) {
        return null;
    }

    const nacimiento = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
}

export function formatearFechaLarga(fecha: string | null): string {
    if (!fecha) {
        return '—';
    }

    return new Date(fecha).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function estadoBadgeClass(estado: string | null): string {
    switch (estado) {
        case 'MATRICULADO':
            return 'bg-[#1a237e] text-white';
        case 'ACTIVO':
            return 'bg-emerald-600 text-white';
        case 'RETIRADO':
            return 'bg-slate-500 text-white';
        default:
            return 'bg-slate-400 text-white';
    }
}

function parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
}

export function getPaymentStatus(cuotas: { estado: string; fecha_vencimiento: string }[]): 'sin_pagos' | 'al_dia' | 'proximo_a_vencer' | 'vencido' {
    if (!cuotas || cuotas.length === 0) {
        return 'sin_pagos';
    }

    const pendientes = cuotas.filter((c) => c.estado !== 'PAGADA');

    if (pendientes.length === 0) {
        return 'al_dia';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const hasVencidas = pendientes.some((c) => {
        if (c.estado === 'VENCIDA') {
            return true;
        }
        const vDate = parseDate(c.fecha_vencimiento);
        return vDate < now;
    });

    if (hasVencidas) {
        return 'vencido';
    }

    const hasProximasVencer = pendientes.some((c) => {
        const vDate = parseDate(c.fecha_vencimiento);
        const diffTime = vDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
    });

    if (hasProximasVencer) {
        return 'proximo_a_vencer';
    }

    return 'al_dia';
}

export function normalizePhone(phone: string | null | undefined): string {
    if (!phone) {
        return '';
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('51') && digits.length >= 11) {
        return digits;
    }
    if (digits.length === 9) {
        return `51${digits}`;
    }
    return digits;
}

export function getWhatsAppUrl(phone: string, message: string): string {
    const normalized = normalizePhone(phone);
    if (!normalized) {
        return '';
    }
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
