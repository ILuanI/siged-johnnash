import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock,
    Pencil,
    Plus,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { toast } from 'sonner';
import { destroy, index, store, update } from '@/actions/App/Http/Controllers/Cursos/CursoController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { confirmAction } from '@/lib/confirm';
import { cn } from '@/lib/utils';

type HorarioItem = {
    id_horario: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
};

type CursoItem = {
    id_curso: number;
    nombre: string;
    area_conoc: string | null;
    color: string;
    asignacion: {
        id_asignacion: number;
        id_docente: number;
        id_ciclo: number;
        id_aula: number | null;
        docente_nombre: string;
        aula_nombre: string | null;
        ciclo_nombre: string | null;
        horarios: HorarioItem[];
    } | null;
};

type EventoHorario = {
    id: string;
    id_curso: number;
    nombre: string;
    area_conoc: string | null;
    color: string;
    docente_nombre: string;
    aula_nombre: string | null;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
};

type CicloOption = {
    id_ciclo: number;
    nombre: string;
    tipo_ciclo: string | null;
    estado: string;
};

type DocenteOption = {
    id: number;
    nombres: string;
    apellidos: string;
};

type AulaOption = {
    id_aula: number;
    nombre: string;
    capacidad: number | null;
};

type CursoForm = {
    nombre: string;
    area_conoc: string;
    color: string;
    id_docente: string;
    id_ciclo: string;
    id_aula: string;
    dias: string[];
    hora_inicio: string;
    hora_fin: string;
};

type PageProps = {
    cursos: CursoItem[];
    eventos: EventoHorario[];
    cicloSeleccionadoId: number | null;
    ciclos: CicloOption[];
    docentes: DocenteOption[];
    aulas: AulaOption[];
    dias: Record<string, string>;
};

const calendarioDias = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const horas = ['07:00', '08:00', '09:00', '10:00', '10:30', '11:00', '12:00'];
const inicioDia = toMinutes('07:00');
const finDia = toMinutes('12:00');
const colores = ['#1a237e', '#ff7043', '#2e7d32', '#0288d1', '#8e24aa', '#ef5350', '#fbc02d'];

function toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);

    return hours * 60 + minutes;
}

function computeEventLayout(dayEvents: EventoHorario[]) {
    if (dayEvents.length === 0) {
        return [];
    }

    const parsedEvents = dayEvents.map(ev => ({
        ...ev,
        startMin: toMinutes(ev.hora_inicio),
        endMin: toMinutes(ev.hora_fin),
        colIndex: 0,
        colCount: 1,
    }));

    parsedEvents.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

    const columns: typeof parsedEvents[] = [];
    parsedEvents.forEach(ev => {
        let placed = false;

        for (let i = 0; i < columns.length; i++) {
            const lastEv = columns[i][columns[i].length - 1];

            if (ev.startMin >= lastEv.endMin) {
                columns[i].push(ev);
                ev.colIndex = i;
                placed = true;
                break;
            }
        }

        if (!placed) {
            columns.push([ev]);
            ev.colIndex = columns.length - 1;
        }
    });

    const groups: (typeof parsedEvents)[] = [];
    parsedEvents.forEach(ev => {
        let joinedGroupIndex = -1;

        for (let i = 0; i < groups.length; i++) {
            const overlaps = groups[i].some(groupEv =>
                ev.startMin < groupEv.endMin && ev.endMin > groupEv.startMin
            );

            if (overlaps) {
                joinedGroupIndex = i;
                break;
            }
        }

        if (joinedGroupIndex !== -1) {
            groups[joinedGroupIndex].push(ev);
        } else {
            groups.push([ev]);
        }
    });

    let changed = true;

    while (changed) {
        changed = false;

        for (let i = 0; i < groups.length; i++) {
            for (let j = i + 1; j < groups.length; j++) {
                const overlaps = groups[i].some(evI =>
                    groups[j].some(evJ => evI.startMin < evJ.endMin && evI.endMin > evJ.startMin)
                );

                if (overlaps) {
                    groups[i].push(...groups[j]);
                    groups.splice(j, 1);
                    changed = true;
                    break;
                }
            }

            if (changed) {
                break;
            }
        }
    }

    groups.forEach(group => {
        const colCount = Math.max(...group.map(ev => ev.colIndex)) + 1;
        group.forEach(ev => {
            ev.colCount = colCount;
        });
    });

    return parsedEvents;
}

function eventStyle(evento: EventoHorario & { colIndex?: number; colCount?: number }): CSSProperties {
    const top = ((toMinutes(evento.hora_inicio) - inicioDia) / (finDia - inicioDia)) * 100;
    const height = ((toMinutes(evento.hora_fin) - toMinutes(evento.hora_inicio)) / (finDia - inicioDia)) * 100;

    const colIndex = evento.colIndex ?? 0;
    const colCount = evento.colCount ?? 1;

    const widthPct = 96 / colCount;
    const leftPct = 2 + (colIndex * widthPct);

    return {
        top: `${Math.max(top, 0)}%`,
        height: `calc(${Math.max(height, 9)}% - 4px)`,
        backgroundColor: evento.color,
        left: `${leftPct}%`,
        width: `${widthPct - 2}%`,
    };
}

function emptyForm(cicloSeleccionadoId: number | null): CursoForm {
    return {
        nombre: '',
        area_conoc: '',
        color: '#1a237e',
        id_docente: '',
        id_ciclo: cicloSeleccionadoId ? String(cicloSeleccionadoId) : '',
        id_aula: '',
        dias: ['LUN'],
        hora_inicio: '08:00',
        hora_fin: '10:00',
    };
}

export default function CursosIndex({
    cursos,
    eventos,
    cicloSeleccionadoId,
    ciclos,
    docentes,
    aulas,
    dias,
}: PageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCurso, setEditingCurso] = useState<CursoItem | null>(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<CursoForm>(emptyForm(cicloSeleccionadoId));

    // Ciclo Dialog
    const [isCicloDialogOpen, setIsCicloDialogOpen] = useState(false);
    const [cicloNombre, setCicloNombre] = useState('');
    const [cicloTipo, setCicloTipo] = useState('');
    const [cicloFechaInicio, setCicloFechaInicio] = useState('');
    const [cicloFechaFin, setCicloFechaFin] = useState('');
    const [cicloCostoBase, setCicloCostoBase] = useState('0');
    const [cicloErrors, setCicloErrors] = useState<any>({});
    const [cicloLoading, setCicloLoading] = useState(false);

    const handleCreateCiclo = (e: React.FormEvent) => {
        e.preventDefault();
        setCicloLoading(true);
        setCicloErrors({});

        router.post('/cursos/ciclos', {
            nombre: cicloNombre,
            tipo_ciclo: cicloTipo || null,
            fecha_inicio: cicloFechaInicio,
            fecha_fin: cicloFechaFin,
            costo_base: parseFloat(cicloCostoBase) || 0,
        }, {
            onSuccess: () => {
                setIsCicloDialogOpen(false);
                setCicloNombre('');
                setCicloTipo('');
                setCicloFechaInicio('');
                setCicloFechaFin('');
                setCicloCostoBase('0');
                toast.success('Ciclo académico creado exitosamente');
            },
            onError: (errs) => {
                setCicloErrors(errs);
                const fieldsOrder = ['nombre', 'tipo_ciclo', 'fecha_inicio', 'fecha_fin', 'costo_base'] as const;
                fieldsOrder.forEach((field) => {
                    if (errs[field]) {
                        toast.error(errs[field], {
                            className: 'bg-rose-50 border-rose-200 text-rose-800'
                        });
                    }
                });
            },
            onFinish: () => setCicloLoading(false),
            preserveState: true,
        });
    };

    // Aula Dialog
    const [isAulaDialogOpen, setIsAulaDialogOpen] = useState(false);
    const [aulaNombre, setAulaNombre] = useState('');
    const [aulaCapacidad, setAulaCapacidad] = useState('');
    const [aulaErrors, setAulaErrors] = useState<any>({});
    const [aulaLoading, setAulaLoading] = useState(false);

    const handleCreateAula = (e: React.FormEvent) => {
        e.preventDefault();
        setAulaLoading(true);
        setAulaErrors({});

        router.post('/cursos/aulas', {
            nombre: aulaNombre,
            capacidad: parseInt(aulaCapacidad) || null,
        }, {
            onSuccess: () => {
                setIsAulaDialogOpen(false);
                setAulaNombre('');
                setAulaCapacidad('');
                toast.success('Aula creada exitosamente');
            },
            onError: (errs) => {
                setAulaErrors(errs);
                const fieldsOrder = ['nombre', 'capacidad'] as const;
                fieldsOrder.forEach((field) => {
                    if (errs[field]) {
                        toast.error(errs[field], {
                            className: 'bg-rose-50 border-rose-200 text-rose-800'
                        });
                    }
                });
            },
            onFinish: () => setAulaLoading(false),
            preserveState: true,
        });
    };

    const cicloSeleccionado = ciclos.find((ciclo) => ciclo.id_ciclo === cicloSeleccionadoId);
    const eventosPorDia = useMemo(() => {
        return calendarioDias.reduce<Record<string, Array<EventoHorario & { colIndex?: number; colCount?: number }>>>((carry, dia) => {
            const dayEvents = eventos.filter((evento) => evento.dia_semana === dia);
            carry[dia] = computeEventLayout(dayEvents);

            return carry;
        }, {});
    }, [eventos]);

    const openCreateModal = () => {
        setEditingCurso(null);
        clearErrors();
        reset();
        setData(emptyForm(cicloSeleccionadoId));
        setModalOpen(true);
    };

    const openEditModal = (curso: CursoItem) => {
        const asignacion = curso.asignacion;
        const primerHorario = asignacion?.horarios[0];

        setEditingCurso(curso);
        clearErrors();
        setData({
            nombre: curso.nombre,
            area_conoc: curso.area_conoc ?? '',
            color: curso.color,
            id_docente: asignacion ? String(asignacion.id_docente) : '',
            id_ciclo: asignacion ? String(asignacion.id_ciclo) : cicloSeleccionadoId ? String(cicloSeleccionadoId) : '',
            id_aula: asignacion?.id_aula ? String(asignacion.id_aula) : '',
            dias: asignacion?.horarios.map((horario) => horario.dia_semana) ?? ['LUN'],
            hora_inicio: primerHorario?.hora_inicio ?? '08:00',
            hora_fin: primerHorario?.hora_fin ?? '10:00',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCurso(null);
        clearErrors();
    };

    const toggleDia = (dia: string) => {
        setData(
            'dias',
            data.dias.includes(dia)
                ? data.dias.filter((selectedDia) => selectedDia !== dia)
                : [...data.dias, dia],
        );
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
            onError: (errs: any) => {
                console.error(errs);
                const fieldsOrder = [
                    'nombre',
                    'area_conoc',
                    'id_ciclo',
                    'id_docente',
                    'id_aula',
                    'color',
                    'dias',
                    'hora_inicio',
                    'hora_fin'
                ] as const;
                fieldsOrder.forEach((field) => {
                    if (errs[field]) {
                        toast.error(errs[field], {
                            className: 'bg-rose-50 border-rose-200 text-rose-800'
                        });
                    }
                });
            }
        };

        if (editingCurso) {
            put(update.url(editingCurso.id_curso.toString()), options);

            return;
        }

        post(store.url(), options);
    };

    const handleDelete = async (curso: CursoItem) => {
        const confirmed = await confirmAction({
            title: `Eliminar curso ${curso.nombre}`,
            text: 'Se eliminará la configuración asociada al curso.',
            confirmButtonText: 'Eliminar',
        });

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url(curso.id_curso.toString()), { preserveScroll: true });
    };

    const handleCicloChange = (idCiclo: string) => {
        router.get(index.url(), { ciclo: idCiclo }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Gestion de cursos" />

            <header className="border-b bg-white px-5 py-5 md:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            Gestion de Cursos - Academia John Nash
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-[#0b145f]">
                            Horario de Clases
                        </h1>
                        <p className="text-sm text-slate-500">
                            {cicloSeleccionado
                                ? `${cicloSeleccionado.nombre}${cicloSeleccionado.tipo_ciclo ? ` - ${cicloSeleccionado.tipo_ciclo}` : ''}`
                                : 'Sin ciclo academico seleccionado'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1">
                            <select
                                value={cicloSeleccionadoId ?? ''}
                                onChange={(event) => handleCicloChange(event.target.value)}
                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
                            >
                                {ciclos.map((ciclo) => (
                                    <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>
                                        {ciclo.nombre}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCicloDialogOpen(true)}
                                title="Nuevo Ciclo Académico"
                                className="h-9 px-2 text-slate-600 hover:text-[#ff7043]"
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <Button type="button" variant="outline" size="icon" title="Semana anterior">
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" title="Semana siguiente">
                            <ChevronRight className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-[#ff7043] text-white hover:bg-[#f4511e]"
                        >
                            <Plus className="size-4" />
                            Nuevo Curso
                        </Button>
                    </div>
                </div>
            </header>

            <main className="grid gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_320px] md:px-8">
                <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="min-w-[840px]">
                        <div className="grid border-b border-slate-100 bg-slate-50 text-xs font-semibold text-[#0b145f]" style={{ gridTemplateColumns: '72px repeat(6, minmax(120px, 1fr))' }}>
                            <div className="flex h-16 items-center justify-center border-r border-slate-100">
                                <Clock className="size-4 text-slate-400" />
                            </div>
                            {calendarioDias.map((dia) => (
                                <div key={dia} className="flex h-16 flex-col items-center justify-center border-r border-slate-100 last:border-r-0">
                                    <span>{dias[dia]}</span>
                                    <span className="mt-1 text-[11px] font-normal text-slate-400">{dia}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '72px repeat(6, minmax(120px, 1fr))' }}>
                            <div className="relative min-h-[560px] border-r border-slate-100 bg-white">
                                {horas.map((hora) => (
                                    <div
                                        key={hora}
                                        className="absolute left-0 right-0 -translate-y-2 text-center text-xs text-slate-500"
                                        style={{ top: `${((toMinutes(hora) - inicioDia) / (finDia - inicioDia)) * 100}%` }}
                                    >
                                        {hora}
                                    </div>
                                ))}
                            </div>

                            {calendarioDias.map((dia) => (
                                <div key={dia} className="relative min-h-[560px] border-r border-slate-100 bg-[#fbf9ff] last:border-r-0">
                                    {horas.map((hora) => (
                                        <div
                                            key={hora}
                                            className="absolute left-0 right-0 border-t border-slate-100"
                                            style={{ top: `${((toMinutes(hora) - inicioDia) / (finDia - inicioDia)) * 100}%` }}
                                        />
                                    ))}
                                    <div
                                        className="absolute left-0 right-0 z-10 flex h-7 items-center justify-center bg-slate-200/70 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                                        style={{ top: `${((toMinutes('10:00') - inicioDia) / (finDia - inicioDia)) * 100}%` }}
                                    >
                                        Receso
                                    </div>
                                    {eventosPorDia[dia]?.map((evento) => (
                                        <button
                                            key={evento.id}
                                            type="button"
                                            onClick={() => {
                                                const curso = cursos.find((item) => item.id_curso === evento.id_curso);

                                                if (curso) {
                                                    openEditModal(curso);
                                                }
                                            }}
                                            className="absolute left-2 right-2 z-20 rounded-md px-3 py-2 text-left text-white shadow-md transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#ff7043]"
                                            style={eventStyle(evento)}
                                            title={`${evento.nombre} - ${evento.hora_inicio} a ${evento.hora_fin}`}
                                        >
                                            <span className="block truncate text-[11px] font-bold uppercase leading-tight text-[#ffb199]">
                                                {evento.nombre}
                                            </span>
                                            <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-white/85">
                                                <UserRound className="size-3" />
                                                {evento.docente_nombre || 'Docente sin asignar'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Cursos programados</h2>
                            <p className="text-xs text-slate-500">{cursos.length} registros</p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                            <CalendarDays className="size-3" />
                            {eventos.length} bloques
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        {cursos.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                                No hay cursos registrados para este ciclo.
                            </div>
                        ) : (
                            cursos.map((curso) => (
                                <div key={curso.id_curso} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: curso.color }} />
                                                <h3 className="truncate text-sm font-semibold text-slate-900">{curso.nombre}</h3>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {curso.asignacion?.docente_nombre || 'Sin docente asignado'}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {curso.asignacion?.aula_nombre || 'Sin aula'} · {curso.area_conoc || 'Sin area'}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => openEditModal(curso)} title="Editar curso">
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(curso)} title="Eliminar curso" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </aside>
            </main>

            <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
                <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#0b145f]">
                            {editingCurso ? 'Crear/Editar Curso' : 'Nuevo Curso'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Label htmlFor="nombre">Nombre del curso</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(event) => setData('nombre', event.target.value)}
                                    placeholder="Ej. Algebra Avanzada"
                                />
                                <InputError message={errors.nombre} />
                            </div>

                            <div>
                                <Label htmlFor="area_conoc">Area academica</Label>
                                <Input
                                    id="area_conoc"
                                    value={data.area_conoc}
                                    onChange={(event) => setData('area_conoc', event.target.value)}
                                    placeholder="Matematica, Ciencias..."
                                />
                                <InputError message={errors.area_conoc} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label htmlFor="id_ciclo" className="mb-0">Ciclo</Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => setIsCicloDialogOpen(true)}
                                        className="h-auto p-0 text-xs text-[#ff7043] hover:text-[#f4511e] flex items-center"
                                    >
                                        <Plus className="mr-1 size-3" />
                                        Nuevo
                                    </Button>
                                </div>
                                <select
                                    id="id_ciclo"
                                    value={data.id_ciclo}
                                    onChange={(event) => setData('id_ciclo', event.target.value)}
                                    required
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                                >
                                    <option value="">Seleccionar ciclo</option>
                                    {ciclos.map((ciclo) => (
                                        <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>
                                            {ciclo.nombre}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.id_ciclo} />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="id_docente">Docente</Label>
                                <select
                                    id="id_docente"
                                    value={data.id_docente}
                                    onChange={(event) => setData('id_docente', event.target.value)}
                                    required
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                                >
                                    <option value="">Seleccionar profesor</option>
                                    {docentes.map((docente) => (
                                        <option key={docente.id} value={docente.id}>
                                            {docente.nombres} {docente.apellidos}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.id_docente} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label htmlFor="id_aula" className="mb-0">Aula</Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => setIsAulaDialogOpen(true)}
                                        className="h-auto p-0 text-xs text-[#ff7043] hover:text-[#f4511e] flex items-center"
                                    >
                                        <Plus className="mr-1 size-3" />
                                        Nueva
                                    </Button>
                                </div>
                                <select
                                    id="id_aula"
                                    value={data.id_aula}
                                    onChange={(event) => setData('id_aula', event.target.value)}
                                    required
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                                >
                                    <option value="">Seleccionar aula</option>
                                    {aulas.map((aula) => (
                                        <option key={aula.id_aula} value={aula.id_aula}>
                                            {aula.nombre}
                                            {aula.capacidad ? ` (cap. ${aula.capacidad})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.id_aula} />
                            </div>

                            <div>
                                <Label>Color</Label>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {colores.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setData('color', color)}
                                            className={cn(
                                                'size-8 rounded-full border-2 transition',
                                                data.color === color ? 'border-[#0b145f] ring-2 ring-[#0b145f]/20' : 'border-white shadow-sm',
                                            )}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                    {/* Color Picker Personalizado */}
                                    <div className="relative flex items-center gap-1.5 ml-1">
                                        <input
                                            type="color"
                                            id="custom_color"
                                            value={colores.includes(data.color) ? '#000000' : data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="size-8 cursor-pointer rounded-full border border-slate-200 p-0 shadow-sm overflow-hidden"
                                            style={{ appearance: 'none', WebkitAppearance: 'none' }}
                                        />
                                        <span className="text-[11px] text-slate-500">Personalizado</span>
                                    </div>
                                </div>
                                <InputError message={errors.color} />
                            </div>
                        </div>

                        <div>
                            <Label>Dias</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(dias).map(([dia, label]) => (
                                    <button
                                        key={dia}
                                        type="button"
                                        onClick={() => toggleDia(dia)}
                                        className={cn(
                                            'h-9 rounded-full border px-4 text-sm transition',
                                            data.dias.includes(dia)
                                                ? 'border-[#1a237e] bg-[#1a237e] text-white'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-[#1a237e]',
                                        )}
                                    >
                                        {label.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.dias} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="hora_inicio">Hora inicio</Label>
                                <Input
                                    id="hora_inicio"
                                    type="time"
                                    value={data.hora_inicio}
                                    onChange={(event) => setData('hora_inicio', event.target.value)}
                                />
                                <InputError message={errors.hora_inicio} />
                            </div>
                            <div>
                                <Label htmlFor="hora_fin">Hora fin</Label>
                                <Input
                                    id="hora_fin"
                                    type="time"
                                    value={data.hora_fin}
                                    onChange={(event) => setData('hora_fin', event.target.value)}
                                />
                                <InputError message={errors.hora_fin} />
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={closeModal} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-[#1a237e] text-white hover:bg-[#0b145f]" disabled={processing}>
                                {editingCurso ? 'Guardar Cambios' : 'Crear Curso'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog para Nuevo Ciclo */}
            <Dialog open={isCicloDialogOpen} onOpenChange={setIsCicloDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#0b145f]">Nuevo Ciclo Académico</DialogTitle>
                        <DialogDescription>
                            Crea un nuevo ciclo de clases. Se asociará automáticamente al periodo académico vigente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCiclo}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="ciclo_nombre">Nombre del Ciclo *</Label>
                                <Input
                                    id="ciclo_nombre"
                                    value={cicloNombre}
                                    onChange={(e) => setCicloNombre(e.target.value)}
                                    placeholder="Ej. Anual Vallejo 2026-I, Repaso Nash..."
                                    required
                                />
                                {cicloErrors.nombre && <p className="text-sm text-destructive">{cicloErrors.nombre}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ciclo_tipo">Tipo de Ciclo (Opcional)</Label>
                                <Input
                                    id="ciclo_tipo"
                                    value={cicloTipo}
                                    onChange={(e) => setCicloTipo(e.target.value)}
                                    placeholder="Ej. Anual, Semestral, Intensivo..."
                                />
                                {cicloErrors.tipo_ciclo && <p className="text-sm text-destructive">{cicloErrors.tipo_ciclo}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="ciclo_inicio">Fecha Inicio *</Label>
                                    <Input
                                        id="ciclo_inicio"
                                        type="date"
                                        value={cicloFechaInicio}
                                        onChange={(e) => setCicloFechaInicio(e.target.value)}
                                        required
                                    />
                                    {cicloErrors.fecha_inicio && <p className="text-sm text-destructive">{cicloErrors.fecha_inicio}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ciclo_fin">Fecha Fin *</Label>
                                    <Input
                                        id="ciclo_fin"
                                        type="date"
                                        value={cicloFechaFin}
                                        onChange={(e) => setCicloFechaFin(e.target.value)}
                                        required
                                    />
                                    {cicloErrors.fecha_fin && <p className="text-sm text-destructive">{cicloErrors.fecha_fin}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ciclo_costo">Costo Base (S/.) *</Label>
                                <Input
                                    id="ciclo_costo"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cicloCostoBase}
                                    onChange={(e) => setCicloCostoBase(e.target.value)}
                                    required
                                />
                                {cicloErrors.costo_base && <p className="text-sm text-destructive">{cicloErrors.costo_base}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCicloDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={cicloLoading} className="bg-[#ff7043] text-white hover:bg-[#f4511e]">
                                {cicloLoading ? 'Creando...' : 'Crear Ciclo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog para Nueva Aula */}
            <Dialog open={isAulaDialogOpen} onOpenChange={setIsAulaDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#0b145f]">Nueva Aula</DialogTitle>
                        <DialogDescription>
                            Registra un aula física o virtual para asignarla a los horarios de clases.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAula}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="aula_nombre">Nombre del Aula *</Label>
                                <Input
                                    id="aula_nombre"
                                    value={aulaNombre}
                                    onChange={(e) => setAulaNombre(e.target.value)}
                                    placeholder="Ej. Aula 102, Salón B, Virtual..."
                                    required
                                />
                                {aulaErrors.nombre && <p className="text-sm text-destructive">{aulaErrors.nombre}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="aula_capacidad">Capacidad de Alumnos (Opcional)</Label>
                                <Input
                                    id="aula_capacidad"
                                    type="number"
                                    min="1"
                                    value={aulaCapacidad}
                                    onChange={(e) => setAulaCapacidad(e.target.value)}
                                    placeholder="Ej. 40"
                                />
                                {aulaErrors.capacidad && <p className="text-sm text-destructive">{aulaErrors.capacidad}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAulaDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={aulaLoading} className="bg-[#ff7043] text-white hover:bg-[#f4511e]">
                                {aulaLoading ? 'Creando...' : 'Crear Aula'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
