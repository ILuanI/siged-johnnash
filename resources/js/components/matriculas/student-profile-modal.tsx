import {
    Cake,
    CreditCard,
    IdCard,
    Mail,
    MapPin,
    Pencil,
    Smartphone,
    User,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    calcularEdad,
    estadoBadgeClass,
    formatearFechaLarga,
} from '@/lib/matriculas';
import { useInitials } from '@/hooks/use-initials';
import type { ConsolidadoAlumno } from '@/types/matriculas';
import { cn } from '@/lib/utils';

type TabId = 'informacion' | 'pagos' | 'notas' | 'asistencia';

const tabs: { id: TabId; label: string }[] = [
    { id: 'informacion', label: 'Información' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'notas', label: 'Notas' },
    { id: 'asistencia', label: 'Asistencia' },
];

export function StudentProfileModal({
    open,
    consolidado,
    onClose,
}: {
    open: boolean;
    consolidado: ConsolidadoAlumno;
    onClose: () => void;
}) {
    const [tab, setTab] = useState<TabId>('informacion');
    const getInitials = useInitials();
    const { perfil, matricula_actual } = consolidado;
    const edad = calcularEdad(perfil.fecha_nac);
    const apoderado = perfil.apoderado;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => ! isOpen && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto border-0 p-0 sm:max-w-2xl">
                <DialogTitle className="sr-only">
                    Perfil de {perfil.nombre_completo}
                </DialogTitle>

                <div className="border-b px-6 pb-4 pt-8 text-center">
                    <Avatar className="mx-auto size-20 border-4 border-white shadow-md">
                        <AvatarFallback className="bg-[#1a237e] text-xl text-white">
                            {getInitials(perfil.nombre_completo)}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        {perfil.nombre_completo}
                    </h2>
                    <Badge
                        className={cn(
                            'mt-2 rounded-full px-3 py-0.5 text-xs font-semibold uppercase',
                            estadoBadgeClass(perfil.estado),
                        )}
                    >
                        {perfil.estado ?? 'SIN ESTADO'}
                    </Badge>
                </div>

                <div className="flex border-b px-2">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={cn(
                                'flex-1 border-b-2 px-3 py-3 text-sm font-medium transition',
                                tab === item.id
                                    ? 'border-[#ff7043] text-[#ff7043]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 px-6 py-4">
                    {tab === 'informacion' && (
                        <>
                            <section className="space-y-3 rounded-xl border bg-white p-4">
                                <InfoRow
                                    icon={IdCard}
                                    label="DNI / Documento"
                                    value={perfil.dni ?? '—'}
                                />
                                <InfoRow
                                    icon={Cake}
                                    label="Fecha de nacimiento"
                                    value={
                                        perfil.fecha_nac
                                            ? `${formatearFechaLarga(perfil.fecha_nac)}${edad !== null ? ` (${edad} años)` : ''}`
                                            : '—'
                                    }
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label="Dirección residencial"
                                    value={perfil.direccion ?? '—'}
                                />
                            </section>

                            <section className="rounded-xl border bg-white p-4">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Datos académicos
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <AcademicCell
                                        label="Sede"
                                        value="Sede Central — Lince"
                                    />
                                    <AcademicCell
                                        label="Ciclo actual"
                                        value={
                                            matricula_actual?.ciclo?.nombre ??
                                            'Sin matrícula'
                                        }
                                    />
                                    <AcademicCell
                                        label="Turno"
                                        value={
                                            matricula_actual?.turno?.nombre ??
                                            '—'
                                        }
                                    />
                                    <AcademicCell
                                        label="Aula"
                                        value={
                                            matricula_actual?.aula?.nombre ??
                                            '—'
                                        }
                                    />
                                </div>
                            </section>

                            <section className="rounded-xl border bg-white p-4">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Contacto y apoderado
                                </h3>
                                {apoderado && (
                                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm">
                                        <User className="size-4 shrink-0 text-slate-500" />
                                        <span>
                                            <span className="font-medium uppercase text-slate-500">
                                                Apoderado
                                                {apoderado.parentesco
                                                    ? ` (${apoderado.parentesco})`
                                                    : ''}
                                                :
                                            </span>{' '}
                                            {apoderado.nombres}
                                        </span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <InfoRow
                                        icon={Smartphone}
                                        label="Teléfono"
                                        value={
                                            apoderado?.telefono ??
                                            perfil.telefono ??
                                            '—'
                                        }
                                        compact
                                    />
                                    <InfoRow
                                        icon={Mail}
                                        label="Correo electrónico"
                                        value={
                                            apoderado?.correo ??
                                            perfil.correo ??
                                            '—'
                                        }
                                        compact
                                    />
                                </div>
                            </section>
                        </>
                    )}

                    {tab === 'pagos' && (
                        <PlaceholderTab
                            titulo="Pagos"
                            mensaje={consolidado.finanzas._meta.mensaje}
                        />
                    )}
                    {tab === 'notas' && (
                        <PlaceholderTab
                            titulo="Notas"
                            mensaje={consolidado.notas._meta.mensaje}
                        />
                    )}
                    {tab === 'asistencia' && (
                        <PlaceholderTab
                            titulo="Asistencia"
                            mensaje={consolidado.asistencia._meta.mensaje}
                        />
                    )}
                </div>

                <div className="flex gap-3 border-t bg-slate-50 px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled
                    >
                        <UserX className="size-4" />
                        Desactivar
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 bg-[#ff7043] hover:bg-[#f4511e]"
                        disabled
                    >
                        <Pencil className="size-4" />
                        Editar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    compact = false,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    compact?: boolean;
}) {
    return (
        <div className={cn('flex gap-3', compact && 'items-start')}>
            <Icon className="mt-0.5 size-5 shrink-0 text-slate-400" />
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                </p>
                <p className="text-sm text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function AcademicCell({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <p className="font-medium text-slate-800">{value}</p>
        </div>
    );
}

function PlaceholderTab({
    titulo,
    mensaje,
}: {
    titulo: string;
    mensaje: string;
}) {
    return (
        <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center">
            <CreditCard className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="font-medium text-slate-700">{titulo}</p>
            <p className="mt-1 text-sm text-slate-500">{mensaje}</p>
        </div>
    );
}
