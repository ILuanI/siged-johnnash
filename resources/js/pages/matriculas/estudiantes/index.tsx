import { Head, Link, router } from '@inertiajs/react';
import { Search, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
    create as estudiantesCreate,
    index as estudiantesIndex,
} from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
import { StudentProfileModal } from '@/components/matriculas/student-profile-modal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { estadoBadgeClass } from '@/lib/matriculas';
import { useInitials } from '@/hooks/use-initials';
import type {
    CarreraOption,
    ConsolidadoAlumno,
    EstudianteListItem,
} from '@/types/matriculas';
import { cn } from '@/lib/utils';

type PageProps = {
    estudiantes: EstudianteListItem[];
    consolidado: ConsolidadoAlumno | null;
    alumnoId: number | null;
    carreras: CarreraOption[];
    filters: { q: string };
};

export default function EstudiantesIndex({
    estudiantes,
    consolidado,
    alumnoId,
    carreras,
    filters,
}: PageProps) {
    const getInitials = useInitials();
    const [busqueda, setBusqueda] = useState(filters.q ?? '');

    const abrirPerfil = (id: number) => {
        router.get(
            estudiantesIndex.url(),
            { alumno: id, q: filters.q || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const cerrarPerfil = () => {
        router.get(
            estudiantesIndex.url(),
            { q: filters.q || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const buscar = (e: FormEvent) => {
        e.preventDefault();
        router.get(estudiantesIndex.url(), { q: busqueda || undefined });
    };

    return (
        <>
            <Head title="Estudiantes" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Directorio de Estudiantes
                        </h1>
                        <p className="text-sm text-slate-500">
                            {estudiantes.length} estudiante
                            {estudiantes.length !== 1 ? 's' : ''} registrado
                            {estudiantes.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-[#ff7043] hover:bg-[#f4511e]"
                    >
                        <Link href={estudiantesCreate.url()}>
                            <UserPlus className="size-4" />
                            Nuevo estudiante
                        </Link>
                    </Button>
                </div>

                <form
                    onSubmit={buscar}
                    className="relative mt-5 max-w-xl"
                >
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, DNI o código…"
                        className="border-slate-200 bg-slate-50 pl-10"
                    />
                </form>
            </header>

            <div className="flex-1 px-8 py-6">
                {estudiantes.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center">
                        <p className="text-slate-600">
                            No hay estudiantes que coincidan con la búsqueda.
                        </p>
                        <Button asChild className="mt-4" variant="outline">
                            <Link href={estudiantesCreate.url()}>
                                Registrar primer estudiante
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {estudiantes.map((estudiante) => (
                            <li key={estudiante.id_alumno}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        abrirPerfil(estudiante.id_alumno)
                                    }
                                    className={cn(
                                        'flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition hover:border-[#ff7043]/40 hover:shadow-sm',
                                        alumnoId === estudiante.id_alumno &&
                                            'border-[#ff7043] ring-1 ring-[#ff7043]/30',
                                    )}
                                >
                                    <Avatar className="size-12">
                                        <AvatarFallback className="bg-[#1a237e]/10 text-[#1a237e]">
                                            {getInitials(
                                                `${estudiante.nombres} ${estudiante.apellidos}`,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-slate-900">
                                            {estudiante.apellidos},{' '}
                                            {estudiante.nombres}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {estudiante.codigo}
                                            {estudiante.dni
                                                ? ` · DNI ${estudiante.dni}`
                                                : ''}
                                        </p>
                                    </div>
                                    <Badge
                                        className={cn(
                                            'shrink-0 rounded-full text-xs uppercase',
                                            estadoBadgeClass(estudiante.estado),
                                        )}
                                    >
                                        {estudiante.estado}
                                    </Badge>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {consolidado && alumnoId && (
                <StudentProfileModal
                    key={alumnoId}
                    open
                    consolidado={consolidado}
                    carreras={carreras}
                    onClose={cerrarPerfil}
                />
            )}
        </>
    );
}
