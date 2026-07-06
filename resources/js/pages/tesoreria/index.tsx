import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SemaforoPagos } from '@/components/pagos/SemaforoPagos';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { estadoBadgeClass } from '@/lib/matriculas';
import { cn } from '@/lib/utils';
import {
    index as tesoreriaIndex,
    show as tesoreriaShow,
} from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';

export default function TesoreriaIndex({ alumnos, filters }: any) {
    const getInitials = useInitials();
    const [busqueda, setBusqueda] = useState(filters.search ?? '');

    const buscar = (e: FormEvent) => {
        e.preventDefault();
        router.get(tesoreriaIndex.url(), { search: busqueda || undefined });
    };

    return (
        <>
            <Head title="Tesorería - Pagos y Deudas" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Estado Financiero de Estudiantes
                        </h1>
                        <p className="text-sm text-slate-500">
                            Monitor de deudas y pagos
                        </p>
                    </div>
                </div>

                <form onSubmit={buscar} className="relative mt-5 max-w-xl">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o DNI…"
                        className="border-slate-200 bg-slate-50 pl-10"
                    />
                </form>
            </header>

            <div className="flex-1 px-8 py-6">
                {alumnos.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center">
                        <p className="text-slate-600">
                            No hay estudiantes que coincidan con la búsqueda.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {alumnos.data.map((estudiante: any) => {
                            const lastMatricula = estudiante.matriculas?.[0];
                            const cuotas =
                                lastMatricula?.comprobante_pago?.cuotas || [];

                            return (
                                <li key={estudiante.id_alumno}>
                                    <div className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left">
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
                                                {estudiante.dni
                                                    ? `DNI ${estudiante.dni}`
                                                    : 'Sin DNI'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    className={cn(
                                                        'shrink-0 rounded-full text-xs uppercase',
                                                        estadoBadgeClass(
                                                            estudiante.estado,
                                                        ),
                                                    )}
                                                >
                                                    {estudiante.estado}
                                                </Badge>
                                                {cuotas.length > 0 ? (
                                                    <SemaforoPagos
                                                        cuotas={cuotas}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Sin plan de pago
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link
                                                    href={tesoreriaShow.url({
                                                        alumno: estudiante.id_alumno,
                                                    })}
                                                >
                                                    Ver Cuenta
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
}
