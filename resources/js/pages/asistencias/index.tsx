import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import LectorAsistencia from '@/components/LectorAsistencia';
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
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { index as asistenciasIndex } from '@/routes/asistencias/index';

interface Asistencia {
    id_asistencia: number;
    fecha: string;
    estado: string;
}

interface Alumno {
    id_alumno: number;
    dni: string;
    nombres: string;
    apellidos: string;
    asistencias: Asistencia[];
}

interface AsistenciasProps {
    alumnos: {
        data: Alumno[];
        links: any[];
    };
    catalogos: {
        areas: any[];
        carreras: any[];
        ciclos: any[];
        cursos: any[];
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

export default function AsistenciasIndex({ alumnos, catalogos, filtros }: AsistenciasProps) {
    const [activeTab, setActiveTab] = useState<'lector' | 'detalle'>('lector');
    const [busqueda, setBusqueda] = useState(filtros.busqueda || '');
    
    // Custom date range state
    const [customStartDate, setCustomStartDate] = useState(filtros.periodo === 'personalizado' ? filtros.fecha_inicio : '');
    const [customEndDate, setCustomEndDate] = useState(filtros.periodo === 'personalizado' ? filtros.fecha_fin : '');

    // Debounce for search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (busqueda !== (filtros.busqueda || '')) {
                router.get(
                    asistenciasIndex.url(),
                    { ...filtros, busqueda },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [busqueda]);

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            asistenciasIndex.url(),
            { ...filtros, busqueda, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    const handlePeriodoChange = (periodo: string) => {
        if (periodo === 'personalizado') {
            router.get(
                asistenciasIndex.url(),
                { ...filtros, busqueda, periodo, fecha_inicio: customStartDate || filtros.fecha_inicio, fecha_fin: customEndDate || filtros.fecha_fin },
                { preserveState: true, replace: true }
            );
        } else {
            router.get(
                asistenciasIndex.url(),
                { ...filtros, busqueda, periodo },
                { preserveState: true, replace: true }
            );
        }
    };

    const handleCustomDateSearch = () => {
        if (customStartDate && customEndDate) {
            router.get(
                asistenciasIndex.url(),
                { ...filtros, busqueda, periodo: 'personalizado', fecha_inicio: customStartDate, fecha_fin: customEndDate },
                { preserveState: true, replace: true }
            );
        }
    };

    // Generate date columns
    const startDate = new Date(filtros.fecha_inicio + 'T00:00:00');
    const endDate = new Date(filtros.fecha_fin + 'T00:00:00');
    const dates: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
    }

    const getEstadoAbreviado = (estado: string) => {
        switch (estado) {
            case 'ASISTIO': return { label: 'A', class: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' };
            case 'FALTO': return { label: 'F', class: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' };
            case 'TARDANZA': return { label: 'T', class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200' };
            case 'JUSTIFICADO': return { label: 'J', class: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' };
            default: return { label: '?', class: 'bg-gray-100 text-gray-700' };
        }
    };

    return (
        <>
            <Head title="Asistencias" />

            <div className="flex flex-col gap-6 p-6">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">Control de Asistencias</h1>
                    <p className="text-sm text-slate-500">
                        Gestione el registro de asistencias mediante código de barras o visualice el historial detallado por alumno.
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
                        <LectorAsistencia />
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
                                    onChange={(e) => handleFilterChange('id_area', e.target.value)}
                                >
                                    <option value="">Todas las Áreas</option>
                                    {catalogos.areas.map((a: any) => (
                                        <option key={a.id_area} value={a.id_area}>{a.nombre}</option>
                                    ))}
                                </select>

                                <select 
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_carrera || ''}
                                    onChange={(e) => handleFilterChange('id_carrera', e.target.value)}
                                >
                                    <option value="">Todas las Carreras</option>
                                    {catalogos.carreras.map((c: any) => (
                                        <option key={c.id_carrera} value={c.id_carrera}>{c.nombre}</option>
                                    ))}
                                </select>

                                <select 
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_ciclo || ''}
                                    onChange={(e) => handleFilterChange('id_ciclo', e.target.value)}
                                >
                                    <option value="">Todos los Ciclos</option>
                                    {catalogos.ciclos.map((c: any) => (
                                        <option key={c.id_ciclo} value={c.id_ciclo}>{c.nombre}</option>
                                    ))}
                                </select>

                                <select 
                                    className="flex h-9 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={filtros.id_curso || ''}
                                    onChange={(e) => handleFilterChange('id_curso', e.target.value)}
                                >
                                    <option value="">Todos los Cursos</option>
                                    {catalogos.cursos.map((c: any) => (
                                        <option key={c.id_curso} value={c.id_curso}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Periodo:</span>
                                    <Button
                                        variant={filtros.periodo === 'dia' ? 'default' : 'outline'}
                                        onClick={() => handlePeriodoChange('dia')}
                                        size="sm"
                                    >
                                        Día
                                    </Button>
                                    <Button
                                        variant={filtros.periodo === 'semana' ? 'default' : 'outline'}
                                        onClick={() => handlePeriodoChange('semana')}
                                        size="sm"
                                    >
                                        Semana
                                    </Button>
                                    <Button
                                        variant={filtros.periodo === 'mes' ? 'default' : 'outline'}
                                        onClick={() => handlePeriodoChange('mes')}
                                        size="sm"
                                    >
                                        Mes
                                    </Button>
                                    <Button
                                        variant={filtros.periodo === 'personalizado' ? 'default' : 'outline'}
                                        onClick={() => handlePeriodoChange('personalizado')}
                                        size="sm"
                                    >
                                        Personalizado
                                    </Button>
                                </div>

                                {filtros.periodo === 'personalizado' && (
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            type="date" 
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <span className="text-sm">a</span>
                                        <Input 
                                            type="date" 
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <Button size="sm" onClick={() => handleCustomDateSearch()}>Aplicar</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border bg-white overflow-x-auto mt-2">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[250px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0]">Estudiante</TableHead>
                                        <TableHead className="min-w-[120px]">DNI</TableHead>
                                        {dates.map((date, idx) => (
                                            <TableHead key={idx} className="text-center px-1 min-w-[40px]">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs text-slate-500">{date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase()}</span>
                                                    <span className="font-semibold">{date.getDate()}</span>
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alumnos.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={dates.length + 2} className="text-center py-8 text-slate-500">
                                                No se encontraron alumnos registrados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        alumnos.data.map((alumno) => (
                                            <TableRow key={alumno.id_alumno}>
                                                <TableCell className="font-medium sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0]">
                                                    {alumno.apellidos}, {alumno.nombres}
                                                </TableCell>
                                                <TableCell>{alumno.dni}</TableCell>
                                                {dates.map((date, idx) => {
                                                    const dateStr = date.toISOString().split('T')[0];
                                                    const asistencia = alumno.asistencias.find(a => a.fecha.startsWith(dateStr));
                                                    
                                                    if (asistencia) {
                                                        const { label, class: className } = getEstadoAbreviado(asistencia.estado);
                                                        return (
                                                            <TableCell key={idx} className="text-center p-1">
                                                                <Badge variant="outline" className={`w-7 h-7 flex items-center justify-center p-0 ${className}`} title={asistencia.estado}>
                                                                    {label}
                                                                </Badge>
                                                            </TableCell>
                                                        );
                                                    }

                                                    return (
                                                        <TableCell key={idx} className="text-center p-1">
                                                            <span className="text-slate-300 font-bold">-</span>
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

AsistenciasIndex.layout = (page: any) => (
    <AppLayout breadcrumbs={[{ title: 'Asistencias', href: asistenciasIndex.url() }]}>
        {page}
    </AppLayout>
);
