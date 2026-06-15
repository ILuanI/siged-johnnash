import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, RefreshCw, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface AlumnoReportRow {
    id_alumno: number;
    codigo: string;
    dni: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    carrera: string;
    area: string;
    turno: string;
    total_asistencias: number;
    total_tardanzas: number;
    total_faltas: number;
    total_clases: number;
    tasa_asistencia: number | null;
    promedio_notas: number | null;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    estudiantes: PaginatedData<AlumnoReportRow>;
    turnos: Array<{ id_turno: number; nombre: string }>;
    areas: Array<{ id_area: number; nombre: string }>;
    filters: {
        q?: string;
        id_turno?: string;
        id_area?: string;
        tardanzas_count?: string;
        faltas_count?: string;
    };
}

export default function ReportesIndex({ estudiantes, turnos, areas, filters }: Props) {
    const [q, setQ] = useState(filters.q || '');
    const [idTurno, setIdTurno] = useState(filters.id_turno || 'all');
    const [idArea, setIdArea] = useState(filters.id_area || 'all');
    const [tardanzasCount, setTardanzasCount] = useState(filters.tardanzas_count || '');
    const [faltasCount, setFaltasCount] = useState(filters.faltas_count || '');
    const [loading, setLoading] = useState(false);

    const applyFilters = (page = 1) => {
        setLoading(true);
        const params: any = { page };

        if (q.trim()) {
            params.q = q;
        }
        if (idTurno !== 'all' && idTurno !== '') {
            params.id_turno = idTurno;
        }
        if (idArea !== 'all' && idArea !== '') {
            params.id_area = idArea;
        }
        if (tardanzasCount) {
            params.tardanzas_count = tardanzasCount;
        }
        if (faltasCount) {
            params.faltas_count = faltasCount;
        }

        router.get('/reportes', params, {
            onFinish: () => setLoading(false),
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(1);
    };

    const clearFilters = () => {
        setQ('');
        setIdTurno('all');
        setIdArea('all');
        setTardanzasCount('');
        setFaltasCount('');
        setLoading(true);
        router.get('/reportes', {}, {
            onFinish: () => setLoading(false),
        });
    };

    const handlePageChange = (page: number) => {
        applyFilters(page);
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams();
        if (q.trim()) {
            queryParams.append('q', q);
        }
        if (idTurno !== 'all' && idTurno !== '') {
            queryParams.append('id_turno', idTurno);
        }
        if (idArea !== 'all' && idArea !== '') {
            queryParams.append('id_area', idArea);
        }
        if (tardanzasCount) {
            queryParams.append('tardanzas_count', tardanzasCount);
        }
        if (faltasCount) {
            queryParams.append('faltas_count', faltasCount);
        }

        window.location.href = `/reportes/exportar?${queryParams.toString()}`;
        toast.success('Generando reporte Excel...');
    };

    const handleExportPdf = () => {
        const queryParams = new URLSearchParams();
        if (q.trim()) {
            queryParams.append('q', q);
        }
        if (idTurno !== 'all' && idTurno !== '') {
            queryParams.append('id_turno', idTurno);
        }
        if (idArea !== 'all' && idArea !== '') {
            queryParams.append('id_area', idArea);
        }
        if (tardanzasCount) {
            queryParams.append('tardanzas_count', tardanzasCount);
        }
        if (faltasCount) {
            queryParams.append('faltas_count', faltasCount);
        }

        window.location.href = `/reportes/pdf?${queryParams.toString()}`;
        toast.success('Generando reporte PDF...');
    };

    return (
        <>
            <Head title="Reportes BI" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Reportes BI & Filtros Avanzados
                        </h1>
                        <p className="text-sm text-slate-500">
                            Filtra, cruza información académica y de asistencia, y exporta a Excel.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExport}
                            disabled={estudiantes.total === 0}
                            className="bg-[#ff7043] hover:bg-[#f4511e]"
                        >
                            <Download className="mr-2 size-4" />
                            Exportar a Excel (.xlsx)
                        </Button>
                        <Button
                            onClick={handleExportPdf}
                            disabled={estudiantes.total === 0}
                            variant="outline"
                            className="border-slate-300 hover:bg-slate-50 text-slate-700"
                        >
                            <Download className="mr-2 size-4 text-red-500" />
                            Exportar a PDF (.pdf)
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 space-y-6 px-8 py-6">
                {/* Panel de Filtros */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="grid gap-4 md:grid-cols-5 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="search">Búsqueda rápida</Label>
                            <div className="relative">
                                <Input
                                    id="search"
                                    placeholder="Nombre, DNI o Código..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="pr-8"
                                />
                                {q && (
                                    <button
                                        type="button"
                                        onClick={() => setQ('')}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="turno">Turno</Label>
                            <Select value={idTurno} onValueChange={setIdTurno}>
                                <SelectTrigger id="turno">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los turnos</SelectItem>
                                    {turnos.map((t) => (
                                        <SelectItem key={t.id_turno} value={t.id_turno.toString()}>
                                            {t.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area">Área</Label>
                            <Select value={idArea} onValueChange={setIdArea}>
                                <SelectTrigger id="area">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las áreas</SelectItem>
                                    {areas.map((a) => (
                                        <SelectItem key={a.id_area} value={a.id_area.toString()}>
                                            {a.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="tardanzas">Tardanzas (Min)</Label>
                                <Input
                                    id="tardanzas"
                                    type="number"
                                    min="0"
                                    placeholder="Ej: 3"
                                    value={tardanzasCount}
                                    onChange={(e) => setTardanzasCount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="faltas">Faltas (Min)</Label>
                                <Input
                                    id="faltas"
                                    type="number"
                                    min="0"
                                    placeholder="Ej: 2"
                                    value={faltasCount}
                                    onChange={(e) => setFaltasCount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#ff7043] hover:bg-[#f4511e]"
                            >
                                {loading ? (
                                    <RefreshCw className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <Search className="mr-2 size-4" />
                                        Filtrar
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                disabled={loading}
                                title="Limpiar filtros"
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Tabla de Resultados */}
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[180px]">Código / DNI</TableHead>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Área / Carrera</TableHead>
                                <TableHead>Turno</TableHead>
                                <TableHead className="text-center">Asistencias</TableHead>
                                <TableHead className="text-center">Tardanzas</TableHead>
                                <TableHead className="text-center">Faltas</TableHead>
                                <TableHead className="text-center">Asistencia %</TableHead>
                                <TableHead className="text-right">Prom. Notas</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {estudiantes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center text-slate-500">
                                        No se encontraron estudiantes matriculados que cumplan con los filtros.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                estudiantes.data.map((row) => (
                                    <TableRow key={row.id_alumno} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="font-mono text-xs font-semibold text-slate-900">{row.codigo}</div>
                                            <div className="text-xs text-slate-400">DNI {row.dni}</div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900">
                                            {row.apellidos}, {row.nombres}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-slate-900 text-sm font-medium">{row.carrera}</div>
                                            <div className="text-xs text-slate-500">Área {row.area}</div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">
                                            {row.turno}
                                        </TableCell>
                                        <TableCell className="text-center text-emerald-600 font-semibold">{row.total_asistencias}</TableCell>
                                        <TableCell className="text-center text-amber-600 font-semibold">{row.total_tardanzas}</TableCell>
                                        <TableCell className="text-center text-rose-600 font-semibold">{row.total_faltas}</TableCell>
                                        <TableCell className="text-center">
                                            {row.tasa_asistencia !== null ? (
                                                <Badge
                                                    className={
                                                        row.tasa_asistencia >= 90
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                                                            : row.tasa_asistencia >= 75
                                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200'
                                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200'
                                                    }
                                                    variant="outline"
                                                >
                                                    {row.tasa_asistencia.toFixed(1)}%
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-900 text-sm">
                                            {row.promedio_notas !== null ? (
                                                row.promedio_notas.toFixed(3)
                                            ) : (
                                                <span className="text-slate-400 font-normal text-xs">Sin notas</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    router.visit(`/dashboard?alumno=${row.id_alumno}`);
                                                }}
                                                className="text-slate-500 hover:text-[#ff7043]"
                                            >
                                                <User className="size-4 mr-1.5" />
                                                Ficha 360
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Controles de Paginación */}
                    {estudiantes.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(estudiantes.current_page - 1)}
                                    disabled={estudiantes.current_page === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(estudiantes.current_page + 1)}
                                    disabled={estudiantes.current_page === estudiantes.last_page}
                                >
                                    Siguiente
                                </Button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Mostrando página <span className="font-semibold text-slate-800">{estudiantes.current_page}</span> de{' '}
                                        <span className="font-semibold text-slate-800">{estudiantes.last_page}</span> ({estudiantes.total} estudiantes)
                                    </p>
                                </div>
                                <div className="flex gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(estudiantes.current_page - 1)}
                                        disabled={estudiantes.current_page === 1}
                                    >
                                        Anterior
                                    </Button>
                                    {Array.from({ length: estudiantes.last_page }).map((_, i) => {
                                        const page = i + 1;
                                        // Simple page collapse logic
                                        if (
                                            page === 1 ||
                                            page === estudiantes.last_page ||
                                            Math.abs(page - estudiantes.current_page) <= 2
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={estudiantes.current_page === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                    className={estudiantes.current_page === page ? 'bg-[#ff7043] hover:bg-[#f4511e] text-white border-transparent' : ''}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        }
                                        if (
                                            page === 2 ||
                                            page === estudiantes.last_page - 1
                                        ) {
                                            return <span key={page} className="px-2 py-1 text-slate-400 text-sm">...</span>;
                                        }
                                        return null;
                                    })}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(estudiantes.current_page + 1)}
                                        disabled={estudiantes.current_page === estudiantes.last_page}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ReportesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reportes',
            href: '/reportes',
        },
    ],
};
