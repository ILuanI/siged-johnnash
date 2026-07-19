import { Head, router } from '@inertiajs/react';
import { Search, Download, RefreshCw, X, Filter } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    estudiantes: PaginatedData<any>;
    turnos: Array<{ id_turno: number; nombre: string }>;
    areas: Array<{ id_area: number; nombre: string }>;
    cursos: Array<{ id_curso: number; nombre: string }>;
    filters: {
        tipo_reporte?: string;
        q?: string;
        id_turno?: string;
        id_area?: string;
        id_curso?: string;
        tardanzas_count?: string;
        faltas_count?: string;
        nota_min?: string;
        nota_max?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
    };
}

export default function ReportesIndex({
    estudiantes,
    turnos,
    areas,
    cursos,
    filters,
}: Props) {
    const [tipoReporte, setTipoReporte] = useState(filters.tipo_reporte || 'general');
    const [q, setQ] = useState(filters.q || '');
    const [idTurno, setIdTurno] = useState(filters.id_turno || 'all');
    const [idArea, setIdArea] = useState(filters.id_area || 'all');
    const [idCurso, setIdCurso] = useState(filters.id_curso || 'all');
    const [notaMin, setNotaMin] = useState(filters.nota_min || '');
    const [notaMax, setNotaMax] = useState(filters.nota_max || '');
    const [fechaInicio, setFechaInicio] = useState(filters.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(filters.fecha_fin || '');
    const [tardanzasCount, setTardanzasCount] = useState(filters.tardanzas_count || '');
    const [faltasCount, setFaltasCount] = useState(filters.faltas_count || '');
    
    const [loading, setLoading] = useState(false);

    const applyFilters = (page = 1) => {
        setLoading(true);
        const params: any = { page, tipo_reporte: tipoReporte };

        if (q.trim()) params.q = q;
        if (idTurno !== 'all' && idTurno !== '') params.id_turno = idTurno;
        if (idArea !== 'all' && idArea !== '') params.id_area = idArea;
        if (idCurso !== 'all' && idCurso !== '') params.id_curso = idCurso;
        if (notaMin) params.nota_min = notaMin;
        if (notaMax) params.nota_max = notaMax;
        if (fechaInicio) params.fecha_inicio = fechaInicio;
        if (fechaFin) params.fecha_fin = fechaFin;
        if (tardanzasCount) params.tardanzas_count = tardanzasCount;
        if (faltasCount) params.faltas_count = faltasCount;

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

    // Auto-apply when type changes
    useEffect(() => {
        if (tipoReporte !== filters.tipo_reporte) {
            applyFilters(1);
        }
    }, [tipoReporte]);

    const clearFilters = () => {
        setQ('');
        setIdTurno('all');
        setIdArea('all');
        setIdCurso('all');
        setNotaMin('');
        setNotaMax('');
        setFechaInicio('');
        setFechaFin('');
        setTardanzasCount('');
        setFaltasCount('');
        setLoading(true);
        router.get(
            '/reportes',
            { tipo_reporte: tipoReporte },
            {
                onFinish: () => setLoading(false),
            },
        );
    };

    const handlePageChange = (page: number) => {
        applyFilters(page);
    };

    const getExportUrl = (format: 'exportar' | 'pdf') => {
        const queryParams = new URLSearchParams();
        queryParams.append('tipo_reporte', tipoReporte);
        if (q.trim()) queryParams.append('q', q);
        if (idTurno !== 'all' && idTurno !== '') queryParams.append('id_turno', idTurno);
        if (idArea !== 'all' && idArea !== '') queryParams.append('id_area', idArea);
        if (idCurso !== 'all' && idCurso !== '') queryParams.append('id_curso', idCurso);
        if (notaMin) queryParams.append('nota_min', notaMin);
        if (notaMax) queryParams.append('nota_max', notaMax);
        if (fechaInicio) queryParams.append('fecha_inicio', fechaInicio);
        if (fechaFin) queryParams.append('fecha_fin', fechaFin);
        if (tardanzasCount) queryParams.append('tardanzas_count', tardanzasCount);
        if (faltasCount) queryParams.append('faltas_count', faltasCount);

        return `/reportes/${format}?${queryParams.toString()}`;
    };

    const handleExport = () => {
        window.location.href = getExportUrl('exportar');
        toast.success('Generando reporte Excel...');
    };

    const handleExportPdf = () => {
        window.location.href = getExportUrl('pdf');
        toast.success('Generando reporte PDF...');
    };

    const renderTableHeaders = () => {
        return (
            <TableRow className="bg-slate-50">
                <TableHead className="w-[120px]">DNI</TableHead>
                <TableHead>Estudiante</TableHead>
                {tipoReporte !== 'asistencias' && <TableHead>Área</TableHead>}
                
                {tipoReporte === 'rendimiento' && (
                    <>
                        <TableHead className="text-center">Prom. Notas</TableHead>
                    </>
                )}

                {tipoReporte === 'asistencias' && (
                    <>
                        <TableHead className="text-center">Asistencias</TableHead>
                        <TableHead className="text-center">Tardanzas</TableHead>
                        <TableHead className="text-center">Faltas</TableHead>
                        <TableHead className="text-center">Asistencia %</TableHead>
                    </>
                )}

                {tipoReporte === 'general' && (
                    <>
                        <TableHead>Turno</TableHead>
                        <TableHead className="text-center">Asistencias</TableHead>
                        <TableHead className="text-center">Tardanzas</TableHead>
                        <TableHead className="text-center">Faltas</TableHead>
                        <TableHead className="text-center">Asistencia %</TableHead>
                        <TableHead className="text-right">Prom. Notas</TableHead>
                    </>
                )}
            </TableRow>
        );
    };

    const renderTableCells = (row: any) => {
        return (
            <>
                <TableCell>
                    <div className="font-mono text-xs font-semibold text-slate-900">{row.dni}</div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                    {row.apellidos}, {row.nombres}
                </TableCell>
                
                {tipoReporte !== 'asistencias' && (
                    <TableCell>
                        <div className="text-xs text-slate-500">{row.area}</div>
                    </TableCell>
                )}

                {tipoReporte === 'rendimiento' && (
                    <>
                        <TableCell className="text-center font-bold text-slate-900">
                            {row.promedio_notas !== null ? (
                                <Badge variant={row.promedio_notas >= 10.5 ? 'default' : 'destructive'}>
                                    {row.promedio_notas.toFixed(2)}
                                </Badge>
                            ) : (
                                <span className="text-xs font-normal text-slate-400">N/A</span>
                            )}
                        </TableCell>
                    </>
                )}

                {tipoReporte === 'asistencias' && (
                    <>
                        <TableCell className="text-center font-semibold text-emerald-600">{row.total_asistencias}</TableCell>
                        <TableCell className="text-center font-semibold text-amber-600">{row.total_tardanzas}</TableCell>
                        <TableCell className="text-center font-semibold text-rose-600">{row.total_faltas}</TableCell>
                        <TableCell className="text-center">
                            {row.tasa_asistencia !== null ? (
                                <Badge variant="outline" className={row.tasa_asistencia >= 75 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}>
                                    {row.tasa_asistencia.toFixed(1)}%
                                </Badge>
                            ) : '-'}
                        </TableCell>
                    </>
                )}

                {tipoReporte === 'general' && (
                    <>
                        <TableCell className="text-sm text-slate-600">{row.turno}</TableCell>
                        <TableCell className="text-center font-semibold text-emerald-600">{row.total_asistencias}</TableCell>
                        <TableCell className="text-center font-semibold text-amber-600">{row.total_tardanzas}</TableCell>
                        <TableCell className="text-center font-semibold text-rose-600">{row.total_faltas}</TableCell>
                        <TableCell className="text-center">
                            {row.tasa_asistencia !== null ? `${row.tasa_asistencia.toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-slate-900">
                            {row.promedio_notas !== null ? row.promedio_notas.toFixed(2) : '-'}
                        </TableCell>
                    </>
                )}
            </>
        );
    };

    return (
        <>
            <Head title="Constructor de Reportes" />

            <div className="flex flex-col gap-6 p-8 bg-slate-50 min-h-screen">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Constructor de Reportes
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Selecciona el tipo de informe y aplica los filtros necesarios para generar tu previsualización interactiva.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleExport} disabled={estudiantes.total === 0} className="bg-[#ff7043] hover:bg-[#f4511e]">
                            <Download className="mr-2 size-4" />
                            Excel
                        </Button>
                        <Button onClick={handleExportPdf} disabled={estudiantes.total === 0} variant="outline" className="border-slate-300 text-slate-700">
                            <Download className="mr-2 size-4 text-red-500" />
                            PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Sidebar de Configuración */}
                    <Card className="xl:col-span-1 border-slate-200 shadow-sm h-fit">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="size-5 text-slate-500" /> Configuración
                            </CardTitle>
                            <CardDescription>Parámetros del reporte</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSearchSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500">Tipo de Data</Label>
                                    <Select value={tipoReporte} onValueChange={setTipoReporte}>
                                        <SelectTrigger className="bg-slate-50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">Consolidado General</SelectItem>
                                            <SelectItem value="rendimiento">Rendimiento Académico (Notas)</SelectItem>
                                            <SelectItem value="asistencias">Historial de Asistencias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500">Búsqueda</Label>
                                    <Input placeholder="Nombre o DNI..." value={q} onChange={(e) => setQ(e.target.value)} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-slate-500">Área</Label>
                                        <Select value={idArea} onValueChange={setIdArea}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas</SelectItem>
                                                {areas.map(a => <SelectItem key={a.id_area} value={a.id_area.toString()}>{a.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-slate-500">Turno</Label>
                                        <Select value={idTurno} onValueChange={setIdTurno}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                {turnos.map(t => <SelectItem key={t.id_turno} value={t.id_turno.toString()}>{t.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {tipoReporte === 'asistencias' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-slate-500">Curso (Opcional)</Label>
                                            <Select value={idCurso} onValueChange={setIdCurso}>
                                                <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Cualquiera</SelectItem>
                                                    {cursos.map(c => <SelectItem key={c.id_curso} value={c.id_curso.toString()}>{c.nombre}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-600">Tardanzas Min.</Label>
                                                <Input type="number" min="0" value={tardanzasCount} onChange={e => setTardanzasCount(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-600">Faltas Min.</Label>
                                                <Input type="number" min="0" value={faltasCount} onChange={e => setFaltasCount(e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {tipoReporte === 'rendimiento' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-600">Nota Mínima</Label>
                                            <Input type="number" step="0.1" value={notaMin} onChange={e => setNotaMin(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-600">Nota Máxima</Label>
                                            <Input type="number" step="0.1" value={notaMax} onChange={e => setNotaMax(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {(tipoReporte === 'rendimiento' || tipoReporte === 'asistencias') && (
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold text-slate-500">Rango de Fechas</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="text-xs" />
                                            <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="text-xs" />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-2">
                                    <Button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800">
                                        {loading ? <RefreshCw className="mr-2 size-4 animate-spin" /> : 'Generar Previsualización'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={clearFilters} disabled={loading} title="Limpiar todo">
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Previsualización */}
                    <div className="xl:col-span-3 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-800">Previsualización de Datos</h2>
                            <Badge variant="secondary" className="px-3 py-1 font-mono">{estudiantes.total} registros</Badge>
                        </div>
                        
                        <div className="rounded-xl border bg-white shadow-sm overflow-hidden relative">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                    <RefreshCw className="size-6 animate-spin text-slate-400" />
                                </div>
                            )}
                            
                            <Table>
                                <TableHeader>
                                    {renderTableHeaders()}
                                </TableHeader>
                                <TableBody>
                                    {estudiantes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-48 text-center text-slate-500">
                                                No se encontraron resultados para los filtros seleccionados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        estudiantes.data.map((row) => (
                                            <TableRow key={row.id_alumno} className="hover:bg-slate-50">
                                                {renderTableCells(row)}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {estudiantes.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                                    <p className="text-sm text-slate-500 hidden sm:block">
                                        Mostrando página <span className="font-semibold text-slate-800">{estudiantes.current_page}</span> de <span className="font-semibold text-slate-800">{estudiantes.last_page}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handlePageChange(estudiantes.current_page - 1)} disabled={estudiantes.current_page === 1}>
                                            Anterior
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handlePageChange(estudiantes.current_page + 1)} disabled={estudiantes.current_page === estudiantes.last_page}>
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
