import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { EstudianteListItem } from '@/types/matriculas';

type PeriodoOption = {
    id_periodo: number;
    nombre: string;
    anio: number;
};

type CicloOption = {
    id_ciclo: number;
    nombre: string;
    costo_base: string;
    id_periodo: number | null;
    periodo?: { nombre: string } | null;
};

type TurnoOption = { id_turno: number; nombre: string };
type AulaOption = {
    id_aula: number;
    nombre: string;
    capacidad: number | null;
};

type PageProps = {
    alumnos: EstudianteListItem[];
    periodos: PeriodoOption[];
    ciclos: CicloOption[];
    turnos: TurnoOption[];
    aulas: AulaOption[];
};

export default function NuevaMatricula({
    alumnos,
    periodos,
    ciclos,
    turnos,
    aulas,
}: PageProps) {
    return (
        <>
            <Head title="Nueva matrícula" />

            <header className="border-b bg-white px-8 py-6">
                <Link
                    href="/matriculas/estudiantes"
                    className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="size-4" />
                    Volver al directorio
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    Nueva matrícula
                </h1>
                <p className="text-sm text-slate-500">
                    Asignar periodo, ciclo, turno y aula (RI002)
                </p>
            </header>

            <div className="mx-auto max-w-2xl px-8 py-8">
                <Form
                    action="/matriculas/nueva"
                    method="post"
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <Label htmlFor="id_alumno">Alumno *</Label>
                                <select
                                    id="id_alumno"
                                    name="id_alumno"
                                    required
                                    className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                >
                                    <option value="">— Seleccionar —</option>
                                    {alumnos.map((a) => (
                                        <option
                                            key={a.id_alumno}
                                            value={a.id_alumno}
                                        >
                                            {a.codigo} — {a.apellidos},{' '}
                                            {a.nombres} ({a.estado})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.id_alumno} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="id_periodo">
                                        Periodo *
                                    </Label>
                                    <select
                                        id="id_periodo"
                                        name="id_periodo"
                                        required
                                        className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                    >
                                        {periodos.map((p) => (
                                            <option
                                                key={p.id_periodo}
                                                value={p.id_periodo}
                                            >
                                                {p.nombre} ({p.anio})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="id_ciclo">Ciclo *</Label>
                                    <select
                                        id="id_ciclo"
                                        name="id_ciclo"
                                        required
                                        className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                    >
                                        {ciclos.map((c) => (
                                            <option
                                                key={c.id_ciclo}
                                                value={c.id_ciclo}
                                            >
                                                {c.nombre} — S/{' '}
                                                {Number(c.costo_base).toFixed(
                                                    2,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="id_turno">Turno *</Label>
                                    <select
                                        id="id_turno"
                                        name="id_turno"
                                        required
                                        className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                    >
                                        {turnos.map((t) => (
                                            <option
                                                key={t.id_turno}
                                                value={t.id_turno}
                                            >
                                                {t.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="id_aula">Aula *</Label>
                                    <select
                                        id="id_aula"
                                        name="id_aula"
                                        required
                                        className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                    >
                                        {aulas.map((a) => (
                                            <option
                                                key={a.id_aula}
                                                value={a.id_aula}
                                            >
                                                {a.nombre}
                                                {a.capacidad
                                                    ? ` (cap. ${a.capacidad})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="modalidad">
                                        Modalidad
                                    </Label>
                                    <select
                                        id="modalidad"
                                        name="modalidad"
                                        className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                    >
                                        <option value="PRESENCIAL">
                                            Presencial
                                        </option>
                                        <option value="VIRTUAL">
                                            Virtual
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="tipo_pago">
                                        Tipo de pago
                                    </Label>
                                    <select
                                        id="tipo_pago"
                                        name="tipo_pago"
                                        className="flex h-9 w-full rounded-md border border-input px-3 text-sm"
                                    >
                                        <option value="CONTADO">
                                            Contado
                                        </option>
                                        <option value="CREDITO">
                                            Crédito
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#ff7043] hover:bg-[#f4511e]"
                                >
                                    Formalizar matrícula
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/matriculas/estudiantes">
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
