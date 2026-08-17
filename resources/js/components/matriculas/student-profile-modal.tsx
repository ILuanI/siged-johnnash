import { router } from '@inertiajs/react';
import {
    Cake,
    Clock,
    CreditCard,
    Download,
    GraduationCap,
    IdCard,
    Pencil,
    Save,
    School,
    Smartphone,
    User,
    UserX,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    desactivar as desactivarAlumnoAction,
    update as updateAlumno,
    updateCarrera as updateAlumnoCarrera,
} from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
import { exonerar as exonerarCuota } from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import SemaforoPagos from '@/components/SemaforoPagos';
import {
    AuditoriaExoneracionTooltip,
    type AuditoriaCuotaItem,
} from '@/components/pagos/AuditoriaExoneracionTooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { usePermisos } from '@/hooks/use-permisos';
import { confirmAction } from '@/lib/confirm';
import {
    calcularEdad,
    estadoBadgeClass,
    formatearFechaLarga,
} from '@/lib/matriculas';
import { cn } from '@/lib/utils';
import type { CarreraOption, ConsolidadoAlumno } from '@/types/matriculas';

type TabId = 'informacion' | 'pagos' | 'notas' | 'asistencia';

type FinanzasCuota = {
    id_cuota: number;
    numero_cuota: number;
    monto: number;
    fecha_vencimiento: string;
    estado: string;
    concepto?: string | null;
    auditorias?: AuditoriaCuotaItem[];
};

type FinanzasPago = {
    id_pago: number;
    numero_cuota: number;
    monto: number;
    fecha_pago: string;
    metodo_pago: string | null;
};

type FinanzasConsolidado = {
    saldo_pendiente: number;
    costo_total: number;
    tipo_pago: string | null;
    estado_pago: string;
    cuotas: FinanzasCuota[];
    pagos: FinanzasPago[];
};

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
    const [editOpen, setEditOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [exonerarCuotaId, setExonerarCuotaId] = useState<number | null>(null);
    const [motivoExonerar, setMotivoExonerar] = useState('');
    const [processingExonerar, setProcessingExonerar] = useState(false);
    const [editForm, setEditForm] = useState({
        nombres: consolidado.perfil.nombres,
        apellidos: consolidado.perfil.apellidos,
        dni: consolidado.perfil.dni ?? '',
        telefono: consolidado.perfil.telefono ?? '',
        fecha_nac: consolidado.perfil.fecha_nac ?? '',
        sexo: consolidado.perfil.sexo ?? '',
        estado: consolidado.perfil.estado ?? 'ACTIVO',
        apoderado_nombres: consolidado.perfil.apoderado?.nombres ?? '',
        apoderado_telefono: consolidado.perfil.apoderado?.telefono ?? '',
    });
    const { puede } = usePermisos();
    const puedeEditar = puede('estudiantes', 'editar');
    const puedeExonerar = puede('pagos', 'eliminar');
    const getInitials = useInitials();
    const { perfil, matricula_actual } = consolidado;
    const finanzas = consolidado.finanzas as unknown as FinanzasConsolidado;
    const edad = calcularEdad(perfil.fecha_nac);
    const apoderado = perfil.apoderado;
    const carreraActualId = perfil.carrera?.id_carrera.toString() ?? '';

    const openEdit = () => {
        setEditForm({
            nombres: perfil.nombres,
            apellidos: perfil.apellidos,
            dni: perfil.dni ?? '',
            telefono: perfil.telefono ?? '',
            fecha_nac: perfil.fecha_nac ?? '',
            sexo: perfil.sexo ?? '',
            estado: perfil.estado ?? 'ACTIVO',
            apoderado_nombres: perfil.apoderado?.nombres ?? '',
            apoderado_telefono: perfil.apoderado?.telefono ?? '',
        });
        setEditOpen(true);
    };

    const guardarEdicion = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(
            updateAlumno.url(perfil.id_alumno),
            {
                nombres: editForm.nombres,
                apellidos: editForm.apellidos,
                dni: editForm.dni,
                telefono: editForm.telefono || null,
                fecha_nac: editForm.fecha_nac || null,
                sexo: editForm.sexo || null,
                estado: editForm.estado,
                id_carrera: carreraId ? Number(carreraId) : null,
                apoderado: editForm.apoderado_nombres
                    ? {
                          nombres: editForm.apoderado_nombres,
                          telefono: editForm.apoderado_telefono || null,
                      }
                    : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditOpen(false),
                onError: (errors) => {
                    Object.values(errors).forEach((message) =>
                        toast.error(String(message)),
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const desactivarAlumno = async () => {
        const confirmed = await confirmAction({
            title: '¿Retirar estudiante?',
            text: `${perfil.nombre_completo} pasará a estado RETIRADO. Su expediente e historial académico serán conservados.`,
            confirmButtonText: 'Retirar Estudiante',
            cancelButtonText: 'Cancelar',
            icon: 'warning',
        });

        if (!confirmed) {
            return;
        }

        router.post(
            `/matriculas/estudiantes/${perfil.id_alumno}/retirar`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Estudiante retirado correctamente.');
                    onClose();
                },
                onError: (errors) => {
                    Object.values(errors).forEach((message) =>
                        toast.error(String(message)),
                    );
                },
            },
        );
    };

    const eliminarAlumno = async () => {
        const confirmed = await confirmAction({
            title: '⚠️ ¿ELIMINAR ESTUDIANTE PERMANENTEMENTE?',
            text: `¡ADVERTENCIA CRÍTICA! Se eliminará a ${perfil.nombre_completo} y TODAS sus matrículas, asistencias y cuotas asociadas de forma irreversible.`,
            confirmButtonText: 'Sí, Eliminar Definitivamente',
            cancelButtonText: 'Cancelar',
            icon: 'warning',
        });

        if (!confirmed) {
            return;
        }

        router.delete(`/matriculas/estudiantes/${perfil.id_alumno}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Estudiante eliminado completamente.');
                onClose();
            },
            onError: (errors) => {
                Object.values(errors).forEach((message) =>
                    toast.error(String(message)),
                );
            },
        });
    };

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
                    Object.values(errors).forEach((message) =>
                        toast.error(message),
                    );
                },
                onFinish: () => setActualizandoCarrera(false),
            },
        );
    };

    const handleExonerarCuota = () => {
        if (exonerarCuotaId === null) {
            return;
        }

        setProcessingExonerar(true);
        router.post(
            exonerarCuota.url({ cuota: exonerarCuotaId }),
            { motivo: motivoExonerar },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setExonerarCuotaId(null);
                    setMotivoExonerar('');
                    toast.success('Cuota exonerada correctamente');
                },
                onError: (errors) => {
                    Object.values(errors).forEach((message) =>
                        toast.error(String(message)),
                    );
                },
                onFinish: () => setProcessingExonerar(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto border-0 p-0 sm:max-w-2xl">
                <DialogTitle className="sr-only">
                    Perfil de {perfil.nombre_completo}
                </DialogTitle>

                <div className="border-b px-6 pt-8 pb-4 text-center">
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

                <div className="mt-2 text-center sm:absolute sm:top-6 sm:right-10 sm:mt-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-[#1a237e] hover:bg-[#1a237e]/5 hover:text-[#1a237e]"
                        asChild
                    >
                        <a
                            href={`/matriculas/estudiantes/${perfil.id_alumno}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Download className="mr-2 size-4" />
                            Descargar Perfil 360°
                        </a>
                    </Button>
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
                                    value={
                                        perfil.colegio_procedencia?.nombre ??
                                        '—'
                                    }
                                />
                            </section>

                            <section className="rounded-xl border bg-white p-4">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Datos académicos
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <AcademicCell
                                        label="Carrera"
                                        value={
                                            perfil.carrera?.nombre ??
                                            'Sin carrera'
                                        }
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
                                    <Select
                                        value={carreraId}
                                        onValueChange={setCarreraId}
                                    >
                                        <SelectTrigger aria-label="Cambiar carrera">
                                            <GraduationCap className="size-4 text-slate-400" />
                                            <SelectValue placeholder="Cambiar carrera del alumno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carreras.map((carrera) => (
                                                <SelectItem
                                                    key={carrera.id_carrera}
                                                    value={carrera.id_carrera.toString()}
                                                >
                                                    {carrera.nombre}
                                                    {carrera.area
                                                        ? ` · Área ${carrera.area.codigo}`
                                                        : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cambiarCarrera}
                                        disabled={
                                            actualizandoCarrera ||
                                            !carreraId ||
                                            carreraId === carreraActualId
                                        }
                                    >
                                        <Save className="size-4" />
                                        Guardar
                                    </Button>
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
                                            <span className="font-medium text-slate-500 uppercase">
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
                        <div className="space-y-4">
                            <section className="rounded-xl border bg-white p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="size-5 text-slate-500" />
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Estado Financiero
                                        </h3>
                                    </div>
                                    <SemaforoPagos cuotas={finanzas.cuotas} />
                                </div>

                                <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                                    <div>
                                        <span className="block text-xs text-slate-500">
                                            Costo Total
                                        </span>
                                        <span className="text-lg font-bold text-slate-900">
                                            S/ {finanzas.costo_total.toFixed(2)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500">
                                            Pagado
                                        </span>
                                        <span className="text-lg font-bold text-emerald-600">
                                            S/{' '}
                                            {(
                                                finanzas.costo_total -
                                                finanzas.saldo_pendiente
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500">
                                            Saldo Pendiente
                                        </span>
                                        <span className="text-lg font-bold text-rose-600">
                                            S/{' '}
                                            {finanzas.saldo_pendiente.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border bg-white p-4">
                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Cuotas
                                </h3>
                                {finanzas.cuotas.length > 0 ? (
                                    <div className="overflow-hidden rounded-lg border border-slate-100">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="py-2.5">
                                                        N° Cuota
                                                    </TableHead>
                                                    <TableHead className="py-2.5">
                                                        Monto
                                                    </TableHead>
                                                    <TableHead className="py-2.5">
                                                        Vencimiento
                                                    </TableHead>
                                                    <TableHead className="py-2.5 text-right">
                                                        Estado
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {finanzas.cuotas.map(
                                                    (cuota) => (
                                                        <TableRow
                                                            key={cuota.id_cuota}
                                                            className="hover:bg-slate-50/50"
                                                        >
                                                            <TableCell className="py-2 font-medium">
                                                                Cuota{' '}
                                                                {
                                                                    cuota.numero_cuota
                                                                }
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                S/{' '}
                                                                {cuota.monto.toFixed(
                                                                    2,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                    <Clock className="size-3.5" />
                                                                    {new Date(
                                                                        `${cuota.fecha_vencimiento}T00:00:00`,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="py-2 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Badge
                                                                        className={cn(
                                                                            'rounded-full px-2 text-[10px]',
                                                                            estadoCuotaClass(
                                                                                cuota.estado,
                                                                            ),
                                                                        )}
                                                                    >
                                                                        {
                                                                            cuota.estado
                                                                        }
                                                                    </Badge>
                                                                    {cuota.estado ===
                                                                        'EXONERADA' && (
                                                                        <AuditoriaExoneracionTooltip
                                                                            auditorias={
                                                                                cuota.auditorias
                                                                            }
                                                                        />
                                                                    )}
                                                                    {puedeExonerar &&
                                                                        cuota.estado !==
                                                                            'PAGADA' &&
                                                                        cuota.estado !==
                                                                            'EXONERADA' && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="h-6 px-2 text-[10px] text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                                                                                onClick={() => {
                                                                                    setExonerarCuotaId(
                                                                                        cuota.id_cuota,
                                                                                    );
                                                                                    setMotivoExonerar(
                                                                                        '',
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Exonerar
                                                                            </Button>
                                                                        )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-xs text-slate-400">
                                        Pago realizado en Modalidad Al Contado.
                                    </p>
                                )}
                            </section>

                            {finanzas.pagos.length > 0 && (
                                <section className="rounded-xl border bg-white p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                        Pagos realizados
                                    </h3>
                                    <div className="overflow-hidden rounded-lg border border-slate-100">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="py-2.5">
                                                        Cuota
                                                    </TableHead>
                                                    <TableHead className="py-2.5">
                                                        Monto
                                                    </TableHead>
                                                    <TableHead className="py-2.5">
                                                        Fecha
                                                    </TableHead>
                                                    <TableHead className="py-2.5 text-right">
                                                        Método
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {finanzas.pagos.map((pago) => (
                                                    <TableRow
                                                        key={pago.id_pago}
                                                        className="hover:bg-slate-50/50"
                                                    >
                                                        <TableCell className="py-2 font-medium">
                                                            Cuota{' '}
                                                            {pago.numero_cuota}
                                                        </TableCell>
                                                        <TableCell className="py-2">
                                                            S/{' '}
                                                            {pago.monto.toFixed(
                                                                2,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs text-slate-500">
                                                            {formatearFechaLarga(
                                                                pago.fecha_pago,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-right">
                                                            <Badge
                                                                variant="outline"
                                                                className="border-slate-200 bg-slate-50 font-medium text-slate-600"
                                                            >
                                                                {pago.metodo_pago ??
                                                                    '—'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                    {tab === 'notas' && (
                        <PlaceholderTab
                            titulo="Notas"
                            mensaje={consolidado.notas._meta.mensaje}
                        />
                    )}
                    {tab === 'asistencia' &&
                        (consolidado.asistencia.resumen ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-xl border bg-white p-4">
                                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            Tasa de Asistencia
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">
                                            {(
                                                consolidado.asistencia
                                                    .resumen as any
                                            ).tasa_asistencia !== null
                                                ? `${(consolidado.asistencia.resumen as any).tasa_asistencia.toFixed(1)}%`
                                                : '0%'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-white p-4">
                                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            Asistencias
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">
                                            {
                                                (
                                                    consolidado.asistencia
                                                        .resumen as any
                                                ).total_asistencias
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-white p-4">
                                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            Tardanzas
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">
                                            {
                                                (
                                                    consolidado.asistencia
                                                        .resumen as any
                                                ).total_tardanzas
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded-xl border bg-white p-4">
                                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                            Faltas
                                        </p>
                                        <p className="mt-1 text-xl font-bold text-slate-900">
                                            {
                                                (
                                                    consolidado.asistencia
                                                        .resumen as any
                                                ).total_faltas
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-xl border bg-white">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 font-medium text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Fecha
                                                </th>
                                                <th className="px-4 py-3">
                                                    Curso
                                                </th>
                                                <th className="px-4 py-3">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {consolidado.asistencia.detalle
                                                .length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="px-4 py-8 text-center text-slate-500"
                                                    >
                                                        No hay registros de
                                                        asistencia
                                                    </td>
                                                </tr>
                                            ) : (
                                                (
                                                    consolidado.asistencia
                                                        .detalle as any[]
                                                ).map(
                                                    (item: any, i: number) => (
                                                        <tr
                                                            key={i}
                                                            className="hover:bg-slate-50"
                                                        >
                                                            <td className="px-4 py-3">
                                                                {item.fecha}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-900">
                                                                {item.curso}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Badge
                                                                    className={cn(
                                                                        'rounded-full px-2 text-[10px]',
                                                                        estadoAsistenciaClass(
                                                                            item.estado,
                                                                        ),
                                                                    )}
                                                                >
                                                                    {
                                                                        item.estado
                                                                    }
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <PlaceholderTab
                                titulo="Asistencia"
                                mensaje="No se encontraron registros de asistencia para este estudiante."
                            />
                        ))}
                </div>

                <div className="flex flex-wrap gap-3 border-t bg-slate-50 px-6 py-4">
                    {puedeEditar && perfil.estado !== 'RETIRADO' && (
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-amber-300 text-amber-800 hover:bg-amber-100"
                            onClick={desactivarAlumno}
                        >
                            <UserX className="size-4" />
                            Retirar Alumno
                        </Button>
                    )}
                    {puedeEditar && (
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-rose-300 font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-900"
                            onClick={eliminarAlumno}
                        >
                            <Trash2 className="size-4" />
                            Eliminar Alumno
                        </Button>
                    )}
                    {puedeEditar && (
                        <Button
                            type="button"
                            className="flex-1 bg-[#ff7043] hover:bg-[#f4511e]"
                            onClick={openEdit}
                        >
                            <Pencil className="size-4" />
                            Editar Datos
                        </Button>
                    )}
                </div>
            </DialogContent>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar estudiante</DialogTitle>
                        <DialogDescription>
                            Actualiza los datos personales y de contacto.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={guardarEdicion} className="grid gap-4">
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombres">Nombres</Label>
                                <Input
                                    id="edit-nombres"
                                    value={editForm.nombres}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            nombres: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-apellidos">
                                    Apellidos
                                </Label>
                                <Input
                                    id="edit-apellidos"
                                    value={editForm.apellidos}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            apellidos: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-dni">DNI</Label>
                                <Input
                                    id="edit-dni"
                                    value={editForm.dni}
                                    maxLength={8}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            dni: e.target.value
                                                .replace(/\D/g, '')
                                                .slice(0, 8),
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-telefono">Teléfono</Label>
                                <Input
                                    id="edit-telefono"
                                    value={editForm.telefono}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            telefono: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-fecha">
                                    Fecha de nacimiento
                                </Label>
                                <Input
                                    id="edit-fecha"
                                    type="date"
                                    value={editForm.fecha_nac}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            fecha_nac: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Sexo</Label>
                                <Select
                                    value={editForm.sexo || undefined}
                                    onValueChange={(value) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            sexo: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">
                                            Masculino
                                        </SelectItem>
                                        <SelectItem value="F">
                                            Femenino
                                        </SelectItem>
                                        <SelectItem value="OTRO">
                                            Otro
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Estado</Label>
                            <Select
                                value={editForm.estado}
                                onValueChange={(value) =>
                                    setEditForm((prev) => ({
                                        ...prev,
                                        estado: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVO">
                                        ACTIVO
                                    </SelectItem>
                                    <SelectItem value="MATRICULADO">
                                        MATRICULADO
                                    </SelectItem>
                                    <SelectItem value="RETIRADO">
                                        RETIRADO
                                    </SelectItem>
                                    <SelectItem value="EGRESADO">
                                        EGRESADO
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-apoderado">
                                    Apoderado
                                </Label>
                                <Input
                                    id="edit-apoderado"
                                    value={editForm.apoderado_nombres}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            apoderado_nombres: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-apoderado-tel">
                                    Tel. apoderado
                                </Label>
                                <Input
                                    id="edit-apoderado-tel"
                                    value={editForm.apoderado_telefono}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({
                                            ...prev,
                                            apoderado_telefono: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#ff7043] hover:bg-[#f4511e]"
                            >
                                Guardar cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={exonerarCuotaId !== null}
                onOpenChange={(isOpen) => !isOpen && setExonerarCuotaId(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Exonerar cuota</DialogTitle>
                        <DialogDescription>
                            La cuota dejará de contar como pendiente. Esta
                            acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="motivo-exoneracion">
                                Motivo de exoneración
                            </Label>
                            <Textarea
                                id="motivo-exoneracion"
                                value={motivoExonerar}
                                onChange={(e) =>
                                    setMotivoExonerar(e.target.value)
                                }
                                placeholder="Indica el motivo de la exoneración (obligatorio)"
                                maxLength={500}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setExonerarCuotaId(null)}
                                disabled={processingExonerar}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="bg-violet-600 hover:bg-violet-700"
                                onClick={handleExonerarCuota}
                                disabled={
                                    processingExonerar || !motivoExonerar.trim()
                                }
                            >
                                {processingExonerar
                                    ? 'Exonerando...'
                                    : 'Sí, exonerar cuota'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
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
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
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
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
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

function estadoCuotaClass(estado: string) {
    switch (estado) {
        case 'PAGADA':
            return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
        case 'VENCIDA':
            return 'bg-rose-100 text-rose-700 hover:bg-rose-100';
        case 'EXONERADA':
            return 'bg-violet-100 text-violet-700 hover:bg-violet-100';
        default:
            return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
    }
}

function estadoAsistenciaClass(estado: string) {
    switch (estado) {
        case 'ASISTIO':
            return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
        case 'TARDANZA':
            return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
        case 'FALTO':
            return 'bg-red-100 text-red-700 hover:bg-red-100';
        case 'JUSTIFICADO':
            return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
        default:
            return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
    }
}
