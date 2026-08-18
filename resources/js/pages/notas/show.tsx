import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Users,
    Trophy,
    Target,
    CheckCircle2,
    XCircle,
    BarChart3,
} from 'lucide-react';
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

interface ExamenInfo {
    id_examen: number;
    tipo: 'SIMULACRO' | 'CONOCIMIENTO' | 'SEMANAL';
    numero: number | null;
    fecha: string;
    descripcion: string | null;
    ciclo: string | null;
    area: string | null;
    metricas: { area: string | null; puntaje_max: number; puntaje_min: number }[];
}

interface Resumen {
    alumnos: number;
    promedio: number;
    mejor: number;
    menor: number;
    porcentaje_promedio: number;
}

interface AlumnoFila {
    id_resultado: number;
    puesto: number | null;
    nombre: string;
    dni: string | null;
    puntaje: number;
    porcentaje: number;
}

interface PreguntaAnalisis {
    numero: number;
    clave_correcta: string;
    puntos: number;
    correctas: number;
    errores: number;
    porcentaje_correctas: number;
}

interface Props {
    examen: ExamenInfo;
    resumen: Resumen;
    alumnos: AlumnoFila[];
    preguntas: PreguntaAnalisis[];
    distribucion: Record<string, number>;
}

export default function NotasShow({
    examen,
    resumen,
    alumnos,
    preguntas,
    distribucion,
}: Props) {
    const maxDist = Math.max(1, ...Object.values(distribucion));

    return (
        <>
            <Head title={`Resultados - ${examen.descripcion ?? examen.tipo}`} />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/notas"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {examen.descripcion || 'Evaluación sin descripción'}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {examen.tipo} {examen.numero ? `#${examen.numero}` : ''} ·{' '}
                                {examen.ciclo} · {examen.fecha}
                                {examen.area ? ` · Área: ${examen.area}` : ''}
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={cn(
                            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase',
                            examen.tipo === 'SIMULACRO'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : examen.tipo === 'CONOCIMIENTO'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-purple-200 bg-purple-50 text-purple-700',
                        )}
                        variant="outline"
                    >
                        {examen.tipo}
                    </Badge>
                </div>
            </header>

            <main className="flex-1 space-y-6 px-8 py-6">
                {/* Resumen */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <ResumenCard
                        icon={<Users className="size-5" />}
                        label="Alumnos"
                        value={String(resumen.alumnos)}
                        color="slate"
                    />
                    <ResumenCard
                        icon={<BarChart3 className="size-5" />}
                        label="Promedio"
                        value={resumen.promedio.toFixed(2)}
                        color="blue"
                    />
                    <ResumenCard
                        icon={<Trophy className="size-5" />}
                        label="Mejor"
                        value={resumen.mejor.toFixed(2)}
                        color="emerald"
                    />
                    <ResumenCard
                        icon={<Target className="size-5" />}
                        label="Menor"
                        value={resumen.menor.toFixed(2)}
                        color="amber"
                    />
                    <ResumenCard
                        icon={<CheckCircle2 className="size-5" />}
                        label="% Promedio"
                        value={`${resumen.porcentaje_promedio.toFixed(1)}%`}
                        color="purple"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Tabla de alumnos */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">
                            Resultados por Alumno
                        </h2>
                        <div className="max-h-[520px] overflow-y-auto rounded-lg border">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Alumno</TableHead>
                                        <TableHead>DNI</TableHead>
                                        <TableHead className="text-right">Puntaje</TableHead>
                                        <TableHead className="text-right">%</TableHead>
                                        <TableHead className="text-right">Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alumnos.map((a) => (
                                        <TableRow key={a.id_resultado} className="hover:bg-slate-50/50">
                                            <TableCell className="font-bold text-slate-500">
                                                {a.puesto ?? '—'}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900">
                                                {a.nombre}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {a.dni ?? '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-slate-700">
                                                {a.puntaje.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-600">
                                                {a.porcentaje.toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={`/notas/${examen.id_examen}/resultado/${a.id_resultado}`}
                                                    className="inline-flex items-center rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                                >
                                                    Ver
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Distribución */}
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">
                            Distribución de Resultados
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(distribucion).map(([rango, cantidad]) => (
                                <div key={rango}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-medium text-slate-600">{rango}%</span>
                                        <span className="text-slate-500">{cantidad}</span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-[#ff7043]"
                                            style={{ width: `${(cantidad / maxDist) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {examen.metricas.length > 0 && (
                            <div className="mt-5 border-t pt-4">
                                <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Métricas por Área
                                </p>
                                <div className="space-y-2">
                                    {examen.metricas.map((m, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs"
                                        >
                                            <span className="font-semibold text-slate-700">
                                                {m.area ?? 'Área'}
                                            </span>
                                            <span className="text-emerald-600">
                                                Max {m.puntaje_max}
                                            </span>
                                            <span className="text-amber-600">
                                                Min {m.puntaje_min}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Análisis por pregunta */}
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900">
                        Análisis por Pregunta
                    </h2>
                    <div className="max-h-[480px] overflow-y-auto rounded-lg border">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                                <TableRow>
                                    <TableHead className="w-12">N°</TableHead>
                                    <TableHead>Clave</TableHead>
                                    <TableHead className="text-right">Puntos</TableHead>
                                    <TableHead className="text-right">Correctas</TableHead>
                                    <TableHead className="text-right">Errores</TableHead>
                                    <TableHead className="text-right">% Correctas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {preguntas.map((p) => (
                                    <TableRow key={p.numero} className="hover:bg-slate-50/50">
                                        <TableCell className="font-bold text-slate-500">
                                            {p.numero}
                                        </TableCell>
                                        <TableCell className="font-mono font-semibold text-slate-800">
                                            {p.clave_correcta || '—'}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-600">
                                            {p.puntos}
                                        </TableCell>
                                        <TableCell className="text-right text-emerald-600">
                                            {p.correctas}
                                        </TableCell>
                                        <TableCell className="text-right text-amber-600">
                                            {p.errores}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={cn(
                                                    'font-semibold',
                                                    p.porcentaje_correctas >= 60
                                                        ? 'text-emerald-600'
                                                        : 'text-amber-600',
                                                )}
                                            >
                                                {p.porcentaje_correctas}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
        </>
    );
}

function ResumenCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'slate' | 'blue' | 'emerald' | 'amber' | 'purple';
}) {
    const colors: Record<string, string> = {
        slate: 'bg-slate-100 text-slate-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', colors[color])}>{icon}</div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
                    <p className="text-xl font-bold text-slate-800">{value}</p>
                </div>
            </div>
        </div>
    );
}

NotasShow.layout = {
    breadcrumbs: [
        { title: 'Notas', href: '/notas' },
        { title: 'Resultados', href: '#' },
    ],
};
