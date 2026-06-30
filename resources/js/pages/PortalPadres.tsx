import { Head, router } from '@inertiajs/react';
import { GraduationCap, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { index as portalPadresIndex } from '@/routes/portal-padres';

type AlumnoPortal = {
    codigo: string;
    dni: string;
    nombres: string;
    apellidos: string;
    carrera: string | null;
    area: string | null;
    ciclo: string | null;
};

type AsistenciaPortal = {
    id_asistencia: number;
    fecha: string | null;
    hora: string | null;
    estado: string;
};

type SimulacroPortal = {
    id_resultado: number;
    fecha: string | null;
    simulacro: string;
    puntaje_total: number;
    puesto: number | null;
};

type PageProps = {
    alumno: AlumnoPortal | null;
    asistencias: AsistenciaPortal[];
    simulacros: SimulacroPortal[];
    filters: { dni?: string };
    mensaje: string | null;
};

export default function PortalPadres({
    alumno,
    asistencias,
    simulacros,
    filters,
    mensaje,
}: PageProps) {
    const [dni, setDni] = useState(filters.dni ?? '');
    const [processing, setProcessing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (dni.length !== 8) {
            return;
        }

        setProcessing(true);
        router.get(
            portalPadresIndex.url(),
            { dni },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Portal de Padres" />

            <header className="border-b bg-white px-6 py-5">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#ff7043] text-white">
                        <GraduationCap className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">
                            Portal de Padres
                        </h1>
                        <p className="text-xs font-medium text-slate-500">
                            Academia John Nash
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
                <form
                    onSubmit={submit}
                    className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-end"
                >
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="dni">DNI del alumno</Label>
                        <Input
                            id="dni"
                            value={dni}
                            inputMode="numeric"
                            maxLength={8}
                            onChange={(e) =>
                                setDni(
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 8),
                                )
                            }
                            placeholder="00000000"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={processing || dni.length !== 8}
                        className="bg-[#ff7043] hover:bg-[#f4511e]"
                    >
                        <Search className="size-4" />
                        Consultar
                    </Button>
                </form>

                {mensaje && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {mensaje}
                    </div>
                )}

                {alumno && (
                    <section className="rounded-lg border bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    {alumno.apellidos}, {alumno.nombres}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    DNI {alumno.dni} · Código {alumno.codigo}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-slate-200 bg-slate-50 text-slate-700"
                            >
                                {alumno.ciclo ?? 'Sin ciclo vigente'}
                            </Badge>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                            {alumno.carrera ?? 'Sin carrera'}{' '}
                            {alumno.area ? `· ${alumno.area}` : ''}
                        </p>
                    </section>
                )}

                {alumno && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="overflow-hidden rounded-lg border bg-white">
                            <div className="border-b px-4 py-3">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Últimas 5 asistencias
                                </h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead className="text-right">
                                            Estado
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {asistencias.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="py-8 text-center text-sm text-slate-500"
                                            >
                                                Sin asistencias registradas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        asistencias.map((asistencia) => (
                                            <TableRow
                                                key={asistencia.id_asistencia}
                                            >
                                                <TableCell>
                                                    {asistencia.fecha ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {asistencia.hora ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <EstadoAsistenciaBadge
                                                        estado={
                                                            asistencia.estado
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </section>

                        <section className="overflow-hidden rounded-lg border bg-white">
                            <div className="border-b px-4 py-3">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Últimos 3 simulacros
                                </h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Simulacro</TableHead>
                                        <TableHead className="text-right">
                                            Nota
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Puesto
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {simulacros.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-8 text-center text-sm text-slate-500"
                                            >
                                                Sin simulacros registrados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        simulacros.map((simulacro) => (
                                            <TableRow
                                                key={simulacro.id_resultado}
                                            >
                                                <TableCell>
                                                    {simulacro.fecha ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {simulacro.simulacro}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {simulacro.puntaje_total.toFixed(
                                                        3,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {simulacro.puesto ?? '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

function EstadoAsistenciaBadge({ estado }: { estado: string }) {
    const className =
        estado === 'ASISTIO'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : estado === 'TARDANZA'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-rose-200 bg-rose-50 text-rose-700';

    return (
        <Badge variant="outline" className={className}>
            {estado}
        </Badge>
    );
}
