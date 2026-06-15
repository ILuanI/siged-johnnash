import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Brain,
    Cake,
    CreditCard,
    GraduationCap,
    IdCard,
    Pencil,
    Save,
    School,
    Smartphone,
    User,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateCarrera as updateAlumnoCarrera } from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import {
    calcularEdad,
    estadoBadgeClass,
    formatearFechaLarga,
} from '@/lib/matriculas';
import { cn } from '@/lib/utils';
import type { CarreraOption, ConsolidadoAlumno } from '@/types/matriculas';

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
    carreras,
    onClose,
}: {
    open: boolean;
    consolidado: ConsolidadoAlumno;
    carreras: CarreraOption[];
    onClose: () => void;
}) {
    const [tab, setTab] = useState<TabId>('informacion');
    const [carreraId, setCarreraId] = useState(
        consolidado.perfil.carrera?.id_carrera.toString() ?? '',
    );
    const [actualizandoCarrera, setActualizandoCarrera] = useState(false);
    const getInitials = useInitials();
    const { perfil, matricula_actual } = consolidado;
    const edad = calcularEdad(perfil.fecha_nac);
    const apoderado = perfil.apoderado;
    const riesgo = consolidado.riesgo_desercion;
    const carreraActualId = perfil.carrera?.id_carrera.toString() ?? '';

    const cambiarCarrera = () => {
        if (!carreraId) {
            toast.error('Selecciona una carrera valida.');

            return;
        }

        setActualizandoCarrera(true);
        router.patch(
            updateAlumnoCarrera.url(perfil.id_alumno),
            { id_carrera: carreraId },
            {
                preserveScroll: true,
                onError: (errors) => {
                    Object.values(errors).forEach((message) => toast.error(message));
                },
                onFinish: () => setActualizandoCarrera(false),
            },
        );
    };

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
                                    icon={School}
                                    label="Colegio de procedencia"
                                    value={perfil.colegio_procedencia?.nombre ?? '—'}
                                />
                            </section>

                            <section className="rounded-xl border bg-white p-4">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Datos académicos
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <AcademicCell
                                        label="Carrera"
                                        value={perfil.carrera?.nombre ?? 'Sin carrera'}
                                    />
                                    <AcademicCell
                                        label="Área"
                                        value={
                                            perfil.carrera?.area
                                                ? `Área ${perfil.carrera.area.codigo} · ${perfil.carrera.area.nombre}`
                                                : '—'
                                        }
                                    />
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
                                <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_auto]">
                                    <Select value={carreraId} onValueChange={setCarreraId}>
                                        <SelectTrigger aria-label="Cambiar carrera">
                                            <GraduationCap className="size-4 text-slate-400" />
                                            <SelectValue placeholder="Cambiar carrera del alumno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carreras.map((carrera) => (
                                                <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                    {carrera.nombre}
                                                    {carrera.area ? ` · Área ${carrera.area.codigo}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cambiarCarrera}
                                        disabled={actualizandoCarrera || ! carreraId || carreraId === carreraActualId}
                                    >
                                        <Save className="size-4" />
                                        Guardar
                                    </Button>
                                </div>
                            </section>

                            <section className="rounded-xl border bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Brain className="size-5 text-slate-500" />
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Riesgo IA de deserción
                                        </h3>
                                    </div>
                                    {riesgo ? (
                                        <Badge className={cn('rounded-full', riesgoBadgeClass(riesgo.nivel_riesgo))}>
                                            {riesgo.riesgo_pct.toFixed(1)}%
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Sin datos</Badge>
                                    )}
                                </div>
                                {riesgo ? (
                                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                        <AcademicCell
                                            label="Nivel"
                                            value={riesgo.nivel_riesgo}
                                        />
                                        <AcademicCell
                                            label="Asistencia"
                                            value={
                                                riesgo.tasa_asistencia !== null
                                                    ? `${riesgo.tasa_asistencia.toFixed(1)}%`
                                                    : 'Sin historial'
                                            }
                                        />
                                        <AcademicCell
                                            label="Cuotas vencidas"
                                            value={(riesgo.cuotas_vencidas ?? 0).toString()}
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                        <AlertTriangle className="size-4" />
                                        El perfil se calculará cuando exista matrícula vigente.
                                    </div>
                                )}
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
                                                Apoderado:
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

function riesgoBadgeClass(nivel: 'BAJO' | 'MEDIO' | 'ALTO') {
    return {
        BAJO: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
        MEDIO: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        ALTO: 'bg-red-100 text-red-700 hover:bg-red-100',
    }[nivel];
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
