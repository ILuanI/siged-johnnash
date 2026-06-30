import { Head, router } from '@inertiajs/react';
import {
    Search,
    Users,
    TrendingUp,
    CreditCard,
    X,
    Phone,
    BookOpen,
    Award,
    Activity,
    Clock,
    DollarSign,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import SemaforoPagos from '@/components/SemaforoPagos';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';

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
    fecha_vencimiento: string;
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
        colegio_procedencia: {
            id_colegio_procedencia: number;
            nombre: string;
        } | null;
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
            telefono: string | null;
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

export default function DashboardBi({
    kpis,
    studentList,
    consolidado,
    ciclos,
    selectedCycleId,
    filters,
}: Props) {
    const getInitials = useInitials();
    const [cycleId, setCycleId] = useState<string>(
        selectedCycleId?.toString() || '',
    );
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const canShowSuggestions =
        showSuggestions &&
        searchQuery.trim().length >= 2 &&
        studentList.length > 0;

    // Apply cycle filter instantly
    const handleCycleChange = (value: string) => {
        setCycleId(value);
        router.get(
            dashboard.url(),
            {
                id_ciclo: value,
                q: searchQuery,
                alumno: filters.alumno,
            },
            {
                preserveState: true,
            },
        );
    };

    // Handle search autocomplete
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            return;
        }

        const delayDebounce = setTimeout(() => {
            router.get(
                dashboard.url(),
                {
                    id_ciclo: cycleId,
                    q: searchQuery,
                    alumno: filters.alumno,
                },
                {
                    preserveState: true,
                    replace: true,
                    onSuccess: () => setShowSuggestions(true),
                },
            );
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [cycleId, filters.alumno, searchQuery]);

    const selectStudent = (alumnoId: number) => {
        setShowSuggestions(false);
        router.get(dashboard.url(), {
            id_ciclo: cycleId,
            q: searchQuery,
            alumno: alumnoId,
        });
    };

    const clearStudent = () => {
        setSearchQuery('');
        router.get(dashboard.url(), {
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
                            Vista general de métricas del ciclo y ficha
                            unificada del rendimiento estudiantil.
                        </p>
                    </div>

                    {/* Cycle Selector */}
                    <div className="flex items-center gap-2">
                        <Label
                            htmlFor="cycle-select"
                            className="text-sm font-semibold text-slate-700"
                        >
                            Ciclo:
                        </Label>
                        <Select
                            value={cycleId}
                            onValueChange={handleCycleChange}
                        >
                            <SelectTrigger
                                id="cycle-select"
                                className="w-[220px] border-slate-200 bg-white"
                            >
                                <SelectValue placeholder="Seleccionar ciclo" />
                            </SelectTrigger>
                            <SelectContent>
                                {ciclos.map((c) => (
                                    <SelectItem
                                        key={c.id_ciclo}
                                        value={c.id_ciclo.toString()}
                                    >
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
                    <Card className="border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Total Matriculados
                            </CardTitle>
                            <Users className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {kpis.total_matriculados}
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                                Alumnos activos en el ciclo
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Tasa de Asistencia
                            </CardTitle>
                            <Activity className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {kpis.tasa_asistencia.toFixed(1)}%
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{
                                        width: `${kpis.tasa_asistencia}%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Promedio de Notas
                            </CardTitle>
                            <TrendingUp className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {kpis.promedio_notas.toFixed(3)}
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                                Puntaje total promedio global
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Recaudación Financiera
                            </CardTitle>
                            <DollarSign className="size-5 text-[#ff7043]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {kpis.tasa_recaudacion.toFixed(1)}%
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{
                                        width: `${kpis.tasa_recaudacion}%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Buscador Global de Alumnos */}
                <div className="relative mx-auto max-w-xl">
                    <Label htmlFor="global-search" className="sr-only">
                        Buscador global de alumno
                    </Label>
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
                            className="border-slate-200 py-6 pr-10 pl-10 text-base focus:border-[#ff7043]"
                        />
                        <Search className="absolute top-4.5 left-3.5 size-5 text-slate-400" />
                        {searchQuery && (
                            <button
                                onClick={clearStudent}
                                className="absolute top-4.5 right-3 text-slate-400 hover:text-slate-600"
                            >
                                <X className="size-5" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown Suggestions */}
                    {canShowSuggestions && (
                        <div className="absolute right-0 left-0 z-50 mt-1.5 max-h-60 overflow-hidden overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                            {studentList.map((item) => (
                                <button
                                    key={item.id_alumno}
                                    onClick={() =>
                                        selectStudent(item.id_alumno)
                                    }
                                    className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 last:border-0 hover:bg-slate-50"
                                >
                                    <span>{item.label}</span>
                                    <Badge
                                        variant="outline"
                                        className="font-normal text-slate-400"
                                    >
                                        Ficha 360
                                    </Badge>
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
                            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                                <div className="h-2 bg-[#ff7043]" />
                                <CardContent className="flex flex-col items-center pt-6 text-center">
                                    <Avatar className="mb-4 size-24 border-2 border-slate-100 shadow-sm">
                                        <AvatarFallback className="bg-[#1a237e]/15 text-2xl font-bold text-[#1a237e]">
                                            {getInitials(
                                                consolidado.perfil
                                                    .nombre_completo,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <h3 className="text-xl leading-snug font-bold text-slate-900">
                                        {consolidado.perfil.apellidos},{' '}
                                        {consolidado.perfil.nombres}
                                    </h3>
                                    <p className="mt-1 font-mono text-sm font-semibold text-[#ff7043]">
                                        Código: {consolidado.perfil.codigo}
                                    </p>

                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        <Badge
                                            className="border-slate-200 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-100"
                                            variant="outline"
                                        >
                                            DNI {consolidado.perfil.dni}
                                        </Badge>
                                        <Badge
                                            className="border-blue-200 bg-blue-50 font-semibold text-blue-700 hover:bg-blue-50"
                                            variant="outline"
                                        >
                                            {consolidado.perfil.estado}
                                        </Badge>
                                    </div>

                                    <div className="mt-6 w-full space-y-3 border-t border-slate-100 pt-4 text-left text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-slate-400">
                                                Carrera:
                                            </span>
                                            <span className="text-right font-semibold text-slate-800">
                                                {consolidado.perfil.carrera
                                                    ?.nombre ?? 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-slate-400">
                                                Área:
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {consolidado.perfil.carrera
                                                    ?.area?.nombre ?? 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-slate-400">
                                                Modalidad:
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {consolidado.matricula_actual
                                                    ?.modalidad ?? 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-slate-400">
                                                Aula / Turno:
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {consolidado.matricula_actual
                                                    ?.aula?.nombre ??
                                                    'N/A'}{' '}
                                                (
                                                {consolidado.matricula_actual
                                                    ?.turno?.nombre ?? 'N/A'}
                                                )
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contactos Alumno y Apoderado */}
                            <Card className="border-slate-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-slate-50 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                        <Phone className="size-4.5 text-slate-400" />
                                        Información de Contacto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 text-sm">
                                    {/* Alumno */}
                                    <div>
                                        <span className="mb-1 block text-xs font-bold tracking-wider text-[#ff7043] uppercase">
                                            Estudiante
                                        </span>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Phone className="size-4 shrink-0 text-slate-400" />
                                                <span>
                                                    {consolidado.perfil
                                                        .telefono ||
                                                        'Sin teléfono'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <BookOpen className="size-4 shrink-0 text-slate-400" />
                                                <span>
                                                    {consolidado.perfil
                                                        .colegio_procedencia
                                                        ?.nombre ||
                                                        'Sin colegio registrado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Apoderado */}
                                    {consolidado.perfil.apoderado ? (
                                        <div className="border-t border-slate-100 pt-3">
                                            <span className="mb-1 block text-xs font-bold tracking-wider text-[#ff7043] uppercase">
                                                Apoderado
                                            </span>
                                            <p className="mb-2 font-semibold text-slate-800">
                                                {
                                                    consolidado.perfil.apoderado
                                                        .nombres
                                                }
                                            </p>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Phone className="size-4 shrink-0 text-slate-400" />
                                                    <span>
                                                        {consolidado.perfil
                                                            .apoderado
                                                            .telefono ||
                                                            'Sin teléfono'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">
                                            No se ha registrado información de
                                            apoderado.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Columna Derecha: Finanzas, Asistencia y Rendimiento */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Semáforo Financiero */}
                            <Card className="border-slate-200 bg-white shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                            <CreditCard className="size-4.5 text-slate-400" />
                                            Estado Financiero
                                        </CardTitle>
                                        <CardDescription>
                                            Detalle de cuotas y saldo pendiente.
                                        </CardDescription>
                                    </div>

                                    <SemaforoPagos
                                        cuotas={consolidado.finanzas.cuotas}
                                    />
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                                        <div>
                                            <span className="block text-xs text-slate-500">
                                                Costo Total
                                            </span>
                                            <span className="text-lg font-bold text-slate-900">
                                                S/{' '}
                                                {consolidado.finanzas.costo_total.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-500">
                                                Pagado
                                            </span>
                                            <span className="text-lg font-bold text-emerald-600">
                                                S/{' '}
                                                {(
                                                    consolidado.finanzas
                                                        .costo_total -
                                                    consolidado.finanzas
                                                        .saldo_pendiente
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-500">
                                                Saldo Pendiente
                                            </span>
                                            <span className="text-lg font-bold text-rose-600">
                                                S/{' '}
                                                {consolidado.finanzas.saldo_pendiente.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cuotas list */}
                                    {consolidado.finanzas.cuotas.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border border-slate-100">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-slate-50">
                                                        <TableHead className="py-2.5">
                                                            N° Cuota
                                                        </TableHead>
                                                        <TableHead className="py-2.5">
                                                            Monto
                                                        </TableHead>
                                                        <TableHead className="py-2.5">
                                                            Vencimiento
                                                        </TableHead>
                                                        <TableHead className="py-2.5 text-right">
                                                            Estado
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {consolidado.finanzas.cuotas.map(
                                                        (cuota) => (
                                                            <TableRow
                                                                key={
                                                                    cuota.id_cuota
                                                                }
                                                                className="hover:bg-slate-50/50"
                                                            >
                                                                <TableCell className="py-2 font-medium">
                                                                    Cuota{' '}
                                                                    {
                                                                        cuota.numero_cuota
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="py-2">
                                                                    S/{' '}
                                                                    {cuota.monto.toFixed(
                                                                        2,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="py-2">
                                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                        <Clock className="size-3.5" />
                                                                        {new Date(
                                                                            `${cuota.fecha_vencimiento}T00:00:00`,
                                                                        ).toLocaleDateString()}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="py-2 text-right">
                                                                    <Badge
                                                                        className={
                                                                            cuota.estado ===
                                                                            'PAGADA'
                                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                                : cuota.estado ===
                                                                                    'VENCIDA'
                                                                                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                                                                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                                                                        }
                                                                        variant="outline"
                                                                    >
                                                                        {
                                                                            cuota.estado
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="py-4 text-center text-xs text-slate-400">
                                            Pago realizado en Modalidad Al
                                            Contado.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Asistencia Resumen */}
                            <Card className="border-slate-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-slate-50 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                        <Activity className="size-4.5 text-slate-400" />
                                        Asistencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {consolidado.asistencia.resumen ? (
                                        <div className="grid items-center gap-6 md:grid-cols-3">
                                            {/* Progress rate bar */}
                                            <div className="flex flex-col items-center justify-center rounded-xl border bg-slate-50 p-4 md:col-span-1">
                                                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    Asistencia %
                                                </span>
                                                <span
                                                    className={`mt-1 text-3xl font-extrabold ${
                                                        consolidado.asistencia
                                                            .resumen
                                                            .tasa_asistencia !==
                                                            null &&
                                                        consolidado.asistencia
                                                            .resumen
                                                            .tasa_asistencia >=
                                                            90
                                                            ? 'text-emerald-600'
                                                            : consolidado
                                                                    .asistencia
                                                                    .resumen
                                                                    .tasa_asistencia !==
                                                                    null &&
                                                                consolidado
                                                                    .asistencia
                                                                    .resumen
                                                                    .tasa_asistencia >=
                                                                    75
                                                              ? 'text-amber-500'
                                                              : 'text-rose-500'
                                                    }`}
                                                >
                                                    {consolidado.asistencia
                                                        .resumen
                                                        .tasa_asistencia !==
                                                    null
                                                        ? `${consolidado.asistencia.resumen.tasa_asistencia.toFixed(1)}%`
                                                        : '0%'}
                                                </span>
                                                <span className="mt-1 text-[10px] font-medium text-slate-400">
                                                    {consolidado.asistencia
                                                        .resumen
                                                        .total_asistencias +
                                                        consolidado.asistencia
                                                            .resumen
                                                            .total_tardanzas}{' '}
                                                    de{' '}
                                                    {
                                                        consolidado.asistencia
                                                            .resumen
                                                            .total_clases
                                                    }{' '}
                                                    clases
                                                </span>
                                            </div>

                                            {/* Stats breakdown */}
                                            <div className="grid grid-cols-3 gap-3 text-center text-sm md:col-span-2">
                                                <div className="rounded-xl border p-3">
                                                    <span className="block text-xs text-slate-500">
                                                        Asistencias
                                                    </span>
                                                    <span className="text-base font-bold text-emerald-600">
                                                        {
                                                            consolidado
                                                                .asistencia
                                                                .resumen
                                                                .total_asistencias
                                                        }
                                                    </span>
                                                </div>
                                                <div className="rounded-xl border p-3">
                                                    <span className="block text-xs text-slate-500">
                                                        Tardanzas
                                                    </span>
                                                    <span className="text-base font-bold text-amber-500">
                                                        {
                                                            consolidado
                                                                .asistencia
                                                                .resumen
                                                                .total_tardanzas
                                                        }
                                                    </span>
                                                </div>
                                                <div className="rounded-xl border p-3">
                                                    <span className="block text-xs text-slate-500">
                                                        Faltas
                                                    </span>
                                                    <span className="text-base font-bold text-rose-500">
                                                        {
                                                            consolidado
                                                                .asistencia
                                                                .resumen
                                                                .total_faltas
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-slate-500">
                                            Sin registros de asistencia en el
                                            ciclo actual.
                                        </p>
                                    )}

                                    {/* Recent attendance logs */}
                                    {consolidado.asistencia.detalle.length >
                                        0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
                                                Historial Reciente
                                            </h4>
                                            <div className="overflow-hidden rounded-lg border border-slate-100">
                                                <Table>
                                                    <TableBody>
                                                        {consolidado.asistencia.detalle
                                                            .slice(0, 5)
                                                            .map(
                                                                (
                                                                    asist,
                                                                    idx,
                                                                ) => (
                                                                    <TableRow
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="hover:bg-slate-50/50"
                                                                    >
                                                                        <TableCell className="py-2.5 font-medium text-slate-700">
                                                                            {
                                                                                asist.curso
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="py-2.5 text-xs text-slate-500">
                                                                            {new Date(
                                                                                asist.fecha,
                                                                            ).toLocaleDateString()}
                                                                        </TableCell>
                                                                        <TableCell className="py-2.5 text-right">
                                                                            <Badge
                                                                                className={
                                                                                    asist.estado ===
                                                                                    'ASISTIO'
                                                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                                        : asist.estado ===
                                                                                            'TARDANZA'
                                                                                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                                                          : 'border-rose-200 bg-rose-50 text-rose-700'
                                                                                }
                                                                                variant="outline"
                                                                            >
                                                                                {
                                                                                    asist.estado
                                                                                }
                                                                            </Badge>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Rendimiento Académico / Notas */}
                            <Card className="border-slate-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-slate-50 pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                                        <Award className="size-4.5 text-slate-400" />
                                        Rendimiento Académico
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-4">
                                        <div>
                                            <span className="block text-xs font-semibold text-slate-500 uppercase">
                                                Promedio General
                                            </span>
                                            <span className="text-2xl font-bold text-slate-900">
                                                {consolidado.notas
                                                    .promedio_general !== null
                                                    ? consolidado.notas.promedio_general.toFixed(
                                                          3,
                                                      )
                                                    : '0.000'}
                                            </span>
                                        </div>
                                        <Badge className="bg-[#ff7043] px-3 py-1 text-xs font-bold text-white hover:bg-[#ff7043]">
                                            {consolidado.perfil.carrera?.area
                                                ?.nombre ?? 'General'}
                                        </Badge>
                                    </div>

                                    {/* Mock exam results list */}
                                    {consolidado.notas.examenes.length > 0 ? (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
                                                Historial de Exámenes
                                            </h4>
                                            <div className="overflow-hidden rounded-lg border border-slate-100">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-slate-50">
                                                            <TableHead className="py-2.5">
                                                                Examen
                                                            </TableHead>
                                                            <TableHead className="py-2.5 text-center">
                                                                Puntaje
                                                            </TableHead>
                                                            <TableHead className="py-2.5 text-center">
                                                                Puesto
                                                            </TableHead>
                                                            <TableHead className="py-2.5">
                                                                Comparativa de
                                                                Área (Máx/Mín)
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {consolidado.notas.examenes.map(
                                                            (res) => (
                                                                <TableRow
                                                                    key={
                                                                        res.id_resultado
                                                                    }
                                                                    className="hover:bg-slate-50/50"
                                                                >
                                                                    <TableCell className="py-2 font-medium">
                                                                        <span className="block font-semibold text-slate-900">
                                                                            {
                                                                                res.tipo
                                                                            }{' '}
                                                                            {res.numero
                                                                                ? `#${res.numero}`
                                                                                : ''}
                                                                        </span>
                                                                        <span className="block text-[10px] text-slate-400">
                                                                            {new Date(
                                                                                res.fecha,
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-center font-bold text-[#ff7043]">
                                                                        {res.puntaje_total.toFixed(
                                                                            3,
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-center">
                                                                        {res.puesto ? (
                                                                            <Badge
                                                                                className="border-amber-200 bg-amber-50 font-bold text-amber-700"
                                                                                variant="outline"
                                                                            >
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
                                                                    <TableCell className="py-2">
                                                                        {res.max_area !==
                                                                            null &&
                                                                        res.min_area !==
                                                                            null ? (
                                                                            <div className="w-[130px] space-y-1">
                                                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                                                    <span>
                                                                                        Min:{' '}
                                                                                        {res.min_area.toFixed(
                                                                                            1,
                                                                                        )}
                                                                                    </span>
                                                                                    <span className="font-semibold">
                                                                                        Max:{' '}
                                                                                        {res.max_area.toFixed(
                                                                                            1,
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                                {/* Horizontal visual progress bar */}
                                                                                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                                                    <div
                                                                                        className="h-full rounded-full bg-[#ff7043]"
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
                                                                            </span>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-slate-500">
                                            Sin exámenes rendidos en el ciclo
                                            actual.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border bg-white px-6 py-36 text-center shadow-sm">
                        <Search className="mb-4 size-12 text-slate-300" />
                        <h3 className="mb-1 text-lg font-bold text-slate-800">
                            Visualiza un perfil de estudiante en detalle
                        </h3>
                        <p className="max-w-md text-sm text-slate-500">
                            Introduce el nombre, DNI o código del estudiante en
                            el buscador superior para cargar su Perfil 360° con
                            su historial académico, asistencia y financiero.
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
            href: dashboard.url(),
        },
    ],
};
