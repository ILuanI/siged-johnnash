import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Brain,
    GraduationCap,
    Percent,
    Users,
} from 'lucide-react';
import { index as estudiantesIndex } from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
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
import { cn } from '@/lib/utils';

type Resumen = {
    total: number;
    promedio_riesgo: number;
    alto: number;
    medio: number;
    bajo: number;
    prioritarios: number;
    ultima_actualizacion: string | null;
};

type Distribucion = {
    nivel: 'BAJO' | 'MEDIO' | 'ALTO';
    total: number;
};

type PrediccionPrioritaria = {
    id_prediccion: number;
    id_matricula: number;
    riesgo_pct: number;
    nivel_riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
    prioritario: boolean;
    tasa_asistencia: number | null;
    promedio_examenes: number | null;
    cuotas_vencidas: number | null;
    fecha_calculo: string | null;
    alumno: {
        id_alumno: number;
        codigo: string;
        dni: string | null;
        nombre_completo: string;
        telefono: string | null;
        carrera: {
            id_carrera: number;
            nombre: string;
            area: { codigo: string; nombre: string } | null;
        } | null;
    } | null;
    matricula: {
        ciclo: string | null;
        turno: string | null;
        aula: string | null;
    } | null;
};

type PageProps = {
    resumen: Resumen;
    distribucion: Distribucion[];
    prioritarios: PrediccionPrioritaria[];
    procesados: number;
};

export default function DesercionIaPage({
    resumen,
    distribucion,
    prioritarios,
    procesados,
}: PageProps) {
    return (
        <>
            <Head title="IA Deserción" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            IA de riesgo de deserción
                        </h1>
                        <p className="text-sm text-slate-500">
                            Cálculo basado en asistencia, notas y pagos
                            vencidos.
                        </p>
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                        {procesados} matrículas procesadas
                    </Badge>
                </div>
            </header>

            <main className="space-y-6 px-8 py-6">
                <section className="grid gap-4 md:grid-cols-4">
                    <MetricCard
                        icon={Users}
                        label="Evaluados"
                        value={resumen.total.toString()}
                    />
                    <MetricCard
                        icon={Percent}
                        label="Riesgo promedio"
                        value={`${resumen.promedio_riesgo.toFixed(1)}%`}
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        label="Prioritarios"
                        value={resumen.prioritarios.toString()}
                        tone="danger"
                    />
                    <MetricCard
                        icon={Brain}
                        label="Riesgo alto"
                        value={resumen.alto.toString()}
                        tone="warning"
                    />
                </section>

                <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <div className="rounded-lg border bg-white p-5">
                        <h2 className="text-base font-semibold text-slate-900">
                            Distribución
                        </h2>
                        <div className="mt-4 space-y-3">
                            {distribucion.map((item) => (
                                <div
                                    key={item.nivel}
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                >
                                    <Badge
                                        className={cn(
                                            'rounded-full',
                                            riesgoBadgeClass(item.nivel),
                                        )}
                                    >
                                        {item.nivel}
                                    </Badge>
                                    <span className="font-semibold text-slate-900">
                                        {item.total}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white">
                        <div className="flex items-center justify-between gap-3 border-b p-5">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Atención prioritaria
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Alumnos con riesgo mayor a 75%.
                                </p>
                            </div>
                            <Badge className="rounded-full bg-red-100 text-red-700 hover:bg-red-100">
                                {prioritarios.length} casos
                            </Badge>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Carrera</TableHead>
                                    <TableHead>Asistencia</TableHead>
                                    <TableHead>Promedio</TableHead>
                                    <TableHead>Cuotas</TableHead>
                                    <TableHead>Riesgo</TableHead>
                                    <TableHead className="text-right">
                                        Perfil
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prioritarios.length > 0 ? (
                                    prioritarios.map((prediccion) => (
                                        <TableRow
                                            key={prediccion.id_prediccion}
                                        >
                                            <TableCell>
                                                <div className="font-medium text-slate-900">
                                                    {prediccion.alumno
                                                        ?.nombre_completo ??
                                                        'Sin alumno'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    DNI{' '}
                                                    {prediccion.alumno?.dni ??
                                                        '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {prediccion.alumno?.carrera
                                                        ?.nombre ??
                                                        'Sin carrera'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {prediccion.alumno?.carrera
                                                        ?.area
                                                        ? `Área ${prediccion.alumno.carrera.area.codigo}`
                                                        : 'Sin área'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatPercent(
                                                    prediccion.tasa_asistencia,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatNumber(
                                                    prediccion.promedio_examenes,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {prediccion.cuotas_vencidas ??
                                                    0}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        'rounded-full',
                                                        riesgoBadgeClass(
                                                            prediccion.nivel_riesgo,
                                                        ),
                                                    )}
                                                >
                                                    {prediccion.riesgo_pct.toFixed(
                                                        1,
                                                    )}
                                                    %
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {prediccion.alumno && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={estudiantesIndex.url(
                                                                {
                                                                    query: {
                                                                        alumno: prediccion
                                                                            .alumno
                                                                            .id_alumno,
                                                                    },
                                                                },
                                                            )}
                                                        >
                                                            <GraduationCap className="size-4" />
                                                            Ver
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-10 text-center text-slate-500"
                                        >
                                            No hay alumnos en atención
                                            prioritaria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </main>
        </>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    tone = 'neutral',
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    tone?: 'neutral' | 'warning' | 'danger';
}) {
    return (
        <div className="rounded-lg border bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <Icon className={cn('size-5', iconToneClass(tone))} />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function iconToneClass(tone: 'neutral' | 'warning' | 'danger') {
    return {
        neutral: 'text-slate-400',
        warning: 'text-amber-500',
        danger: 'text-red-500',
    }[tone];
}

function riesgoBadgeClass(nivel: 'BAJO' | 'MEDIO' | 'ALTO') {
    return {
        BAJO: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
        MEDIO: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
        ALTO: 'bg-red-100 text-red-700 hover:bg-red-100',
    }[nivel];
}

function formatPercent(value: number | null) {
    return value === null ? 'Sin datos' : `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null) {
    return value === null ? 'Sin datos' : value.toFixed(2);
}
