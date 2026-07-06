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
