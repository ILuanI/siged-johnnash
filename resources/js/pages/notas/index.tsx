import { Head, Link } from '@inertiajs/react';
import { Upload, Calendar, Search, Award, BookOpen, FileText, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTipo, setActiveTipo] = useState<string>('TODOS');

    // Cálculos de KPIs
    const totalExamenes = examenes.length;
    const simulacros = examenes.filter((e) => e.tipo === 'SIMULACRO').length;
    const semanales = examenes.filter((e) => e.tipo === 'SEMANAL').length;
    const conocimientos = examenes.filter((e) => e.tipo === 'CONOCIMIENTO').length;

    // Filtrado
    const filteredExamenes = examenes.filter((examen) => {
        const matchesSearch =
            (examen.descripcion?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (examen.ciclo?.nombre?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesTipo = activeTipo === 'TODOS' || examen.tipo === activeTipo;
        return matchesSearch && matchesTipo;
    });

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
                            Gestiona las calificaciones, simulacros y métricas de rendimiento académico.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/portal-padres"
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

            <main className="flex-1 space-y-6 px-8 py-6">
                {/* Panel de KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-slate-400 shadow-sm">
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Total Evaluaciones</p>
                                <p className="text-2xl font-bold text-slate-800">{totalExamenes}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                <Award className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Simulacros</p>
                                <p className="text-2xl font-bold text-slate-800">{simulacros}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm">
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Semanales</p>
                                <p className="text-2xl font-bold text-slate-800">{semanales}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardContent className="flex items-center gap-4 py-5">
                            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                                <CheckCircle className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Conocimientos</p>
                                <p className="text-2xl font-bold text-slate-800">{conocimientos}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros e Inputs */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Buscar evaluación por descripción o ciclo..."
                            className="pl-9 bg-slate-50 border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'TODOS', label: 'Todos' },
                            { key: 'SIMULACRO', label: 'Simulacros' },
                            { key: 'SEMANAL', label: 'Semanales' },
                            { key: 'CONOCIMIENTO', label: 'Conocimientos' },
                        ].map((btn) => (
                            <button
                                key={btn.key}
                                onClick={() => setActiveTipo(btn.key)}
                                className={cn(
                                    'rounded-full border px-4 py-1.5 text-xs font-medium transition cursor-pointer',
                                    activeTipo === btn.key
                                        ? 'bg-[#ff7043] border-[#ff7043] text-white'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                )}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Exámenes */}
                {filteredExamenes.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center shadow-sm">
                        <p className="text-slate-500">
                            No se encontraron evaluaciones que coincidan con los filtros aplicados.
                        </p>
                        <Link href="/notas/cargar" className="mt-4 inline-block">
                            <Button className="bg-[#ff7043] hover:bg-[#f4511e]">
                                Cargar Notas
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredExamenes.map((examen) => (
                            <div
                                key={examen.id_examen}
                                className="group relative rounded-xl border bg-white p-5 shadow-sm transition hover:border-[#ff7043]/40 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <Badge
                                        className={cn(
                                            'shrink-0 rounded-full text-xs font-semibold px-2.5 py-0.5 uppercase tracking-wide',
                                            examen.tipo === 'SIMULACRO'
                                                ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50'
                                                : examen.tipo === 'CONOCIMIENTO'
                                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                                                  : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50'
                                        )}
                                        variant="outline"
                                    >
                                        {examen.tipo} {examen.numero ? `#${examen.numero}` : ''}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Calendar className="size-3.5" />
                                        <span>{new Date(examen.fecha).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-[#ff7043] transition-colors line-clamp-1">
                                    {examen.descripcion || 'Evaluación sin descripción'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Ciclo: <span className="font-medium text-slate-700">{examen.ciclo?.nombre}</span>
                                </p>

                                <div className="mt-5 border-t pt-4">
                                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                                        Métricas por Área (Max | Min)
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {examen.metricas && examen.metricas.length > 0 ? (
                                            examen.metricas.map((metrica) => (
                                                <div
                                                    key={metrica.id_area}
                                                    className="flex flex-col rounded-lg bg-slate-50 p-2.5 border border-slate-100"
                                                >
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                                                        Área {metrica.area?.codigo ?? 'S/D'}
                                                    </span>
                                                    <div className="flex items-center justify-between mt-1 text-[11px]">
                                                        <span className="text-emerald-600 font-semibold">
                                                            Max: {metrica.puntaje_max}
                                                        </span>
                                                        <span className="text-amber-600 font-semibold">
                                                            Min: {metrica.puntaje_min}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-3 text-center text-xs text-slate-400">
                                                Sin métricas registradas
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
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
