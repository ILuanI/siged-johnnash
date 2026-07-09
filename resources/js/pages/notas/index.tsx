import { Head, Link } from '@inertiajs/react';
import { Upload, Calendar, Search } from 'lucide-react';
import React from 'react';
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

interface ExamenMetrica {
    id_area: number;
    area: {
        id_area: number;
        codigo: string;
        nombre: string;
    };
    puntaje_max: number;
    puntaje_min: number;
}

interface Examen {
    id_examen: number;
    tipo: 'SIMULACRO' | 'CONOCIMIENTO' | 'SEMANAL';
    numero: number | null;
    fecha: string;
    descripcion: string | null;
    ciclo: {
        id_ciclo: number;
        nombre: string;
    };
    metricas: ExamenMetrica[];
}

interface Props {
    examenes: Examen[];
}

export default function NotasIndex({ examenes }: Props) {
    return (
        <>
            <Head title="Notas y Simulacros" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Evaluaciones y Simulacros
                        </h1>
                        <p className="text-sm text-slate-500">
                            Gestiona las calificaciones, simulacros y métricas
                            de rendimiento académico.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/consulta-notas"
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <Search className="size-4 shrink-0" />
                            Consulta Pública Padres
                        </Link>
                        <Link
                            href="/notas/cargar"
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ff7043] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#f4511e]"
                        >
                            <Upload className="size-4 shrink-0" />
                            Cargar Notas (Lector Óptico)
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex-1 px-8 py-6">
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    {examenes.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-600">
                                No hay evaluaciones registradas en el sistema.
                            </p>
                            <Link
                                href="/notas/cargar"
                                className="mt-4 inline-flex"
                            >
                                <Button className="bg-[#ff7043] hover:bg-[#f4511e]">
                                    Cargar primer examen
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="w-[120px]">
                                        Fecha
                                    </TableHead>
                                    <TableHead className="w-[150px]">
                                        Tipo
                                    </TableHead>
                                    <TableHead className="w-[250px]">
                                        Descripción
                                    </TableHead>
                                    <TableHead className="w-[200px]">
                                        Ciclo
                                    </TableHead>
                                    <TableHead>
                                        Métricas por Área (Máx / Mín)
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examenes.map((examen) => (
                                    <TableRow
                                        key={examen.id_examen}
                                        className="hover:bg-slate-50/50"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="size-4 shrink-0" />
                                                {new Date(
                                                    examen.fecha,
                                                ).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    examen.tipo === 'SIMULACRO'
                                                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50'
                                                        : examen.tipo ===
                                                            'CONOCIMIENTO'
                                                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                                                          : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50'
                                                }
                                                variant="outline"
                                            >
                                                {examen.tipo}{' '}
                                                {examen.numero
                                                    ? `#${examen.numero}`
                                                    : ''}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-slate-900">
                                                {examen.descripcion ||
                                                    'Sin descripción'}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {examen.ciclo?.nombre}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-3">
                                                {examen.metricas &&
                                                examen.metricas.length > 0 ? (
                                                    examen.metricas.map(
                                                        (metrica) => (
                                                            <div
                                                                key={
                                                                    metrica.id_area
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                                                            >
                                                                <span className="font-semibold text-slate-900">
                                                                    Área{' '}
                                                                    {metrica.area
                                                                        ?.codigo ??
                                                                        'S/D'}
                                                                </span>
                                                                <span className="font-medium text-emerald-600">
                                                                    Max:{' '}
                                                                    {
                                                                        metrica.puntaje_max
                                                                    }
                                                                </span>
                                                                <span className="text-slate-300">
                                                                    |
                                                                </span>
                                                                <span className="font-medium text-amber-600">
                                                                    Min:{' '}
                                                                    {
                                                                        metrica.puntaje_min
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Sin métricas registradas
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </>
    );
}

NotasIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notas',
            href: '/notas',
        },
    ],
};
