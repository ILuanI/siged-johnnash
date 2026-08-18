import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExamenInfo {
    id_examen: number;
    tipo: string;
    numero: number | null;
    descripcion: string | null;
    area: string | null;
}

interface AlumnoInfo {
    nombre: string;
    dni: string | null;
}

interface ResultadoInfo {
    id_resultado: number;
    puntaje: number;
    puntaje_posible: number;
    porcentaje: number;
    puesto: number | null;
    correctas: number;
    incorrectas: number;
}

interface RespuestaFila {
    numero: number;
    respuesta: string;
    clave_correcta: string;
    puntos: number;
    marca: string;
    correcta: boolean;
}

interface Props {
    examen: ExamenInfo;
    alumno: AlumnoInfo;
    resultado: ResultadoInfo;
    respuestas: RespuestaFila[];
}

export default function NotasResultado({
    examen,
    alumno,
    resultado,
    respuestas,
}: Props) {
    return (
        <>
            <Head title={`Resultado - ${alumno.nombre}`} />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/notas/${examen.id_examen}`}
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {alumno.nombre}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {examen.tipo} {examen.numero ? `#${examen.numero}` : ''} ·{' '}
                                {examen.descripcion}
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
                {/* Resumen del alumno */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <ResumenCard label="Puntaje" value={resultado.puntaje.toFixed(2)} color="blue" />
                    <ResumenCard
                        label="Puntaje Posible"
                        value={(resultado.puntaje_posible ?? 0).toFixed(2)}
                        color="slate"
                    />
                    <ResumenCard
                        label="Porcentaje"
                        value={`${resultado.porcentaje.toFixed(1)}%`}
                        color="purple"
                    />
                    <ResumenCard
                        label="Puesto"
                        value={resultado.puesto ? `#${resultado.puesto}` : '—'}
                        color="emerald"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">
                            Resumen de Respuestas
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
                                <CheckCircle2 className="size-5 text-emerald-600" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">
                                        Correctas
                                    </p>
                                    <p className="text-lg font-bold text-emerald-700">
                                        {resultado.correctas}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3">
                                <XCircle className="size-5 text-amber-600" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">
                                        Incorrectas
                                    </p>
                                    <p className="text-lg font-bold text-amber-700">
                                        {resultado.incorrectas}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">
                            DNI:{' '}
                            <span className="font-mono font-medium text-slate-700">
                                {alumno.dni ?? '—'}
                            </span>
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-lg font-semibold text-slate-900">
                            Detalle por Pregunta
                        </h2>
                        <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                                    <tr className="text-left text-xs text-slate-500">
                                        <th className="px-3 py-2">N°</th>
                                        <th className="px-3 py-2">Resp.</th>
                                        <th className="px-3 py-2">Clave</th>
                                        <th className="px-3 py-2 text-right">Pts.</th>
                                        <th className="px-3 py-2 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {respuestas.map((r) => (
                                        <tr
                                            key={r.numero}
                                            className="border-t hover:bg-slate-50/50"
                                        >
                                            <td className="px-3 py-2 font-bold text-slate-500">
                                                {r.numero}
                                            </td>
                                            <td className="px-3 py-2 font-mono font-medium text-slate-800">
                                                {r.respuesta || '—'}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-slate-500">
                                                {r.clave_correcta || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right text-slate-600">
                                                {r.puntos}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {r.correcta ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                        <CheckCircle2 className="size-3" /> OK
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                                        <XCircle className="size-3" /> Error
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

function ResumenCard({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: 'slate' | 'blue' | 'emerald' | 'purple';
}) {
    const colors: Record<string, string> = {
        slate: 'bg-slate-100 text-slate-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className={cn('mb-2 inline-flex rounded-lg p-2', colors[color])}>
                <span className="text-xs font-semibold uppercase text-slate-500">
                    {label}
                </span>
            </div>
            <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
    );
}

NotasResultado.layout = {
    breadcrumbs: [
        { title: 'Notas', href: '/notas' },
        { title: 'Resultados', href: '#' },
    ],
};
