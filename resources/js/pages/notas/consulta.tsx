import { Head, router } from '@inertiajs/react';
import {
    Search,
    GraduationCap,
    Calendar,
    Award,
    TrendingUp,
    User,
    BookOpen,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

interface AlumnoInfo {
    nombres: string;
    apellidos: string;
    dni: string;
    carrera: string;
    area: string;
    ciclo: string;
}

interface ResultadoInfo {
    id_resultado: number;
    tipo: 'SIMULACRO' | 'CONOCIMIENTO' | 'SEMANAL';
    numero: number | null;
    fecha: string;
    descripcion: string | null;
    puntaje_aptitud: number;
    puntaje_conocimiento: number;
    puntaje_total: number;
    puesto: number | null;
    max_area: number | null;
    min_area: number | null;
}

interface Props {
    alumno: AlumnoInfo | null;
    resultados: ResultadoInfo[];
    filters: {
        dni?: string;
    };
    mensaje: string | null;
}

export default function NotasConsulta({
    alumno,
    resultados,
    filters,
    mensaje,
}: Props) {
    const [dni, setDni] = useState(filters.dni || '');
    const [searching, setSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (dni.length !== 8 || isNaN(Number(dni))) {
            return;
        }

        setSearching(true);
        router.get(
            '/consulta-notas',
            { dni },
            {
                onFinish: () => setSearching(false),
                preserveState: true,
            },
        );
    };

    return (
        <div className="flex min-h-screen flex-col justify-between bg-slate-50">
            <Head title="Consulta de Notas - Academia John Nash" />

            {/* Public Header */}
            <header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ff7043] text-white shadow-md">
                            <GraduationCap className="size-6" />
                        </div>
                        <div>
                            <span className="block text-lg leading-tight font-bold text-slate-900">
                                Academia John Nash
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                Consulta de Notas y Simulacros
                            </span>
                        </div>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Portal Público
                    </span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Panel: Search & Profile */}
                    <div className="space-y-6 md:col-span-1">
                        {/* Search Card */}
                        <Card className="border-slate-200 bg-white shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-bold text-slate-900">
                                    Buscar Estudiante
                                </CardTitle>
                                <CardDescription>
                                    Ingresa el DNI del alumno para consultar su
                                    historial de notas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSearch}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="dni">
                                            DNI del Alumno
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="dni"
                                                type="text"
                                                maxLength={8}
                                                placeholder="Ej: 72717127"
                                                value={dni}
                                                onChange={(e) =>
                                                    setDni(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            '',
                                                        ),
                                                    )
                                                }
                                                className="pr-4 pl-9"
                                                required
                                            />
                                            <User className="absolute top-2.5 left-3 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={searching || dni.length !== 8}
                                        className="w-full bg-[#ff7043] text-white hover:bg-[#f4511e]"
                                    >
                                        <Search className="mr-2 size-4" />
                                        {searching
                                            ? 'Buscando...'
                                            : 'Consultar Notas'}
                                    </Button>
                                </form>

                                {mensaje && (
                                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">
                                        {mensaje}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Profile Card (if found) */}
                        {alumno && (
                            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                                <div className="h-2 bg-[#ff7043]" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Perfil del Estudiante
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <User className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-xs font-medium text-slate-400">
                                                Nombres y Apellidos
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {alumno.apellidos},{' '}
                                                {alumno.nombres}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <GraduationCap className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-xs font-medium text-slate-400">
                                                Carrera / Área
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {alumno.carrera}
                                            </span>
                                            <span className="block text-xs text-slate-500">
                                                Área {alumno.area}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <BookOpen className="mt-0.5 size-5 shrink-0 text-slate-400" />
                                        <div>
                                            <span className="block text-xs font-medium text-slate-400">
                                                Ciclo
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {alumno.ciclo}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Panel: Exam History */}
                    <div className="md:col-span-2">
                        {alumno ? (
                            <Card className="h-full border-slate-200 bg-white shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                        <TrendingUp className="size-5 text-[#ff7043]" />
                                        Historial de Simulacros y Exámenes
                                    </CardTitle>
                                    <CardDescription>
                                        Calificaciones y puestos obtenidos en el
                                        ciclo actual.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {resultados.length === 0 ? (
                                        <div className="rounded-xl border border-dashed p-12 text-center text-slate-500">
                                            Aún no hay calificaciones
                                            registradas para este estudiante en
                                            este ciclo.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead>
                                                            Fecha / Examen
                                                        </TableHead>
                                                        <TableHead className="text-center">
                                                            Puntaje
                                                        </TableHead>
                                                        <TableHead className="text-center">
                                                            Puesto en Área
                                                        </TableHead>
                                                        <TableHead>
                                                            Comparativa de Área
                                                            (Máx / Mín)
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {resultados.map((res) => (
                                                        <TableRow
                                                            key={
                                                                res.id_resultado
                                                            }
                                                            className="hover:bg-slate-50/50"
                                                        >
                                                            <TableCell>
                                                                <div className="font-semibold text-slate-900">
                                                                    {res.tipo}{' '}
                                                                    {res.numero
                                                                        ? `#${res.numero}`
                                                                        : ''}
                                                                </div>
                                                                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                                                                    <Calendar className="size-3.5" />
                                                                    {new Date(
                                                                        res.fecha,
                                                                    ).toLocaleDateString()}
                                                                    {res.descripcion
                                                                        ? ` - ${res.descripcion}`
                                                                        : ''}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center text-base font-bold text-[#ff7043]">
                                                                {parseFloat(
                                                                    res.puntaje_total.toString(),
                                                                ).toFixed(3)}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {res.puesto ? (
                                                                    <Badge
                                                                        className="border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-700 hover:bg-amber-50"
                                                                        variant="outline"
                                                                    >
                                                                        <Award className="mr-1 inline size-3.5" />
                                                                        Puesto{' '}
                                                                        {
                                                                            res.puesto
                                                                        }
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {res.max_area !==
                                                                    null &&
                                                                res.min_area !==
                                                                    null ? (
                                                                    <div className="w-full max-w-[200px] space-y-1.5">
                                                                        <div className="flex justify-between text-xs text-slate-500">
                                                                            <span>
                                                                                Mín:{' '}
                                                                                {res.min_area.toFixed(
                                                                                    3,
                                                                                )}
                                                                            </span>
                                                                            <span className="font-semibold text-slate-800">
                                                                                Máx:{' '}
                                                                                {res.max_area.toFixed(
                                                                                    3,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {/* Progress bar visual comparison */}
                                                                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                                            <div
                                                                                className="h-full rounded-full bg-slate-300"
                                                                                style={{
                                                                                    left: `${(res.min_area / res.max_area) * 100}%`,
                                                                                    width: `${(1 - res.min_area / res.max_area) * 100}%`,
                                                                                    position:
                                                                                        'absolute',
                                                                                }}
                                                                            />
                                                                            <div
                                                                                className="absolute h-full rounded-full bg-[#ff7043]"
                                                                                style={{
                                                                                    width: `${(res.puntaje_total / res.max_area) * 100}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">
                                                                        Sin
                                                                        métricas
                                                                        grupales
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-36 text-center shadow-sm">
                                <Search className="mb-4 size-12 text-slate-300" />
                                <h3 className="mb-1 text-lg font-bold text-slate-800">
                                    Visualiza las calificaciones en tiempo real
                                </h3>
                                <p className="max-w-md text-sm text-slate-500">
                                    Introduce el número de DNI del alumno a la
                                    izquierda para buscar el consolidado de
                                    simulacros académicos.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Public Footer */}
            <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
                <div className="mx-auto max-w-7xl px-4">
                    <p>
                        &copy; 2026 Academia Pre-Universitaria "John Nash".
                        Todos los derechos reservados.
                    </p>
                    <p className="mt-1 text-slate-400">
                        Desarrollado para la optimización del rendimiento y
                        gestión académica.
                    </p>
                </div>
            </footer>
        </div>
    );
}
