import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { store as storeMatricula } from '@/actions/App/Http/Controllers/Matriculas/MatriculaWebController';
import { index as estudiantesIndex } from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
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
        numero_cuotas: '2',
        fecha_primera_cuota: new Date().toISOString().split('T')[0],
        dias_entre_cuotas: '30',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeMatricula.url());
    };

    return (
        <>
            <Head title="Nueva matrícula" />

            <header className="border-b bg-white px-8 py-6">
                <Link
                    href={estudiantesIndex.url()}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="size-4" />
                    Volver al directorio
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nueva matrícula</h1>
                <p className="text-sm text-slate-500">Periodo, ciclo, aula y plan de pago.</p>
            </header>

            <div className="mx-auto max-w-2xl px-8 py-8">
                <form onSubmit={submit} className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
                    <div>
                        <Label htmlFor="id_alumno">Alumno *</Label>
                        <Select value={data.id_alumno} onValueChange={(val) => setData('id_alumno', val)}>
                            <SelectTrigger id="id_alumno">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {alumnos.map((alumno) => (
                                    <SelectItem key={alumno.id_alumno} value={alumno.id_alumno.toString()}>
                                        {alumno.codigo} - {alumno.apellidos}, {alumno.nombres} ({alumno.estado})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.id_alumno} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="id_periodo">Periodo *</Label>
                            <Select value={data.id_periodo} onValueChange={(val) => setData('id_periodo', val)}>
                                <SelectTrigger id="id_periodo">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {periodos.map((periodo) => (
                                        <SelectItem key={periodo.id_periodo} value={periodo.id_periodo.toString()}>
                                            {periodo.nombre} ({periodo.anio})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_periodo} />
                        </div>
                        <div>
                            <Label htmlFor="id_ciclo">Ciclo *</Label>
                            <Select value={data.id_ciclo} onValueChange={(val) => setData('id_ciclo', val)}>
                                <SelectTrigger id="id_ciclo">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ciclos.map((ciclo) => (
                                        <SelectItem key={ciclo.id_ciclo} value={ciclo.id_ciclo.toString()}>
                                            {ciclo.nombre} - S/ {Number(ciclo.costo_base).toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_ciclo} />
                        </div>
                        <div>
                            <Label htmlFor="id_turno">Turno *</Label>
                            <Select value={data.id_turno} onValueChange={(val) => setData('id_turno', val)}>
                                <SelectTrigger id="id_turno">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {turnos.map((turno) => (
                                        <SelectItem key={turno.id_turno} value={turno.id_turno.toString()}>
                                            {turno.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_turno} />
                        </div>
                        <div>
                            <Label htmlFor="id_aula">Aula *</Label>
                            <Select value={data.id_aula} onValueChange={(val) => setData('id_aula', val)}>
                                <SelectTrigger id="id_aula">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aulas.map((aula) => (
                                        <SelectItem key={aula.id_aula} value={aula.id_aula.toString()}>
                                            {aula.nombre}
                                            {aula.capacidad ? ` (cap. ${aula.capacidad})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_aula} />
                        </div>
                        <div>
                            <Label htmlFor="modalidad">Modalidad</Label>
                            <Select value={data.modalidad} onValueChange={(val) => setData('modalidad', val)}>
                                <SelectTrigger id="modalidad">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                                    <SelectItem value="VIRTUAL">Virtual</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.modalidad} />
                        </div>
                        <div>
                            <Label htmlFor="tipo_pago">Tipo de pago</Label>
                            <Select value={data.tipo_pago} onValueChange={(val) => setData('tipo_pago', val)}>
                                <SelectTrigger id="tipo_pago">
                                    <SelectValue />
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
                                placeholder="Usa el costo del ciclo si queda vacío"
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

                    {data.tipo_pago === 'CREDITO' && (
                        <div className="grid gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                            <div>
                                <Label htmlFor="numero_cuotas">Cuotas</Label>
                                <Input
                                    id="numero_cuotas"
                                    type="number"
                                    min="2"
                                    max="12"
                                    value={data.numero_cuotas}
                                    onChange={(e) => setData('numero_cuotas', e.target.value)}
                                />
                                <InputError message={errors.numero_cuotas} />
                            </div>
                            <div>
                                <Label htmlFor="fecha_primera_cuota">Primer vencimiento</Label>
                                <Input
                                    id="fecha_primera_cuota"
                                    type="date"
                                    value={data.fecha_primera_cuota}
                                    onChange={(e) => setData('fecha_primera_cuota', e.target.value)}
                                />
                                <InputError message={errors.fecha_primera_cuota} />
                            </div>
                            <div>
                                <Label htmlFor="dias_entre_cuotas">Días entre cuotas</Label>
                                <Input
                                    id="dias_entre_cuotas"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={data.dias_entre_cuotas}
                                    onChange={(e) => setData('dias_entre_cuotas', e.target.value)}
                                />
                                <InputError message={errors.dias_entre_cuotas} />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing} className="bg-[#ff7043] hover:bg-[#f4511e]">
                            Formalizar matrícula
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={estudiantesIndex.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
