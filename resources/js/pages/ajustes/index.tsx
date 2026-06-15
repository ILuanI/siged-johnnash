import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    CalendarRange,
    DoorOpen,
    Plus,
    Save,
    School,
    Settings,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    destroyAula,
    destroyColegio,
    destroyPeriodo,
    destroyTurno,
    storeAula,
    storeColegio,
    storePeriodo,
    storeTurno,
    updateAula,
    updateColegio,
    updatePeriodo,
    updateTurno,
} from '@/actions/App/Http/Controllers/Ajustes/ConfiguracionController';
import { index as catalogoIndex } from '@/actions/App/Http/Controllers/Matriculas/CatalogoAcademicoController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { confirmAction } from '@/lib/confirm';
import { cn } from '@/lib/utils';

type Aula = { id_aula: number; nombre: string; capacidad: number | null; matriculas_count?: number };
type Turno = {
    id_turno: number;
    nombre: string;
    hora_inicio: string | null;
    hora_fin: string | null;
    matriculas_count?: number;
};
type Periodo = {
    id_periodo: number;
    nombre: string;
    anio: number;
    descripcion: string | null;
    estado: string;
    ciclos_count?: number;
    matriculas_count?: number;
};
type Colegio = { id_colegio_procedencia: number; nombre: string; alumnos_count?: number };

type PageProps = {
    aulas: Aula[];
    turnos: Turno[];
    periodos: Periodo[];
    colegios: Colegio[];
};

type TabKey = 'aulas' | 'turnos' | 'periodos' | 'colegios';

const TABS: { key: TabKey; label: string; icon: typeof DoorOpen }[] = [
    { key: 'aulas', label: 'Aulas', icon: DoorOpen },
    { key: 'turnos', label: 'Turnos', icon: CalendarRange },
    { key: 'periodos', label: 'Periodos', icon: Building2 },
    { key: 'colegios', label: 'Colegios', icon: School },
];

export default function AjustesIndex({ aulas, turnos, periodos, colegios }: PageProps) {
    const [tab, setTab] = useState<TabKey>('aulas');

    return (
        <>
            <Head title="Configuración" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Settings className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
                            <p className="text-sm text-slate-500">
                                Mantenedores de catálogos del sistema. Ajusta una vez y selecciona en los formularios.
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={catalogoIndex.url()}>
                            <BookOpen className="size-4" />
                            Áreas y carreras
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="space-y-6 px-8 py-6">
                <nav className="flex flex-wrap gap-2">
                    {TABS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setTab(item.key)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition',
                                tab === item.key
                                    ? 'border-[#ff7043] bg-[#fff3ee] text-[#f4511e]'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                            )}
                        >
                            <item.icon className="size-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {tab === 'aulas' && <AulasPanel aulas={aulas} />}
                {tab === 'turnos' && <TurnosPanel turnos={turnos} />}
                {tab === 'periodos' && <PeriodosPanel periodos={periodos} />}
                {tab === 'colegios' && <ColegiosPanel colegios={colegios} />}
            </main>
        </>
    );
}

async function eliminarRecurso(url: string, titulo: string, detalle: string) {
    const ok = await confirmAction({
        title: titulo,
        text: detalle,
        confirmButtonText: 'Eliminar',
        icon: 'warning',
    });

    if (!ok) {
        return;
    }

    router.delete(url, { preserveScroll: true });
}

function PanelShell({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof DoorOpen;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border bg-white">
            <div className="flex items-center gap-3 border-b p-5">
                <Icon className="size-5 text-slate-500" />
                <div>
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

// ----------------------------------------------------------------- Aulas
function AulasPanel({ aulas }: { aulas: Aula[] }) {
    const form = useForm({ nombre: '', capacidad: '' });

    const crear = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(storeAula.url(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => toast.error('Revisa los datos del aula.'),
        });
    };

    return (
        <PanelShell icon={DoorOpen} title="Aulas" description="Espacios físicos donde se dictan clases.">
            <form onSubmit={crear} className="grid gap-4 border-b p-5 sm:grid-cols-[1fr_160px_auto]">
                <div>
                    <Label htmlFor="aula_nombre">Nombre *</Label>
                    <Input
                        id="aula_nombre"
                        value={form.data.nombre}
                        onChange={(event) => form.setData('nombre', event.target.value)}
                        placeholder="Aula 103"
                    />
                    <InputError message={form.errors.nombre} />
                </div>
                <div>
                    <Label htmlFor="aula_capacidad">Capacidad</Label>
                    <Input
                        id="aula_capacidad"
                        type="number"
                        min="1"
                        value={form.data.capacidad}
                        onChange={(event) => form.setData('capacidad', event.target.value)}
                    />
                    <InputError message={form.errors.capacidad} />
                </div>
                <Button type="submit" className="self-end bg-[#ff7043] hover:bg-[#f4511e]" disabled={form.processing}>
                    <Plus className="size-4" />
                    Agregar
                </Button>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-40">Capacidad</TableHead>
                        <TableHead className="w-28">Matrículas</TableHead>
                        <TableHead className="w-44 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aulas.length > 0 ? (
                        aulas.map((aula) => <AulaRow key={aula.id_aula} aula={aula} />)
                    ) : (
                        <EmptyRow colSpan={4} text="Aún no hay aulas registradas." />
                    )}
                </TableBody>
            </Table>
        </PanelShell>
    );
}

function AulaRow({ aula }: { aula: Aula }) {
    const form = useForm({ nombre: aula.nombre, capacidad: aula.capacidad?.toString() ?? '' });

    const guardar = () => {
        form.patch(updateAula.url(aula.id_aula.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar el aula.'),
        });
    };

    return (
        <TableRow>
            <TableCell>
                <Input value={form.data.nombre} onChange={(event) => form.setData('nombre', event.target.value)} />
                <InputError message={form.errors.nombre} />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="1"
                    value={form.data.capacidad}
                    onChange={(event) => form.setData('capacidad', event.target.value)}
                />
                <InputError message={form.errors.capacidad} />
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="rounded-full">
                    {aula.matriculas_count ?? 0}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <RowActions
                    onSave={guardar}
                    saving={form.processing}
                    onDelete={() =>
                        eliminarRecurso(destroyAula.url(aula.id_aula.toString()), '¿Eliminar aula?', aula.nombre)
                    }
                />
            </TableCell>
        </TableRow>
    );
}

// ----------------------------------------------------------------- Turnos
function TurnosPanel({ turnos }: { turnos: Turno[] }) {
    const form = useForm({ nombre: '', hora_inicio: '', hora_fin: '' });

    const crear = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(storeTurno.url(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => toast.error('Revisa los datos del turno.'),
        });
    };

    return (
        <PanelShell icon={CalendarRange} title="Turnos" description="Franjas horarias para las matrículas.">
            <form onSubmit={crear} className="grid gap-4 border-b p-5 sm:grid-cols-[1fr_140px_140px_auto]">
                <div>
                    <Label htmlFor="turno_nombre">Nombre *</Label>
                    <Input
                        id="turno_nombre"
                        value={form.data.nombre}
                        onChange={(event) => form.setData('nombre', event.target.value)}
                        placeholder="Mañana"
                    />
                    <InputError message={form.errors.nombre} />
                </div>
                <div>
                    <Label htmlFor="turno_inicio">Hora inicio</Label>
                    <Input
                        id="turno_inicio"
                        type="time"
                        value={form.data.hora_inicio}
                        onChange={(event) => form.setData('hora_inicio', event.target.value)}
                    />
                    <InputError message={form.errors.hora_inicio} />
                </div>
                <div>
                    <Label htmlFor="turno_fin">Hora fin</Label>
                    <Input
                        id="turno_fin"
                        type="time"
                        value={form.data.hora_fin}
                        onChange={(event) => form.setData('hora_fin', event.target.value)}
                    />
                    <InputError message={form.errors.hora_fin} />
                </div>
                <Button type="submit" className="self-end bg-[#ff7043] hover:bg-[#f4511e]" disabled={form.processing}>
                    <Plus className="size-4" />
                    Agregar
                </Button>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-36">Inicio</TableHead>
                        <TableHead className="w-36">Fin</TableHead>
                        <TableHead className="w-28">Matrículas</TableHead>
                        <TableHead className="w-44 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {turnos.length > 0 ? (
                        turnos.map((turno) => <TurnoRow key={turno.id_turno} turno={turno} />)
                    ) : (
                        <EmptyRow colSpan={5} text="Aún no hay turnos registrados." />
                    )}
                </TableBody>
            </Table>
        </PanelShell>
    );
}

function TurnoRow({ turno }: { turno: Turno }) {
    const form = useForm({
        nombre: turno.nombre,
        hora_inicio: turno.hora_inicio ?? '',
        hora_fin: turno.hora_fin ?? '',
    });

    const guardar = () => {
        form.patch(updateTurno.url(turno.id_turno.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar el turno.'),
        });
    };

    return (
        <TableRow>
            <TableCell>
                <Input value={form.data.nombre} onChange={(event) => form.setData('nombre', event.target.value)} />
                <InputError message={form.errors.nombre} />
            </TableCell>
            <TableCell>
                <Input
                    type="time"
                    value={form.data.hora_inicio}
                    onChange={(event) => form.setData('hora_inicio', event.target.value)}
                />
                <InputError message={form.errors.hora_inicio} />
            </TableCell>
            <TableCell>
                <Input
                    type="time"
                    value={form.data.hora_fin}
                    onChange={(event) => form.setData('hora_fin', event.target.value)}
                />
                <InputError message={form.errors.hora_fin} />
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="rounded-full">
                    {turno.matriculas_count ?? 0}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <RowActions
                    onSave={guardar}
                    saving={form.processing}
                    onDelete={() =>
                        eliminarRecurso(destroyTurno.url(turno.id_turno.toString()), '¿Eliminar turno?', turno.nombre)
                    }
                />
            </TableCell>
        </TableRow>
    );
}

// --------------------------------------------------------------- Periodos
function PeriodosPanel({ periodos }: { periodos: Periodo[] }) {
    const form = useForm({ nombre: '', anio: new Date().getFullYear().toString(), descripcion: '', estado: 'ABIERTO' });

    const crear = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(storePeriodo.url(), {
            preserveScroll: true,
            onSuccess: () => form.reset('nombre', 'descripcion'),
            onError: () => toast.error('Revisa los datos del periodo.'),
        });
    };

    return (
        <PanelShell
            icon={Building2}
            title="Periodos académicos"
            description="Periodos a los que se asocian ciclos y matrículas."
        >
            <form onSubmit={crear} className="grid gap-4 border-b p-5 sm:grid-cols-2">
                <div>
                    <Label htmlFor="periodo_nombre">Nombre *</Label>
                    <Input
                        id="periodo_nombre"
                        value={form.data.nombre}
                        onChange={(event) => form.setData('nombre', event.target.value)}
                        placeholder="Periodo 2026-II"
                    />
                    <InputError message={form.errors.nombre} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="periodo_anio">Año *</Label>
                        <Input
                            id="periodo_anio"
                            type="number"
                            min="2000"
                            max="2100"
                            value={form.data.anio}
                            onChange={(event) => form.setData('anio', event.target.value)}
                        />
                        <InputError message={form.errors.anio} />
                    </div>
                    <div>
                        <Label>Estado *</Label>
                        <Select value={form.data.estado} onValueChange={(value) => form.setData('estado', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ABIERTO">Abierto</SelectItem>
                                <SelectItem value="CERRADO">Cerrado</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.estado} />
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="periodo_descripcion">Descripción</Label>
                    <Input
                        id="periodo_descripcion"
                        value={form.data.descripcion}
                        onChange={(event) => form.setData('descripcion', event.target.value)}
                    />
                    <InputError message={form.errors.descripcion} />
                </div>
                <div>
                    <Button type="submit" className="bg-[#ff7043] hover:bg-[#f4511e]" disabled={form.processing}>
                        <Plus className="size-4" />
                        Agregar periodo
                    </Button>
                </div>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-24">Año</TableHead>
                        <TableHead className="w-36">Estado</TableHead>
                        <TableHead className="w-24">Ciclos</TableHead>
                        <TableHead className="w-44 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {periodos.length > 0 ? (
                        periodos.map((periodo) => <PeriodoRow key={periodo.id_periodo} periodo={periodo} />)
                    ) : (
                        <EmptyRow colSpan={5} text="Aún no hay periodos registrados." />
                    )}
                </TableBody>
            </Table>
        </PanelShell>
    );
}

function PeriodoRow({ periodo }: { periodo: Periodo }) {
    const form = useForm({
        nombre: periodo.nombre,
        anio: periodo.anio.toString(),
        descripcion: periodo.descripcion ?? '',
        estado: periodo.estado,
    });

    const guardar = () => {
        form.patch(updatePeriodo.url(periodo.id_periodo.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar el periodo.'),
        });
    };

    return (
        <TableRow>
            <TableCell>
                <Input value={form.data.nombre} onChange={(event) => form.setData('nombre', event.target.value)} />
                <InputError message={form.errors.nombre} />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.data.anio}
                    onChange={(event) => form.setData('anio', event.target.value)}
                />
                <InputError message={form.errors.anio} />
            </TableCell>
            <TableCell>
                <Select value={form.data.estado} onValueChange={(value) => form.setData('estado', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ABIERTO">Abierto</SelectItem>
                        <SelectItem value="CERRADO">Cerrado</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="rounded-full">
                    {periodo.ciclos_count ?? 0}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <RowActions
                    onSave={guardar}
                    saving={form.processing}
                    onDelete={() =>
                        eliminarRecurso(
                            destroyPeriodo.url(periodo.id_periodo.toString()),
                            '¿Eliminar periodo?',
                            periodo.nombre,
                        )
                    }
                />
            </TableCell>
        </TableRow>
    );
}

// --------------------------------------------------------------- Colegios
function ColegiosPanel({ colegios }: { colegios: Colegio[] }) {
    const form = useForm({ nombre: '' });

    const crear = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(storeColegio.url(), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
            onError: () => toast.error('Revisa el nombre del colegio.'),
        });
    };

    return (
        <PanelShell
            icon={School}
            title="Colegios de procedencia"
            description="Instituciones de las que provienen los alumnos."
        >
            <form onSubmit={crear} className="grid gap-4 border-b p-5 sm:grid-cols-[1fr_auto]">
                <div>
                    <Label htmlFor="colegio_nombre">Nombre *</Label>
                    <Input
                        id="colegio_nombre"
                        value={form.data.nombre}
                        onChange={(event) => form.setData('nombre', event.target.value)}
                        placeholder="Colegio Nacional San José"
                    />
                    <InputError message={form.errors.nombre} />
                </div>
                <Button type="submit" className="self-end bg-[#ff7043] hover:bg-[#f4511e]" disabled={form.processing}>
                    <Plus className="size-4" />
                    Agregar
                </Button>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-28">Alumnos</TableHead>
                        <TableHead className="w-44 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {colegios.length > 0 ? (
                        colegios.map((colegio) => <ColegioRow key={colegio.id_colegio_procedencia} colegio={colegio} />)
                    ) : (
                        <EmptyRow colSpan={3} text="Aún no hay colegios registrados." />
                    )}
                </TableBody>
            </Table>
        </PanelShell>
    );
}

function ColegioRow({ colegio }: { colegio: Colegio }) {
    const form = useForm({ nombre: colegio.nombre });

    const guardar = () => {
        form.patch(updateColegio.url(colegio.id_colegio_procedencia.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar el colegio.'),
        });
    };

    return (
        <TableRow>
            <TableCell>
                <Input value={form.data.nombre} onChange={(event) => form.setData('nombre', event.target.value)} />
                <InputError message={form.errors.nombre} />
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="rounded-full">
                    {colegio.alumnos_count ?? 0}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <RowActions
                    onSave={guardar}
                    saving={form.processing}
                    onDelete={() =>
                        eliminarRecurso(
                            destroyColegio.url(colegio.id_colegio_procedencia.toString()),
                            '¿Eliminar colegio?',
                            colegio.nombre,
                        )
                    }
                />
            </TableCell>
        </TableRow>
    );
}

// ----------------------------------------------------------------- Shared
function RowActions({
    onSave,
    saving,
    onDelete,
}: {
    onSave: () => void;
    saving: boolean;
    onDelete: () => void;
}) {
    return (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onSave} disabled={saving}>
                <Save className="size-4" />
                Guardar
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="py-10 text-center text-slate-500">
                {text}
            </TableCell>
        </TableRow>
    );
}
