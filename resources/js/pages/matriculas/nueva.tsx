import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
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
    const { data, setData, post, processing, errors } = useForm({
        id_alumno: '',
        id_periodo: '',
        id_ciclo: '',
        id_turno: '',
        id_aula: '',
        modalidad: 'PRESENCIAL',
        tipo_pago: 'CONTADO',
        costo_total: '',
        fecha_matricula: new Date().toISOString().split('T')[0],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/matriculas/nueva');
    };

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
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <Label htmlFor="id_alumno">Alumno *</Label>
                        <Select
                            value={data.id_alumno}
                            onValueChange={(val) => setData('id_alumno', val)}
                        >
                            <SelectTrigger id="id_alumno">
                                <SelectValue placeholder="— Seleccionar —" />
                            </SelectTrigger>
                            <SelectContent>
                                {alumnos.map((a) => (
                                    <SelectItem
                                        key={a.id_alumno}
                                        value={a.id_alumno.toString()}
                                    >
                                        {a.codigo} — {a.apellidos},{' '}
                                        {a.nombres} ({a.estado})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.id_alumno} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="id_periodo">Periodo *</Label>
                            <Select
                                value={data.id_periodo}
                                onValueChange={(val) => setData('id_periodo', val)}
                            >
                                <SelectTrigger id="id_periodo">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodos.map((p) => (
                                        <SelectItem
                                            key={p.id_periodo}
                                            value={p.id_periodo.toString()}
                                        >
                                            {p.nombre} ({p.anio})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_periodo} />
                        </div>
                        <div>
                            <Label htmlFor="id_ciclo">Ciclo *</Label>
                            <Select
                                value={data.id_ciclo}
                                onValueChange={(val) => setData('id_ciclo', val)}
                            >
                                <SelectTrigger id="id_ciclo">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ciclos.map((c) => (
                                        <SelectItem
                                            key={c.id_ciclo}
                                            value={c.id_ciclo.toString()}
                                        >
                                            {c.nombre} — S/{' '}
                                            {Number(c.costo_base).toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_ciclo} />
                        </div>
                        <div>
                            <Label htmlFor="id_turno">Turno *</Label>
                            <Select
                                value={data.id_turno}
                                onValueChange={(val) => setData('id_turno', val)}
                            >
                                <SelectTrigger id="id_turno">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {turnos.map((t) => (
                                        <SelectItem
                                            key={t.id_turno}
                                            value={t.id_turno.toString()}
                                        >
                                            {t.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_turno} />
                        </div>
                        <div>
                            <Label htmlFor="id_aula">Aula *</Label>
                            <Select
                                value={data.id_aula}
                                onValueChange={(val) => setData('id_aula', val)}
                            >
                                <SelectTrigger id="id_aula">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aulas.map((a) => (
                                        <SelectItem
                                            key={a.id_aula}
                                            value={a.id_aula.toString()}
                                        >
                                            {a.nombre}
                                            {a.capacidad ? ` (cap. ${a.capacidad})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_aula} />
                        </div>
                        <div>
                            <Label htmlFor="modalidad">Modalidad</Label>
                            <Select
                                value={data.modalidad}
                                onValueChange={(val) => setData('modalidad', val)}
                            >
                                <SelectTrigger id="modalidad">
                                    <SelectValue placeholder="Modalidad" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRESENCIAL">
                                        Presencial
                                    </SelectItem>
                                    <SelectItem value="VIRTUAL">Virtual</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.modalidad} />
                        </div>
                        <div>
                            <Label htmlFor="tipo_pago">Tipo de pago</Label>
                            <Select
                                value={data.tipo_pago}
                                onValueChange={(val) => setData('tipo_pago', val)}
                            >
                                <SelectTrigger id="tipo_pago">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONTADO">Contado</SelectItem>
                                    <SelectItem value="CREDITO">Crédito</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.tipo_pago} />
                        </div>
                        <div>
                            <Label htmlFor="costo_total">Costo total</Label>
                            <Input
                                id="costo_total"
                                type="number"
                                step="0.01"
                                placeholder="Opcional"
                                value={data.costo_total}
                                onChange={(e) => setData('costo_total', e.target.value)}
                            />
                            <InputError message={errors.costo_total} />
                        </div>
                        <div>
                            <Label htmlFor="fecha_matricula">Fecha matrícula</Label>
                            <Input
                                id="fecha_matricula"
                                type="date"
                                value={data.fecha_matricula}
                                onChange={(e) => setData('fecha_matricula', e.target.value)}
                            />
                            <InputError message={errors.fecha_matricula} />
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
                            <Link href="/matriculas/estudiantes">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
