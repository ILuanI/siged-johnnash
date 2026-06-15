import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import {
    Search,
    Users,
    Calendar,
    TrendingUp,
    CreditCard,
    CheckCircle2,
    AlertTriangle,
    X,
    User,
    Phone,
    Mail,
    BookOpen,
    Award,
    Activity,
    Clock,
    DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface ExamenResultado {
    id_resultado: number;
    tipo: string;
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

interface AsistenciaRow {
    fecha: string;
    estado: string;
    curso: string;
}

interface CuotaRow {
    id_cuota: number;
    numero_cuota: number;
    monto: number;
    fecha_venc: string;
    estado: string;
}

interface PagoRow {
    id_pago: number;
    numero_cuota: number;
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
}

interface ConsolidadoData {
    perfil: {
        id_alumno: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        nombre_completo: string;
        dni: string;
        fecha_nac: string | null;
        sexo: string | null;
        telefono: string | null;
        correo: string | null;
        direccion: string | null;
        colegio_procedencia: string | null;
        estado: string;
        carrera: {
            nombre: string;
            area: {
                nombre: string;
                codigo: string;
            } | null;
        } | null;
        apoderado: {
            nombres: string;
            dni: string | null;
            telefono: string | null;
            parentesco: string | null;
            correo: string | null;
        } | null;
    };
    matricula_actual: {
        id_matricula: number;
        estado: string;
        fecha_matricula: string;
        modalidad: string;
        tipo_pago: string;
        costo_total: string;
        turno: { nombre: string } | null;
        aula: { nombre: string } | null;
    } | null;
    asistencia: {
        resumen: {
            total_clases: number;
            total_asistencias: number;
            total_tardanzas: number;
            total_faltas: number;
            total_justificadas: number;
            tasa_asistencia: number | null;
        } | null;
        detalle: AsistenciaRow[];
    };
    notas: {
        promedio_general: number | null;
        examenes: ExamenResultado[];
    };
    finanzas: {
        saldo_pendiente: number;
        costo_total: number;
        tipo_pago: string | null;
        estado_pago: string;
        cuotas: CuotaRow[];
        pagos: PagoRow[];
    };
}

interface Props {
    kpis: {
        total_matriculados: number;
        tasa_asistencia: number;
        promedio_notas: number;
        tasa_recaudacion: number;
    };
    studentList: Array<{ id_alumno: number; label: string }>;
    consolidado: ConsolidadoData | null;
    ciclos: Array<{ id_ciclo: number; nombre: string }>;
    selectedCycleId: number | null;
    filters: {
        q: string;
        alumno: string;
    };
}

export default function DashboardBi({ kpis, studentList, consolidado, ciclos, selectedCycleId, filters }: Props) {
    const getInitials = useInitials();
    const [cycleId, setCycleId] = useState<string>(selectedCycleId?.toString() || '');
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Apply cycle filter instantly
    const handleCycleChange = (value: string) => {
        setCycleId(value);
        router.get('/dashboard', {
            id_ciclo: value,
            q: searchQuery,
            alumno: filters.alumno
        }, {
            preserveState: true,
        });
    };

    // Handle search autocomplete
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            const delayDebounce = setTimeout(() => {
                router.get('/dashboard', {
                    id_ciclo: cycleId,
                    q: searchQuery,
                    alumno: filters.alumno
                }, {
                    preserveState: true,
                    replace: true,
                    onSuccess: () => setShowSuggestions(true)
                });
            }, 300);
            return () => clearTimeout(delayDebounce);
        } else {
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const selectStudent = (alumnoId: number) => {
        setShowSuggestions(false);
        router.get('/dashboard', {
            id_ciclo: cycleId,
            q: searchQuery,
            alumno: alumnoId
        });
    };

    const clearStudent = () => {
        setSearchQuery('');
        router.get('/dashboard', {
            id_ciclo: cycleId,
        });
    };

    return (
        <>
            <Head title="Consolidado BI" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Consolidado & Perfil 360° Alumno
                        </h1>
                        <p className="text-sm text-slate-500">
                            Vista general de métricas del ciclo y ficha unificada del rendimiento estudiantil.
                        </p>
                    </div>
                    
                    {/* Cycle Selector */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cycle-select" className="text-sm font-semibold text-slate-700">Ciclo:</Label>
                        <Select value={cycleId} onValueChange={handleCycleChange}>
                            <SelectTrigger id="cycle-select" className="w-[220px] bg-white border-slate-200">
                                <SelectValue placeholder="Seleccionar ciclo" />
                            </SelectTrigger>
                            <SelectContent>
                                {ciclos.map((c) => (
                                    <SelectItem key={c.id_ciclo} value={c.id_ciclo.toString()}>
                                        {c.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            <div className="flex-1 space-y-6 px-8 py-6">
                {/* KPIs Generales del Ciclo Activo */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Matriculados</CardTitle>
                            <Users className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{kpis.total_matriculados}</div>
                            <p className="text-xs text-slate-400 mt-1">Alumnos activos en el ciclo</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tasa de Asistencia</CardTitle>
                            <Activity className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{kpis.tasa_asistencia.toFixed(1)}%</div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${kpis.tasa_asistencia}%` }} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Promedio de Notas</CardTitle>
                            <TrendingUp className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{kpis.promedio_notas.toFixed(3)}</div>
                            <p className="text-xs text-slate-400 mt-1">Puntaje total promedio global</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recaudación Financiera</CardTitle>
                            <DollarSign className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{kpis.tasa_recaudacion.toFixed(1)}%</div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${kpis.tasa_recaudacion}%` }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Buscador Global de Alumnos */}
                <div className="relative max-w-xl mx-auto">
                    <Label htmlFor="global-search" className="sr-only">Buscador global de alumno</Label>
                    <div className="relative">
                        <Input
                            id="global-search"
                            type="text"
                            placeholder="Buscar alumno por Nombre, DNI o Código..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === '') {
                                    setShowSuggestions(false);
                                }
                            }}
                            className="pl-10 pr-10 py-6 text-base border-slate-200 focus:border-[#ff7043]"
                        />
                        <Search className="absolute left-3.5 top-4.5 size-5 text-slate-400" />
                        {searchQuery && (
                            <button
                                onClick={clearStudent}
                                className="absolute right-3 top-4.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="size-5" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown Suggestions */}
                    {showSuggestions && studentList.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {studentList.map((item) => (
                                <button
                                    key={item.id_alumno}
                                    onClick={() => selectStudent(item.id_alumno)}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b last:border-0 border-slate-100 flex items-center justify-between"
                                >
                                    <span>{item.label}</span>
                                    <Badge variant="outline" className="text-slate-400 font-normal">Ficha 360</Badge>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Perfil 360° del Alumno (Ficha Central) */}
                {consolidado ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Columna Izquierda: Ficha Central y Contactos */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Ficha Físcial/Académica */}
                            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                                <div className="h-2 bg-[#ff7043]" />
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <Avatar className="size-24 border-2 border-slate-100 mb-4 shadow-sm">
                                        <AvatarFallback className="bg-[#1a237e]/15 text-[#1a237e] text-2xl font-bold">
                                            {getInitials(consolidado.perfil.nombre_completo)}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <h3 className="text-xl font-bold text-slate-900 leading-snug">
                                        {consolidado.perfil.apellidos}, {consolidado.perfil.nombres}
                                    </h3>
                                    <p className="text-sm font-mono text-[#ff7043] font-semibold mt-1">
                                        Código: {consolidado.perfil.codigo}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-semibold border-slate-200" variant="outline">
                                            DNI {consolidado.perfil.dni}
                                        </Badge>
                                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 font-semibold border-blue-200" variant="outline">
                                            {consolidado.perfil.estado}
                                        </Badge>
                                    </div>

                                    <div className="w-full border-t border-slate-100 mt-6 pt-4 space-y-3 text-left text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-medium">Carrera:</span>
                                            <span className="font-semibold text-slate-800 text-right">{consolidado.perfil.carrera?.nombre ?? 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-medium">Área:</span>
                                            <span className="font-semibold text-slate-800">{consolidado.perfil.carrera?.area?.nombre ?? 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-medium">Modalidad:</span>
                                            <span className="font-semibold text-slate-800">{consolidado.matricula_actual?.modalidad ?? 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-medium">Aula / Turno:</span>
                                            <span className="font-semibold text-slate-800">
                                                {consolidado.matricula_actual?.aula?.nombre ?? 'N/A'} ({consolidado.matricula_actual?.turno?.nombre ?? 'N/A'})
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contactos Alumno y Apoderado */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="pb-3 border-b border-slate-50">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Phone className="size-4.5 text-slate-400" />
                                        Información de Contacto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4 text-sm">
                                    {/* Alumno */}
                                    <div>
                                        <span className="text-xs text-[#ff7043] font-bold block mb-1 uppercase tracking-wider">Estudiante</span>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Phone className="size-4 text-slate-400 shrink-0" />
                                                <span>{consolidado.perfil.telefono || 'Sin teléfono'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700 truncate" title={consolidado.perfil.correo || ''}>
                                                <Mail className="size-4 text-slate-400 shrink-0" />
                                                <span>{consolidado.perfil.correo || 'Sin correo'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Apoderado */}
                                    {consolidado.perfil.apoderado ? (
                                        <div className="border-t border-slate-100 pt-3">
                                            <span className="text-xs text-[#ff7043] font-bold block mb-1 uppercase tracking-wider">
                                                Apoderado ({consolidado.perfil.apoderado.parentesco})
                                            </span>
                                            <p className="font-semibold text-slate-800 mb-2">{consolidado.perfil.apoderado.nombres}</p>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Phone className="size-4 text-slate-400 shrink-0" />
                                                    <span>{consolidado.perfil.apoderado.telefono || 'Sin teléfono'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-700 truncate" title={consolidado.perfil.apoderado.correo || ''}>
                                                    <Mail className="size-4 text-slate-400 shrink-0" />
                                                    <span>{consolidado.perfil.apoderado.correo || 'Sin correo'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t border-slate-100 pt-3 text-slate-400 text-xs">
                                            No se ha registrado información de apoderado.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Columna Derecha: Finanzas, Asistencia y Rendimiento */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Semáforo Financiero */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                            <CreditCard className="size-4.5 text-slate-400" />
                                            Estado Financiero
                                        </CardTitle>
                                        <CardDescription>Detalle de cuotas y saldo pendiente.</CardDescription>
                                    </div>
                                    
                                    {/* Financial Status Indicator */}
                                    <Badge
                                        className={
                                            consolidado.finanzas.estado_pago === 'PAGADO'
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-sm font-bold px-3 py-1'
                                                : consolidado.finanzas.estado_pago === 'AL_DIA'
                                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200 text-sm font-bold px-3 py-1'
                                                : 'bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200 text-sm font-bold px-3 py-1'
                                        }
                                        variant="outline"
                                    >
                                        {consolidado.finanzas.estado_pago === 'PAGADO' && 'Pagado'}
                                        {consolidado.finanzas.estado_pago === 'AL_DIA' && 'Al Día'}
                                        {consolidado.finanzas.estado_pago === 'DEUDOR' && 'Deuda Vencida'}
                                        {consolidado.finanzas.estado_pago === 'PENDIENTE' && 'Saldo Pendiente'}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div>
                                            <span className="text-xs text-slate-500 block">Costo Total</span>
                                            <span className="text-lg font-bold text-slate-900">S/ {consolidado.finanzas.costo_total.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 block">Pagado</span>
                                            <span className="text-lg font-bold text-emerald-600">
                                                S/ {(consolidado.finanzas.costo_total - consolidado.finanzas.saldo_pendiente).toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 block">Saldo Pendiente</span>
                                            <span className="text-lg font-bold text-rose-600">S/ {consolidado.finanzas.saldo_pendiente.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Cuotas list */}
                                    {consolidado.finanzas.cuotas.length > 0 ? (
                                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead className="py-2.5">N° Cuota</TableHead>
                                                        <TableHead className="py-2.5">Monto</TableHead>
                                                        <TableHead className="py-2.5">Vencimiento</TableHead>
                                                        <TableHead className="py-2.5 text-right">Estado</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {consolidado.finanzas.cuotas.map((cuota) => (
                                                        <TableRow key={cuota.id_cuota} className="hover:bg-slate-50/50">
                                                            <TableCell className="py-2 font-medium">Cuota {cuota.numero_cuota}</TableCell>
                                                            <TableCell className="py-2">S/ {cuota.monto.toFixed(2)}</TableCell>
                                                            <TableCell className="py-2">
                                                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                    <Clock className="size-3.5" />
                                                                    {new Date(cuota.fecha_venc).toLocaleDateString()}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="py-2 text-right">
                                                                <Badge
                                                                    className={
                                                                        cuota.estado === 'PAGADA'
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                            : cuota.estado === 'VENCIDA'
                                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                    }
                                                                    variant="outline"
                                                                >
                                                                    {cuota.estado}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 text-center py-4">Pago realizado en Modalidad Al Contado.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Asistencia Resumen */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="pb-3 border-b border-slate-50">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="size-4.5 text-slate-400" />
                                        Asistencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    {consolidado.asistencia.resumen ? (
                                        <div className="grid gap-6 md:grid-cols-3 items-center">
                                            {/* Progress rate bar */}
                                            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 border rounded-xl bg-slate-50">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asistencia %</span>
                                                <span className={`text-3xl font-extrabold mt-1 ${
                                                    consolidado.asistencia.resumen.tasa_asistencia !== null && consolidado.asistencia.resumen.tasa_asistencia >= 90
                                                        ? 'text-emerald-600'
                                                        : consolidado.asistencia.resumen.tasa_asistencia !== null && consolidado.asistencia.resumen.tasa_asistencia >= 75
                                                        ? 'text-amber-500'
                                                        : 'text-rose-500'
                                                }`}>
                                                    {consolidado.asistencia.resumen.tasa_asistencia !== null
                                                        ? `${consolidado.asistencia.resumen.tasa_asistencia.toFixed(1)}%`
                                                        : '0%'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium mt-1">
                                                    {consolidado.asistencia.resumen.total_asistencias + consolidado.asistencia.resumen.total_tardanzas} de {consolidado.asistencia.resumen.total_clases} clases
                                                </span>
                                            </div>

                                            {/* Stats breakdown */}
                                            <div className="md:col-span-2 grid grid-cols-3 gap-3 text-center text-sm">
                                                <div className="p-3 border rounded-xl">
                                                    <span className="text-xs text-slate-500 block">Asistencias</span>
                                                    <span className="text-base font-bold text-emerald-600">{consolidado.asistencia.resumen.total_asistencias}</span>
                                                </div>
                                                <div className="p-3 border rounded-xl">
                                                    <span className="text-xs text-slate-500 block">Tardanzas</span>
                                                    <span className="text-base font-bold text-amber-500">{consolidado.asistencia.resumen.total_tardanzas}</span>
                                                </div>
                                                <div className="p-3 border rounded-xl">
                                                    <span className="text-xs text-slate-500 block">Faltas</span>
                                                    <span className="text-base font-bold text-rose-500">{consolidado.asistencia.resumen.total_faltas}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-6">Sin registros de asistencia en el ciclo actual.</p>
                                    )}

                                    {/* Recent attendance logs */}
                                    {consolidado.asistencia.detalle.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Historial Reciente</h4>
                                            <div className="border border-slate-100 rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableBody>
                                                        {consolidado.asistencia.detalle.slice(0, 5).map((asist, idx) => (
                                                            <TableRow key={idx} className="hover:bg-slate-50/50">
                                                                <TableCell className="py-2.5 font-medium text-slate-700">{asist.curso}</TableCell>
                                                                <TableCell className="py-2.5 text-slate-500 text-xs">{new Date(asist.fecha).toLocaleDateString()}</TableCell>
                                                                <TableCell className="py-2.5 text-right">
                                                                    <Badge
                                                                        className={
                                                                            asist.estado === 'ASISTIO'
                                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                                : asist.estado === 'TARDANZA'
                                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                        }
                                                                        variant="outline"
                                                                    >
                                                                        {asist.estado}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Rendimiento Académico / Notas */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="pb-3 border-b border-slate-50">
                                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="size-4.5 text-slate-400" />
                                        Rendimiento Académico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="flex items-center justify-between border bg-slate-50 p-4 rounded-xl">
                                        <div>
                                            <span className="text-xs text-slate-500 block uppercase font-semibold">Promedio General</span>
                                            <span className="text-2xl font-bold text-slate-900">
                                                {consolidado.notas.promedio_general !== null
                                                    ? consolidado.notas.promedio_general.toFixed(3)
                                                    : '0.000'}
                                            </span>
                                        </div>
                                        <Badge className="bg-[#ff7043] text-white hover:bg-[#ff7043] font-bold px-3 py-1 text-xs">
                                            {consolidado.perfil.carrera?.area?.nombre ?? 'General'}
                                        </Badge>
                                    </div>

                                    {/* Mock exam results list */}
                                    {consolidado.notas.examenes.length > 0 ? (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Historial de Exámenes</h4>
                                            <div className="border border-slate-100 rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50">
                                                            <TableHead className="py-2.5">Examen</TableHead>
                                                            <TableHead className="py-2.5 text-center">Puntaje</TableHead>
                                                            <TableHead className="py-2.5 text-center">Puesto</TableHead>
                                                            <TableHead className="py-2.5">Comparativa de Área (Máx/Mín)</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {consolidado.notas.examenes.map((res) => (
                                                            <TableRow key={res.id_resultado} className="hover:bg-slate-50/50">
                                                                <TableCell className="py-2 font-medium">
                                                                    <span className="font-semibold text-slate-900 block">{res.tipo} {res.numero ? `#${res.numero}` : ''}</span>
                                                                    <span className="text-[10px] text-slate-400 block">{new Date(res.fecha).toLocaleDateString()}</span>
                                                                </TableCell>
                                                                <TableCell className="py-2 text-center font-bold text-[#ff7043]">{res.puntaje_total.toFixed(3)}</TableCell>
                                                                <TableCell className="py-2 text-center">
                                                                    {res.puesto ? (
                                                                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold" variant="outline">
                                                                            Puesto {res.puesto}
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-slate-400 text-xs">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-2">
                                                                    {res.max_area !== null && res.min_area !== null ? (
                                                                        <div className="space-y-1 w-[130px]">
                                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                                <span>Min: {res.min_area.toFixed(1)}</span>
                                                                                <span className="font-semibold">Max: {res.max_area.toFixed(1)}</span>
                                                                            </div>
                                                                            {/* Horizontal visual progress bar */}
                                                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                                                                <div
                                                                                    className="h-full bg-[#ff7043] rounded-full"
                                                                                    style={{
                                                                                        width: `${(res.puntaje_total / res.max_area) * 100}%`,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-slate-400 text-xs">Sin métricas</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-6">Sin exámenes rendidos en el ciclo actual.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center border bg-white rounded-xl py-36 px-6 text-center shadow-sm">
                        <Search className="size-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Visualiza un perfil de estudiante en detalle</h3>
                        <p className="text-slate-500 text-sm max-w-md">
                            Introduce el nombre, DNI o código del estudiante en el buscador superior para cargar su Perfil 360° con su historial académico, asistencia y financiero.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

DashboardBi.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
