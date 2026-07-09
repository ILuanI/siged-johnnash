import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Plus,
    Search,
    Settings2,
    UserPlus,
    Download,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
    index as catalogoIndex,
    storeCarrera,
} from '@/actions/App/Http/Controllers/Matriculas/CatalogoAcademicoController';
import {
    index as estudiantesIndex,
    store as storeEstudiante,
} from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
import InputError from '@/components/input-error';
import { StudentProfileModal } from '@/components/matriculas/student-profile-modal';
import { SemaforoPagos } from '@/components/pagos/SemaforoPagos';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
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
import { useInitials } from '@/hooks/use-initials';
import { estadoBadgeClass } from '@/lib/matriculas';
import { cn } from '@/lib/utils';
import type {
    CarreraOption,
    ConsolidadoAlumno,
    EstudianteListItem,
} from '@/types/matriculas';

type Area = {
    id_area: number;
    nombre: string;
    codigo: string;
};

type ColegioProcedencia = {
    id_colegio_procedencia: number;
    nombre: string;
};

type PageProps = {
    estudiantes: EstudianteListItem[];
    consolidado: ConsolidadoAlumno | null;
    alumnoId: number | null;
    carreras: CarreraOption[];
    areas: Area[];
    colegios: ColegioProcedencia[];
    filters: { q?: string; filtro?: string; sort?: 'asc' | 'desc' };
};

export default function EstudiantesIndex({
    estudiantes,
    consolidado,
    alumnoId,
    carreras = [],
    areas = [],
    colegios = [],
    filters = {},
}: PageProps) {
    const getInitials = useInitials();
    const [busqueda, setBusqueda] = useState(filters.q ?? '');
    const [filtroEstado, setFiltroEstado] = useState(filters.filtro ?? 'todos');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
        filters.sort ?? 'asc',
    );

    // Estado del modal de estudiante
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            nombres: '',
            apellidos: '',
            dni: '',
            fecha_nac: '',
            sexo: '',
            id_carrera: '',
            telefono: '',
            colegio_procedencia_id: '',
            apoderado: {
                nombres: '',
                telefono: '',
            },
        });

    // Estado del sub-modal de carrera
    const [isCarreraDialogOpen, setIsCarreraDialogOpen] = useState(false);
    const [carreraNombre, setCarreraNombre] = useState('');
    const [carreraAreaId, setCarreraAreaId] = useState('');
    const [carreraPuntajeMin, setCarreraPuntajeMin] = useState('');
    const [carreraPuntajeMax, setCarreraPuntajeMax] = useState('');
    const [carreraErrors, setCarreraErrors] = useState<Record<string, string>>(
        {},
    );
    const [carreraLoading, setCarreraLoading] = useState(false);

    const abrirPerfil = (id: number) => {
        router.get(
            estudiantesIndex.url(),
            {
                alumno: id,
                q: filters.q || undefined,
                filtro: filters.filtro || undefined,
                sort: filters.sort || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const cerrarPerfil = () => {
        router.get(
            estudiantesIndex.url(),
            {
                q: filters.q || undefined,
                filtro: filters.filtro || undefined,
                sort: filters.sort || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const actualizarLista = (q: string, filtro: string, sort: string) => {
        router.get(
            estudiantesIndex.url(),
            {
                q: q || undefined,
                filtro: filtro !== 'todos' ? filtro : undefined,
                sort: sort !== 'asc' ? sort : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const buscar = (e: FormEvent) => {
        e.preventDefault();
        actualizarLista(busqueda, filtroEstado, sortOrder);
    };

    const onFiltroChange = (val: string) => {
        setFiltroEstado(val);
        actualizarLista(busqueda, val, sortOrder);
    };

    const toggleSort = () => {
        const newSort = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSort);
        // Actualizamos la URL sin recargar datos pesados para que sea instantáneo
        router.get(
            estudiantesIndex.url(),
            {
                q: busqueda || undefined,
                filtro: filtroEstado !== 'todos' ? filtroEstado : undefined,
                sort: newSort !== 'asc' ? newSort : undefined,
            },
            { preserveState: true, preserveScroll: true, only: ['filters'] },
        );
    };

    const sortedEstudiantes = useMemo(() => {
        return [...estudiantes].sort((a, b) => {
            const nameA = `${a.apellidos} ${a.nombres}`.toLowerCase();
            const nameB = `${b.apellidos} ${b.nombres}`.toLowerCase();
            if (sortOrder === 'asc') {
                return nameA.localeCompare(nameB);
            }
            return nameB.localeCompare(nameA);
        });
    }, [estudiantes, sortOrder]);

    const openCreateDialog = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const submitEstudiante = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeEstudiante.url(), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
            onError: (errs) => {
                Object.values(errs).forEach((message) => toast.error(message));
            },
        });
    };

    const handleCreateCarrera = (e: React.FormEvent) => {
        e.preventDefault();
        setCarreraLoading(true);
        setCarreraErrors({});

        router.post(
            storeCarrera.url(),
            {
                nombre: carreraNombre,
                id_area: carreraAreaId,
                puntaje_min: carreraPuntajeMin || null,
                puntaje_max: carreraPuntajeMax || null,
            },
            {
                onSuccess: () => {
                    setIsCarreraDialogOpen(false);
                    setCarreraNombre('');
                    setCarreraAreaId('');
                    setCarreraPuntajeMin('');
                    setCarreraPuntajeMax('');
                    toast.success('Carrera creada exitosamente');
                },
                onError: (errs) => {
                    setCarreraErrors(errs as Record<string, string>);
                    Object.values(errs).forEach((message) =>
                        toast.error(message),
                    );
                },
                onFinish: () => setCarreraLoading(false),
                preserveState: true,
            },
        );
    };

    return (
        <>
            <Head title="Estudiantes" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Directorio de Estudiantes
                        </h1>
                        <p className="text-sm text-slate-500">
                            {estudiantes.length} estudiante
                            {estudiantes.length !== 1 ? 's' : ''} registrado
                            {estudiantes.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={catalogoIndex.url()}>
                                <Settings2 className="size-4" />
                                Catálogo académico
                            </Link>
                        </Button>
                        <Button
                            onClick={openCreateDialog}
                            className="bg-[#ff7043] hover:bg-[#f4511e]"
                        >
                            <UserPlus className="size-4" />
                            Nuevo estudiante
                        </Button>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <form
                        onSubmit={buscar}
                        className="relative max-w-xl flex-1"
                    >
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, DNI o código…"
                            className="border-slate-200 bg-slate-50 pl-10"
                        />
                    </form>

                    <Select value={filtroEstado} onValueChange={onFiltroChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">
                                Todos los alumnos
                            </SelectItem>
                            <SelectItem value="matriculados">
                                Matriculados
                            </SelectItem>
                            <SelectItem value="activos">
                                Solo activos
                            </SelectItem>
                            <SelectItem value="al_dia">
                                Al día en pagos
                            </SelectItem>
                            <SelectItem value="vencidos">
                                Con pagos vencidos
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={toggleSort}
                        className="flex items-center gap-2"
                    >
                        {sortOrder === 'asc' ? (
                            <>
                                <ArrowDown className="size-4" />
                                <span>Ordenar A-Z</span>
                            </>
                        ) : (
                            <>
                                <ArrowUp className="size-4" />
                                <span>Ordenar Z-A</span>
                            </>
                        )}
                    </Button>
                </div>
            </header>

            <div className="flex-1 px-8 py-6">
                {estudiantes.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center">
                        <p className="text-slate-600">
                            No hay estudiantes que coincidan con la búsqueda.
                        </p>
                        <Button
                            onClick={openCreateDialog}
                            className="mt-4"
                            variant="outline"
                        >
                            Registrar primer estudiante
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {sortedEstudiantes.map((estudiante) => (
                            <li key={estudiante.id_alumno}>
                                <div
                                    className={cn(
                                        'group relative flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition hover:border-[#ff7043]/40 hover:shadow-sm cursor-pointer',
                                        alumnoId === estudiante.id_alumno &&
                                            'border-[#ff7043] ring-1 ring-[#ff7043]/30',
                                    )}
                                >
                                    {/* Botón invisible superpuesto para abrir el perfil */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            abrirPerfil(estudiante.id_alumno)
                                        }
                                        className="absolute inset-0 z-0"
                                        aria-label={`Ver perfil de ${estudiante.nombres}`}
                                    />
                                    
                                    <Avatar className="z-10 size-12 pointer-events-none">
                                        <AvatarFallback className="bg-[#1a237e]/10 text-[#1a237e]">
                                            {getInitials(
                                                `${estudiante.nombres} ${estudiante.apellidos}`,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="z-10 min-w-0 flex-1 pointer-events-none">
                                        <p className="truncate font-semibold text-slate-900">
                                            {estudiante.apellidos},{' '}
                                            {estudiante.nombres}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {estudiante.dni
                                                ? `DNI ${estudiante.dni}`
                                                : ''}
                                        </p>
                                    </div>
                                    
                                    <div className="z-10 flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-2 pointer-events-none">
                                            <Badge
                                                className={cn(
                                                    'shrink-0 rounded-full text-xs uppercase',
                                                    estadoBadgeClass(
                                                        estudiante.estado,
                                                    ),
                                                )}
                                            >
                                                {estudiante.estado}
                                            </Badge>
                                            {estudiante.cuotas &&
                                                estudiante.cuotas.length > 0 && (
                                                    <SemaforoPagos
                                                        cuotas={
                                                            estudiante.cuotas as any
                                                        }
                                                    />
                                                )}
                                        </div>
                                        
                                        <Button
                                            asChild
                                            size="icon"
                                            variant="ghost"
                                            className="relative z-20 shrink-0 text-slate-400 opacity-100 hover:text-[#1a237e] hover:bg-[#1a237e]/10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                            title="Descargar Perfil 360°"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <a href={`/matriculas/estudiantes/${estudiante.id_alumno}/pdf`} target="_blank" rel="noreferrer">
                                                <Download className="size-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {consolidado && alumnoId && (
                <StudentProfileModal
                    key={alumnoId}
                    open
                    consolidado={consolidado}
                    carreras={carreras}
                    onClose={cerrarPerfil}
                />
            )}

            {/* Modal para Registrar Estudiante */}
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Registrar estudiante</DialogTitle>
                        <DialogDescription>
                            El código del alumno será su DNI.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={submitEstudiante}
                        className="space-y-6 pt-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="nombres">Nombres *</Label>
                                <Input
                                    id="nombres"
                                    value={data.nombres}
                                    onChange={(e) =>
                                        setData('nombres', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.nombres} />
                            </div>
                            <div>
                                <Label htmlFor="apellidos">Apellidos *</Label>
                                <Input
                                    id="apellidos"
                                    value={data.apellidos}
                                    onChange={(e) =>
                                        setData('apellidos', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.apellidos} />
                            </div>
                            <div>
                                <Label htmlFor="dni">DNI *</Label>
                                <Input
                                    id="dni"
                                    value={data.dni}
                                    onChange={(e) =>
                                        setData(
                                            'dni',
                                            e.target.value.replace(/\D/g, ''),
                                        )
                                    }
                                    maxLength={8}
                                    pattern="\d{8}"
                                    required
                                />
                                <InputError message={errors.dni} />
                            </div>
                            <div>
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input
                                    id="telefono"
                                    value={data.telefono}
                                    onChange={(e) =>
                                        setData('telefono', e.target.value)
                                    }
                                />
                                <InputError message={errors.telefono} />
                            </div>
                            <div>
                                <Label htmlFor="fecha_nac">
                                    Fecha de nacimiento
                                </Label>
                                <Input
                                    id="fecha_nac"
                                    type="date"
                                    value={data.fecha_nac}
                                    onChange={(e) =>
                                        setData('fecha_nac', e.target.value)
                                    }
                                />
                                <InputError message={errors.fecha_nac} />
                            </div>
                            <div>
                                <Label htmlFor="sexo">Sexo</Label>
                                <Select
                                    value={data.sexo}
                                    onValueChange={(val) =>
                                        setData('sexo', val)
                                    }
                                >
                                    <SelectTrigger id="sexo">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">M</SelectItem>
                                        <SelectItem value="F">F</SelectItem>
                                        <SelectItem value="OTRO">
                                            Otro
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.sexo} />
                            </div>
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <Label
                                        htmlFor="id_carrera"
                                        className="mb-0"
                                    >
                                        Carrera
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() =>
                                            setIsCarreraDialogOpen(true)
                                        }
                                        className="flex h-auto items-center p-0 text-xs text-[#ff7043] hover:text-[#f4511e]"
                                    >
                                        <Plus className="mr-1 size-3" />
                                        Nueva carrera
                                    </Button>
                                </div>
                                <Combobox
                                    id="id_carrera"
                                    value={data.id_carrera}
                                    onChange={(val) =>
                                        setData('id_carrera', val)
                                    }
                                    placeholder="Sin carrera"
                                    searchPlaceholder="Buscar carrera…"
                                    emptyText="Sin carreras registradas."
                                    createLabel="Nueva carrera"
                                    onCreate={(query) => {
                                        setCarreraNombre(query);
                                        setIsCarreraDialogOpen(true);
                                    }}
                                    options={carreras.map((carrera) => ({
                                        value: carrera.id_carrera.toString(),
                                        label: carrera.area
                                            ? `${carrera.nombre} (Área ${carrera.area.codigo})`
                                            : carrera.nombre,
                                        keywords: carrera.area?.nombre ?? '',
                                    }))}
                                />
                                <InputError message={errors.id_carrera} />
                            </div>
                            <div>
                                <Label htmlFor="colegio_procedencia_id">
                                    Colegio de procedencia
                                </Label>
                                <Combobox
                                    id="colegio_procedencia_id"
                                    value={data.colegio_procedencia_id}
                                    onChange={(val) =>
                                        setData('colegio_procedencia_id', val)
                                    }
                                    placeholder="Sin colegio registrado"
                                    searchPlaceholder="Buscar colegio…"
                                    emptyText="Sin colegios. Agrégalos en Configuración."
                                    options={colegios.map((colegio) => ({
                                        value: colegio.id_colegio_procedencia.toString(),
                                        label: colegio.nombre,
                                    }))}
                                />
                                <InputError
                                    message={errors.colegio_procedencia_id}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-5">
                            <p className="text-sm font-medium text-slate-700">
                                Apoderado
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="apoderado_nombres">
                                        Nombre
                                    </Label>
                                    <Input
                                        id="apoderado_nombres"
                                        value={data.apoderado.nombres}
                                        onChange={(e) =>
                                            setData('apoderado', {
                                                ...data.apoderado,
                                                nombres: e.target.value,
                                            })
                                        }
                                    />
                                    <InputError
                                        message={errors['apoderado.nombres']}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="apoderado_telefono">
                                        Teléfono
                                    </Label>
                                    <Input
                                        id="apoderado_telefono"
                                        value={data.apoderado.telefono}
                                        onChange={(e) =>
                                            setData('apoderado', {
                                                ...data.apoderado,
                                                telefono: e.target.value,
                                            })
                                        }
                                    />
                                    <InputError
                                        message={errors['apoderado.telefono']}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#ff7043] hover:bg-[#f4511e]"
                            >
                                Registrar estudiante
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Sub-modal para Nueva Carrera */}
            <Dialog
                open={isCarreraDialogOpen}
                onOpenChange={setIsCarreraDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Nueva carrera</DialogTitle>
                        <DialogDescription>
                            Registra una carrera para asociarla a los
                            estudiantes.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCarrera}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="carrera_nombre">Nombre *</Label>
                                <Input
                                    id="carrera_nombre"
                                    value={carreraNombre}
                                    onChange={(e) =>
                                        setCarreraNombre(e.target.value)
                                    }
                                    required
                                />
                                {carreraErrors.nombre && (
                                    <p className="text-sm text-destructive">
                                        {carreraErrors.nombre}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="carrera_area">Área *</Label>
                                <Select
                                    value={carreraAreaId}
                                    onValueChange={setCarreraAreaId}
                                >
                                    <SelectTrigger id="carrera_area">
                                        <SelectValue placeholder="Selecciona un área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.length > 0 ? (
                                            areas.map((area) => (
                                                <SelectItem
                                                    key={area.id_area}
                                                    value={area.id_area.toString()}
                                                >
                                                    Área {area.codigo} -{' '}
                                                    {area.nombre}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem
                                                value="sin-areas"
                                                disabled
                                            >
                                                Sin áreas registradas
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {carreraErrors.id_area && (
                                    <p className="text-sm text-destructive">
                                        {carreraErrors.id_area}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="puntaje_min">
                                        Puntaje min.
                                    </Label>
                                    <Input
                                        id="puntaje_min"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="20"
                                        value={carreraPuntajeMin}
                                        onChange={(e) =>
                                            setCarreraPuntajeMin(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="puntaje_max">
                                        Puntaje max.
                                    </Label>
                                    <Input
                                        id="puntaje_max"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="20"
                                        value={carreraPuntajeMax}
                                        onChange={(e) =>
                                            setCarreraPuntajeMax(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCarreraDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={carreraLoading}
                                className="bg-[#ff7043] hover:bg-[#f4511e]"
                            >
                                {carreraLoading
                                    ? 'Creando...'
                                    : 'Crear carrera'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
