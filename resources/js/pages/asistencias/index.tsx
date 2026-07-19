import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { upsert as marcarAsistencia } from '@/actions/App/Http/Controllers/Asistencias/AsistenciaController';
import LectorAsistencia from '@/components/LectorAsistencia';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermisos } from '@/hooks/use-permisos';
import AppLayout from '@/layouts/app-layout';
import { index as asistenciasIndex } from '@/routes/asistencias/index';

type EstadoAsistencia = 'ASISTIO' | 'TARDANZA' | 'FALTO' | 'JUSTIFICADO';

interface Asistencia {
    id_asistencia: number;
    fecha: string;
    estado: EstadoAsistencia;
}

interface Alumno {
    id_alumno: number;
    dni: string;
    nombres: string;
    apellidos: string;
    asistencias: Asistencia[];
}

interface AsignacionOption {
    id_asignacion: number;
    etiqueta: string;
}

interface AsistenciasProps {
    alumnos: {
        data: Alumno[];
        links: unknown[];
    };
    catalogos: {
        areas: { id_area: number; nombre: string }[];
        carreras: { id_carrera: number; nombre: string }[];
        ciclos: { id_ciclo: number; nombre: string }[];
        cursos: { id_curso: number; nombre: string }[];
        asignaciones: AsignacionOption[];
    };
    filtros: {
        busqueda: string;
        periodo: string;
        fecha_inicio: string;
        fecha_fin: string;
        id_area?: string | number;
        id_carrera?: string | number;
        id_ciclo?: string | number;
        id_curso?: string | number;
    };
}

const ESTADOS: EstadoAsistencia[] = [
    'ASISTIO',
    'TARDANZA',
    'FALTO',
    'JUSTIFICADO',
];

export default function AsistenciasIndex({
    alumnos,
    catalogos,
    filtros,
}: AsistenciasProps) {
    const { puede } = usePermisos();
    const puedeEditar = puede('asistencias', 'editar');
    const [activeTab, setActiveTab] = useState<'lector' | 'detalle'>('lector');
    const [busqueda, setBusqueda] = useState(filtros.busqueda || '');
    const [customStartDate, setCustomStartDate] = useState(
        filtros.periodo === 'personalizado' ? filtros.fecha_inicio : '',
    );
    const [customEndDate, setCustomEndDate] = useState(
        filtros.periodo === 'personalizado' ? filtros.fecha_fin : '',
    );
    const [marcando, setMarcando] = useState<string | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (busqueda !== (filtros.busqueda || '')) {
                router.get(
                    asistenciasIndex.url(),
                    { ...filtros, busqueda },
                    { preserveState: true, replace: true },
                );
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [busqueda]);

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            asistenciasIndex.url(),
            { ...filtros, busqueda, [key]: value },
            { preserveState: true, replace: true },
        );
    };

    const handlePeriodoChange = (periodo: string) => {
        if (periodo === 'personalizado') {
            router.get(
                asistenciasIndex.url(),
                {
                    ...filtros,
                    busqueda,
                    periodo,
                    fecha_inicio: customStartDate || filtros.fecha_inicio,
                    fecha_fin: customEndDate || filtros.fecha_fin,
                },
                { preserveState: true, replace: true },
            );
        } else {
            router.get(
                asistenciasIndex.url(),
                { ...filtros, busqueda, periodo },
                { preserveState: true, replace: true },
            );
        }
    };

    const handleCustomDateSearch = () => {
        if (customStartDate && customEndDate) {
            router.get(
                asistenciasIndex.url(),
                {
                    ...filtros,
                    busqueda,
                    periodo: 'personalizado',
                    fecha_inicio: customStartDate,
                    fecha_fin: customEndDate,
                },
                { preserveState: true, replace: true },
            );
        }
    };

    const startDate = new Date(filtros.fecha_inicio + 'T00:00:00');
    const endDate = new Date(filtros.fecha_fin + 'T00:00:00');
    const dates: Date[] = [];
    for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
    ) {
        dates.push(new Date(d));
    }

    const getEstadoAbreviado = (estado: string) => {
        switch (estado) {
            case 'ASISTIO':
                return {
                    label: 'A',
                    class: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
                };
            case 'FALTO':
                return {
                    label: 'F',
                    class: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
                };
            case 'TARDANZA':
                return {
                    label: 'T',
                    class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
                };
            case 'JUSTIFICADO':
                return {
                    label: 'J',
                    class: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
                };
            default:
                return { label: '?', class: 'bg-gray-100 text-gray-700' };
        }
    };

    const siguienteEstado = (
        actual?: EstadoAsistencia,
    ): EstadoAsistencia => {
        if (!actual) {
            return 'ASISTIO';
        }

        const index = ESTADOS.indexOf(actual);

        return ESTADOS[(index + 1) % ESTADOS.length];
    };

    const marcarCelda = (alumno: Alumno, dateStr: string, actual?: EstadoAsistencia) => {
        if (!puedeEditar || marcando) {
            return;
        }

        const estado = siguienteEstado(actual);
        const key = `${alumno.id_alumno}-${dateStr}`;
        setMarcando(key);

        router.post(
            marcarAsistencia.url(),
            {
                id_alumno: alumno.id_alumno,
                fecha: dateStr,
                estado,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(
                        firstError ?? 'No se pudo actualizar la asistencia.',
                    );
                },
                onFinish: () => setMarcando(null),
            },
        );
    };

    return (
        <>
            <Head title="Asistencias" />

            <div className="flex flex-col gap-6 p-6">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Control de Asistencias
                    </h1>
                    <p className="text-sm text-slate-500">
                        Registra con lector de DNI o marca manualmente en la
                        grilla (A → T → F → J).
                    </p>
                </header>

                <div className="flex items-center gap-2 border-b pb-4">
                    <Button
                        variant={activeTab === 'lector' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('lector')}
                    >
                        Lector de Código de Barras
                    </Button>
                    <Button
                        variant={activeTab === 'detalle' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('detalle')}
                    >
                        Detalles de Asistencia
                    </Button>
                </div>

                {activeTab === 'lector' && (
                    <div className="pt-4">
                        <LectorAsistencia
                            asignaciones={catalogos.asignaciones ?? []}
                        />
                    </div>
                )}

                {activeTab === 'detalle' && (
                    <div className="flex flex-col gap-4 pt-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <Input
                                    placeholder="Buscar por DNI o Nombre..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="max-w-[250px]"
                                />

                                <select
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_area || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'id_area',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Todas las Áreas</option>
                                    {catalogos.areas.map((a) => (
                                        <option
                                            key={a.id_area}
                                            value={a.id_area}
                                        >
                                            {a.nombre}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_carrera || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'id_carrera',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Todas las Carreras</option>
                                    {catalogos.carreras.map((c) => (
                                        <option
                                            key={c.id_carrera}
                                            value={c.id_carrera}
                                        >
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_ciclo || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'id_ciclo',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Todos los Ciclos</option>
                                    {catalogos.ciclos.map((c) => (
                                        <option
                                            key={c.id_ciclo}
                                            value={c.id_ciclo}
                                        >
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_curso || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'id_curso',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Todos los Cursos</option>
                                    {catalogos.cursos.map((c) => (
                                        <option
                                            key={c.id_curso}
                                            value={c.id_curso}
                                        >
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center justify-between rounded-md border bg-slate-50 p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        Periodo:
                                    </span>
                                    {(
                                        [
                                            'dia',
                                            'semana',
                                            'mes',
                                            'personalizado',
                                        ] as const
                                    ).map((periodo) => (
                                        <Button
                                            key={periodo}
                                            variant={
                                                filtros.periodo === periodo
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                handlePeriodoChange(periodo)
                                            }
                                            size="sm"
                                        >
                                            {periodo === 'dia'
                                                ? 'Día'
                                                : periodo === 'semana'
                                                  ? 'Semana'
                                                  : periodo === 'mes'
                                                    ? 'Mes'
                                                    : 'Personalizado'}
                                        </Button>
                                    ))}
                                </div>

                                {filtros.periodo === 'personalizado' && (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) =>
                                                setCustomStartDate(
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-sm"
                                        />
                                        <span className="text-sm">a</span>
                                        <Input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) =>
                                                setCustomEndDate(e.target.value)
                                            }
                                            className="h-8 text-sm"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleCustomDateSearch()
                                            }
                                        >
                                            Aplicar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {puedeEditar && (
                            <p className="text-xs text-slate-500">
                                Haz clic en una celda para marcar o ciclar el
                                estado: ASISTIÓ → TARDANZA → FALTÓ → JUSTIFICADO.
                            </p>
                        )}

                        <div className="mt-2 overflow-x-auto rounded-md border bg-white">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky left-0 z-10 min-w-[250px] bg-white shadow-[1px_0_0_0_#e2e8f0]">
                                            Estudiante
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">
                                            DNI
                                        </TableHead>
                                        {dates.map((date, idx) => (
                                            <TableHead
                                                key={idx}
                                                className="min-w-[40px] px-1 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs text-slate-500">
                                                        {date
                                                            .toLocaleDateString(
                                                                'es-ES',
                                                                {
                                                                    weekday:
                                                                        'short',
                                                                },
                                                            )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                    <span className="font-semibold">
                                                        {date.getDate()}
                                                    </span>
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alumnos.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={dates.length + 2}
                                                className="py-8 text-center text-slate-500"
                                            >
                                                No se encontraron alumnos
                                                registrados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        alumnos.data.map((alumno) => (
                                            <TableRow key={alumno.id_alumno}>
                                                <TableCell className="sticky left-0 z-10 bg-white font-medium shadow-[1px_0_0_0_#e2e8f0]">
                                                    {alumno.apellidos},{' '}
                                                    {alumno.nombres}
                                                </TableCell>
                                                <TableCell>
                                                    {alumno.dni}
                                                </TableCell>
                                                {dates.map((date, idx) => {
                                                    const dateStr = date
                                                        .toISOString()
                                                        .split('T')[0];
                                                    const asistencia =
                                                        alumno.asistencias.find(
                                                            (a) =>
                                                                a.fecha.startsWith(
                                                                    dateStr,
                                                                ),
                                                        );
                                                    const key = `${alumno.id_alumno}-${dateStr}`;
                                                    const busy =
                                                        marcando === key;

                                                    if (asistencia) {
                                                        const {
                                                            label,
                                                            class: className,
                                                        } = getEstadoAbreviado(
                                                            asistencia.estado,
                                                        );

                                                        return (
                                                            <TableCell
                                                                key={idx}
                                                                className="p-1 text-center"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        !puedeEditar ||
                                                                        busy
                                                                    }
                                                                    title={`${asistencia.estado}${puedeEditar ? ' — clic para cambiar' : ''}`}
                                                                    onClick={() =>
                                                                        marcarCelda(
                                                                            alumno,
                                                                            dateStr,
                                                                            asistencia.estado,
                                                                        )
                                                                    }
                                                                    className="mx-auto"
                                                                >
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`flex h-7 w-7 items-center justify-center p-0 ${className} ${puedeEditar ? 'cursor-pointer' : ''}`}
                                                                    >
                                                                        {busy
                                                                            ? '…'
                                                                            : label}
                                                                    </Badge>
                                                                </button>
                                                            </TableCell>
                                                        );
                                                    }

                                                    return (
                                                        <TableCell
                                                            key={idx}
                                                            className="p-1 text-center"
                                                        >
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    !puedeEditar ||
                                                                    busy
                                                                }
                                                                title={
                                                                    puedeEditar
                                                                        ? 'Clic para marcar ASISTIÓ'
                                                                        : 'Sin registro'
                                                                }
                                                                onClick={() =>
                                                                    marcarCelda(
                                                                        alumno,
                                                                        dateStr,
                                                                    )
                                                                }
                                                                className={`font-bold ${puedeEditar ? 'cursor-pointer text-slate-400 hover:text-[#ff7043]' : 'text-slate-300'}`}
                                                            >
                                                                {busy
                                                                    ? '…'
                                                                    : '-'}
                                                            </button>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AsistenciasIndex.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Asistencias', href: asistenciasIndex.url() },
        ]}
    >
        {page}
    </AppLayout>
);
