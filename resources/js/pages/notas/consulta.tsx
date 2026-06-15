import { Head, router } from '@inertiajs/react';
import { Search, GraduationCap, Calendar, Award, TrendingUp, User, BookOpen } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AlumnoInfo {
    nombres: string;
    apellidos: string;
    codigo: string;
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

export default function NotasConsulta({ alumno, resultados, filters, mensaje }: Props) {
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
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
            <Head title="Consulta de Notas - Academia John Nash" />

            {/* Public Header */}
            <header className="bg-white border-b border-slate-200 py-5 px-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ff7043] text-white shadow-md">
                            <GraduationCap className="size-6" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-900 block leading-tight">
                                Academia John Nash
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                Consulta de Notas y Simulacros
                            </span>
                        </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Portal Público
                    </span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Panel: Search & Profile */}
                    <div className="space-y-6 md:col-span-1">
                        {/* Search Card */}
                        <Card className="border-slate-200 shadow-sm bg-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-bold text-slate-900">Buscar Estudiante</CardTitle>
                                <CardDescription>
                                    Ingresa el DNI del alumno para consultar su historial de notas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dni">DNI del Alumno</Label>
                                        <div className="relative">
                                            <Input
                                                id="dni"
                                                type="text"
                                                maxLength={8}
                                                placeholder="Ej: 72717127"
                                                value={dni}
                                                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                                                className="pl-9 pr-4"
                                                required
                                            />
                                            <User className="absolute left-3 top-2.5 size-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={searching || dni.length !== 8}
                                        className="w-full bg-[#ff7043] hover:bg-[#f4511e] text-white"
                                    >
                                        <Search className="mr-2 size-4" />
                                        {searching ? 'Buscando...' : 'Consultar Notas'}
                                    </Button>
                                </form>

                                {mensaje && (
                                    <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs leading-relaxed">
                                        {mensaje}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Student Profile Card (if found) */}
                        {alumno && (
                            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                                <div className="h-2 bg-[#ff7043]" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-bold text-slate-900">Perfil del Estudiante</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <User className="size-5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-slate-400 block font-medium">Nombres y Apellidos</span>
                                            <span className="font-semibold text-slate-900">{alumno.apellidos}, {alumno.nombres}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <GraduationCap className="size-5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-slate-400 block font-medium">Carrera / Área</span>
                                            <span className="font-medium text-slate-900">{alumno.carrera}</span>
                                            <span className="text-xs text-slate-500 block">Área {alumno.area}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <BookOpen className="size-5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs text-slate-400 block font-medium">Código / Ciclo</span>
                                            <span className="font-mono text-slate-900 font-semibold">{alumno.codigo}</span>
                                            <span className="text-xs text-slate-500 block">{alumno.ciclo}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Panel: Exam History */}
                    <div className="md:col-span-2">
                        {alumno ? (
                            <Card className="border-slate-200 shadow-sm bg-white h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <TrendingUp className="size-5 text-[#ff7043]" />
                                        Historial de Simulacros y Exámenes
                                    </CardTitle>
                                    <CardDescription>
                                        Calificaciones y puestos obtenidos en el ciclo actual.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {resultados.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500 border border-dashed rounded-xl">
                                            Aún no hay calificaciones registradas para este estudiante en este ciclo.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead>Fecha / Examen</TableHead>
                                                        <TableHead className="text-center">Puntaje</TableHead>
                                                        <TableHead className="text-center">Puesto en Área</TableHead>
                                                        <TableHead>Comparativa de Área (Máx / Mín)</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {resultados.map((res) => (
                                                        <TableRow key={res.id_resultado} className="hover:bg-slate-50/50">
                                                            <TableCell>
                                                                <div className="font-semibold text-slate-900">
                                                                    {res.tipo} {res.numero ? `#${res.numero}` : ''}
                                                                </div>
                                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                                    <Calendar className="size-3.5" />
                                                                    {new Date(res.fecha).toLocaleDateString()}
                                                                    {res.descripcion ? ` - ${res.descripcion}` : ''}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-[#ff7043] text-base">
                                                                {parseFloat(res.puntaje_total.toString()).toFixed(3)}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {res.puesto ? (
                                                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-bold px-2 py-0.5" variant="outline">
                                                                        <Award className="mr-1 size-3.5 inline" />
                                                                        Puesto {res.puesto}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-slate-400 text-xs">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {res.max_area !== null && res.min_area !== null ? (
                                                                    <div className="space-y-1.5 w-full max-w-[200px]">
                                                                        <div className="flex justify-between text-xs text-slate-500">
                                                                            <span>Mín: {res.min_area.toFixed(3)}</span>
                                                                            <span className="font-semibold text-slate-800">Máx: {res.max_area.toFixed(3)}</span>
                                                                        </div>
                                                                        {/* Progress bar visual comparison */}
                                                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                                                            <div
                                                                                className="h-full bg-slate-300 rounded-full"
                                                                                style={{
                                                                                    left: `${(res.min_area / res.max_area) * 100}%`,
                                                                                    width: `${(1 - res.min_area / res.max_area) * 100}%`,
                                                                                    position: 'absolute',
                                                                                }}
                                                                            />
                                                                            <div
                                                                                className="h-full bg-[#ff7043] rounded-full absolute"
                                                                                style={{
                                                                                    width: `${(res.puntaje_total / res.max_area) * 100}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-400 text-xs">Sin métricas grupales</span>
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
                            <div className="flex flex-col items-center justify-center border-slate-200 border bg-white rounded-xl py-36 px-6 text-center h-full shadow-sm">
                                <Search className="size-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Visualiza las calificaciones en tiempo real</h3>
                                <p className="text-slate-500 text-sm max-w-md">
                                    Introduce el número de DNI del alumno a la izquierda para buscar el consolidado de simulacros académicos.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Public Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4">
                    <p>&copy; 2026 Academia Pre-Universitaria "John Nash". Todos los derechos reservados.</p>
                    <p className="mt-1 text-slate-400">Desarrollado para la optimización del rendimiento y gestión académica.</p>
                </div>
            </footer>
        </div>
    );
}
