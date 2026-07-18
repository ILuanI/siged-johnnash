import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { index as estudiantesIndex } from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
import { store as storeMatricula } from '@/actions/App/Http/Controllers/Matriculas/MatriculaWebController';
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

type ArrayProp<T> = T[] | { data?: T[] } | Record<string, T> | null | undefined;

type PageProps = {
    alumnos: ArrayProp<EstudianteListItem>;
    periodos: ArrayProp<PeriodoOption>;
    ciclos: ArrayProp<CicloOption>;
    turnos: ArrayProp<TurnoOption>;
    aulas: ArrayProp<AulaOption>;
};

export default function NuevaMatricula({
    alumnos,
    periodos,
    ciclos,
    turnos,
    aulas,
}: PageProps) {
    const alumnosList = asArray(alumnos);
    const periodosList = asArray(periodos);
    const ciclosList = asArray(ciclos);
    const turnosList = asArray(turnos);
    const aulasList = asArray(aulas);

    const { data, setData, post, processing, errors } = useForm({
        id_alumno: '',
        id_periodo: '',
        id_ciclo: '',
        id_turno: '',
        id_aula: '',
        modalidad: 'PRESENCIAL',
        tipo_pago: 'CONTADO',
        costo_matricula: '',
        costo_simulacro: '',
        costo_carnet: '',
        fecha_matricula: new Date().toISOString().split('T')[0],
        cuotas_matricula: '1',
        cuotas_simulacro: '1',
        fecha_primera_cuota: new Date().toISOString().split('T')[0],
        dias_entre_cuotas: '30',
    });

    const selectedAlumno = alumnosList.find(
        (a) => a.id_alumno.toString() === data.id_alumno,
    );
    const selectedCiclo = ciclosList.find(
        (c) => c.id_ciclo.toString() === data.id_ciclo,
    );

    const costoMat = parseFloat(data.costo_matricula) || 0;
    const costoSin = parseFloat(data.costo_simulacro) || 0;
    const costoCar = parseFloat(data.costo_carnet) || 0;
    const costoTotal = costoMat + costoSin + costoCar;

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
                <h1 className="text-2xl font-bold text-slate-900">
                    Nueva matrícula
                </h1>
                <p className="text-sm text-slate-500">
                    Periodo, ciclo, aula y desglose de costos.
                </p>
            </header>

            <div className="flex min-h-[calc(100vh-14rem)] w-full items-center justify-center px-4 py-8 lg:px-8">
                <div className="grid w-full max-w-[1600px] grid-cols-1 items-stretch gap-8 xl:grid-cols-2">
                    <form
                        onSubmit={submit}
                        className="flex flex-col justify-between space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                    >
                        <div>
                            <Label htmlFor="id_alumno">Alumno *</Label>
                            <Select
                                value={data.id_alumno}
                                onValueChange={(val) =>
                                    setData('id_alumno', val)
                                }
                            >
                                <SelectTrigger
                                    className="w-full"
                                    id="id_alumno"
                                >
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {alumnosList.length > 0 ? (
                                        alumnosList.map((alumno) => (
                                            <SelectItem
                                                key={alumno.id_alumno}
                                                value={alumno.id_alumno.toString()}
                                            >
                                                {alumno.dni} -{' '}
                                                {alumno.apellidos},{' '}
                                                {alumno.nombres} (
                                                {alumno.estado})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem
                                            value="sin-alumnos"
                                            disabled
                                        >
                                            No hay alumnos registrados
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_alumno} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="id_periodo">Periodo *</Label>
                                <Select
                                    value={data.id_periodo}
                                    onValueChange={(val) =>
                                        setData('id_periodo', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="id_periodo"
                                    >
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodosList.map((periodo) => (
                                            <SelectItem
                                                key={periodo.id_periodo}
                                                value={periodo.id_periodo.toString()}
                                            >
                                                {periodo.nombre} ({periodo.anio}
                                                )
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
                                    onValueChange={(val) => {
                                        const c = ciclosList.find(
                                            (ciclo) =>
                                                ciclo.id_ciclo.toString() ===
                                                val,
                                        );
                                        setData((prev) => ({
                                            ...prev,
                                            id_ciclo: val,
                                            costo_matricula: c
                                                ? Number(c.costo_base).toFixed(
                                                      2,
                                                  )
                                                : prev.costo_matricula,
                                        }));
                                    }}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="id_ciclo"
                                    >
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ciclosList.map((ciclo) => (
                                            <SelectItem
                                                key={ciclo.id_ciclo}
                                                value={ciclo.id_ciclo.toString()}
                                            >
                                                {ciclo.nombre} - S/{' '}
                                                {Number(
                                                    ciclo.costo_base,
                                                ).toFixed(2)}
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
                                    onValueChange={(val) =>
                                        setData('id_turno', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="id_turno"
                                    >
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {turnosList.map((turno) => (
                                            <SelectItem
                                                key={turno.id_turno}
                                                value={turno.id_turno.toString()}
                                            >
                                                {turno.nombre}
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
                                    onValueChange={(val) =>
                                        setData('id_aula', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="id_aula"
                                    >
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {aulasList.map((aula) => (
                                            <SelectItem
                                                key={aula.id_aula}
                                                value={aula.id_aula.toString()}
                                            >
                                                {aula.nombre}
                                                {aula.capacidad
                                                    ? ` (cap. ${aula.capacidad})`
                                                    : ''}
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
                                    onValueChange={(val) =>
                                        setData('modalidad', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="modalidad"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRESENCIAL">
                                            Presencial
                                        </SelectItem>
                                        <SelectItem value="VIRTUAL">
                                            Virtual
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.modalidad} />
                            </div>
                            <div>
                                <Label htmlFor="tipo_pago">Tipo de pago</Label>
                                <Select
                                    value={data.tipo_pago}
                                    onValueChange={(val) =>
                                        setData('tipo_pago', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="tipo_pago"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CONTADO">
                                            Contado
                                        </SelectItem>
                                        <SelectItem value="CREDITO">
                                            Crédito
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.tipo_pago} />
                            </div>
                            <div>
                                <Label htmlFor="costo_matricula">
                                    Costo Matrícula
                                </Label>
                                <Input
                                    id="costo_matricula"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.costo_matricula}
                                    onChange={(e) =>
                                        setData(
                                            'costo_matricula',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.costo_matricula} />
                            </div>
                            <div>
                                <Label htmlFor="costo_simulacro">
                                    Costo Simulacros
                                </Label>
                                <Input
                                    id="costo_simulacro"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.costo_simulacro}
                                    onChange={(e) =>
                                        setData(
                                            'costo_simulacro',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.costo_simulacro} />
                            </div>
                            <div>
                                <Label htmlFor="costo_carnet">
                                    Costo Carnet
                                </Label>
                                <Input
                                    id="costo_carnet"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.costo_carnet}
                                    onChange={(e) =>
                                        setData('costo_carnet', e.target.value)
                                    }
                                />
                                <InputError message={errors.costo_carnet} />
                            </div>
                            <div>
                                <Label>Costo Total</Label>
                                <div className="flex h-10 items-center rounded-md border bg-slate-50 px-3 text-sm font-bold text-slate-900">
                                    S/ {costoTotal.toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="fecha_matricula">
                                    Fecha matrícula
                                </Label>
                                <Input
                                    id="fecha_matricula"
                                    type="date"
                                    value={data.fecha_matricula}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_matricula',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError message={errors.fecha_matricula} />
                            </div>
                        </div>

                        {data.tipo_pago === 'CREDITO' && (
                            <div className="grid gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
                                <div>
                                    <Label htmlFor="cuotas_matricula">
                                        Cuotas Matrícula
                                    </Label>
                                    <Input
                                        id="cuotas_matricula"
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={data.cuotas_matricula}
                                        onChange={(e) =>
                                            setData(
                                                'cuotas_matricula',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.cuotas_matricula}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cuotas_simulacro">
                                        Cuotas Simulacro
                                    </Label>
                                    <Input
                                        id="cuotas_simulacro"
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={data.cuotas_simulacro}
                                        onChange={(e) =>
                                            setData(
                                                'cuotas_simulacro',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.cuotas_simulacro}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="fecha_primera_cuota">
                                        Primer vencimiento
                                    </Label>
                                    <Input
                                        id="fecha_primera_cuota"
                                        type="date"
                                        value={data.fecha_primera_cuota}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_primera_cuota',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.fecha_primera_cuota}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dias_entre_cuotas">
                                        Días entre cuotas
                                    </Label>
                                    <Input
                                        id="dias_entre_cuotas"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={data.dias_entre_cuotas}
                                        onChange={(e) =>
                                            setData(
                                                'dias_entre_cuotas',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.dias_entre_cuotas}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#ff7043] hover:bg-[#f4511e]"
                            >
                                Formalizar matrícula
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={estudiantesIndex.url()}>
                                    Cancelar
                                </Link>
                            </Button>
                        </div>
                    </form>

                    {/* Comprobante Preview */}
                    <div className="flex max-w-full flex-col justify-between overflow-x-auto rounded-xl border bg-white p-8 text-sm shadow-sm select-none">
                        <div className="min-w-[600px]">
                            {/* Cabecera */}
                            <div className="mb-4 flex items-start justify-between border-b-2 border-black pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="mr-2 text-5xl leading-none font-bold text-orange-500 italic">
                                        ħ
                                        <span className="text-4xl text-[#00a2e8]">
                                            ◿
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl leading-none font-black tracking-wider text-[#00a2e8]">
                                            John Nash
                                        </h2>
                                        <p className="mt-1 text-[10px] font-bold tracking-widest text-[#00a2e8]">
                                            ACADEMIA PRE-UNIVERSITARIA
                                        </p>
                                    </div>
                                </div>
                                <div className="w-56 rounded-xl border border-black p-2 text-center text-xs shadow-sm">
                                    <p className="mb-1 font-bold text-red-600">
                                        COMPROBANTE DE PAGO
                                    </p>
                                    <p className="font-bold">
                                        RUC: 20601307562
                                    </p>
                                </div>
                            </div>

                            {/* Datos de contacto / empresa */}
                            <div className="mb-4 flex justify-between text-xs text-gray-700 italic">
                                <div>
                                    <p>Prolongación Unión #2285</p>
                                    <p>Trujillo, La Libertad</p>
                                    <p>13006</p>
                                </div>
                                <div className="text-right">
                                    <p>
                                        <span className="font-bold not-italic">
                                            N°:
                                        </span>{' '}
                                        0000
                                    </p>
                                    <p>
                                        <span className="font-bold not-italic">
                                            Teléfono:
                                        </span>{' '}
                                        991 891 109 / 941 249 072
                                    </p>
                                    <p>
                                        <span className="font-bold text-blue-600 not-italic underline">
                                            e-mail:
                                        </span>{' '}
                                        <span className="text-blue-600 underline">
                                            academiajn18@gmail.com
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Datos de la boleta */}
                            <div className="mb-4 grid grid-cols-[120px_1fr_120px_1fr] gap-y-2 border-b-2 border-black pb-4 font-bold">
                                <div className="text-black">Fecha:</div>
                                <div className="font-normal text-red-600 italic">
                                    {data.fecha_matricula
                                        ? new Date(
                                              data.fecha_matricula,
                                          ).toLocaleDateString('es-ES', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : '______________________'}
                                </div>

                                <div className="pl-4 text-black">
                                    Modalidad:
                                </div>
                                <div className="border-b border-dotted border-gray-400 font-normal text-gray-700">
                                    {data.modalidad === 'PRESENCIAL'
                                        ? 'Presencial'
                                        : 'Virtual'}
                                </div>

                                <div className="mt-2 text-black">Cliente:</div>
                                <div className="mt-2 border-b border-dotted border-gray-400 font-normal text-gray-700">
                                    {selectedAlumno?.apoderado
                                        ? selectedAlumno.apoderado.nombres
                                        : selectedAlumno
                                          ? `${selectedAlumno.apellidos}, ${selectedAlumno.nombres}`
                                          : '______________________'}
                                </div>

                                <div className="mt-2 pl-4 text-black">
                                    Contacto:
                                </div>
                                <div className="mt-2 border-b border-dotted border-gray-400 font-normal text-gray-700">
                                    {selectedAlumno?.apoderado
                                        ? selectedAlumno.apoderado.telefono ||
                                          '_________'
                                        : selectedAlumno?.telefono ||
                                          '_________'}
                                </div>

                                <div className="text-black">Estudiante:</div>
                                <div className="border-b border-dotted border-gray-400 font-normal text-gray-700">
                                    {selectedAlumno
                                        ? `${selectedAlumno.apellidos}, ${selectedAlumno.nombres}`
                                        : '______________________'}
                                </div>

                                <div className="pl-4 text-black">Contacto:</div>
                                <div className="border-b border-dotted border-gray-400 font-normal text-gray-700">
                                    {selectedAlumno?.telefono || '_________'}
                                </div>

                                <div className="mt-2 text-black">
                                    Concepto de pago:
                                </div>
                                <div className="mt-2 flex items-center border-b border-dotted border-gray-400 bg-orange-200/50 font-normal text-gray-700">
                                    {selectedCiclo
                                        ? `AL CICLO ${selectedCiclo.nombre}`
                                        : '______________________'}
                                </div>

                                <div className="mt-2 pl-4 text-black">
                                    Tipo de pago:
                                </div>
                                <div className="mt-2 flex items-center border-b border-dotted border-gray-400 bg-orange-200/50 font-normal text-gray-700">
                                    {data.tipo_pago === 'CONTADO'
                                        ? 'CONTADO'
                                        : 'CRÉDITO'}
                                </div>
                            </div>

                            {/* Tabla de desglose */}
                            <table className="mb-2 w-full border-collapse border border-black text-center text-xs">
                                <thead>
                                    <tr className="bg-gray-100 text-red-600">
                                        <th className="w-16 border border-black p-1 font-bold">
                                            Código
                                        </th>
                                        <th className="border border-black p-1 font-bold">
                                            Item
                                        </th>
                                        <th className="w-20 border border-black p-1 font-bold">
                                            Costo
                                        </th>
                                        <th className="w-16 border border-black p-1 font-bold">
                                            N° cuotas
                                        </th>
                                        <th className="w-24 border border-black p-1 font-bold">
                                            Pago por cuota
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costoMat > 0 && (
                                        <tr>
                                            <td className="h-8 border border-black bg-gray-200/50 p-1">
                                                {selectedCiclo?.id_ciclo || ''}
                                            </td>
                                            <td className="border border-black bg-orange-200/50 p-1 px-4 text-left">
                                                Matrícula
                                            </td>
                                            <td className="border border-black p-1">
                                                S/ {costoMat.toFixed(2)}
                                            </td>
                                            <td className="border border-black p-1">
                                                {data.tipo_pago === 'CREDITO'
                                                    ? data.cuotas_matricula
                                                    : '1'}
                                            </td>
                                            <td className="border border-black bg-green-50/50 p-1">
                                                <div className="mx-1 flex h-5 items-center justify-center border border-green-700 bg-white">
                                                    {data.tipo_pago ===
                                                    'CREDITO'
                                                        ? (
                                              costoMat /
                                              Number(
                                                  data.cuotas_matricula || 1,
                                              )
                                          ).toFixed(2)
                                                        : costoMat.toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {costoSin > 0 && (
                                        <tr>
                                            <td className="h-8 border border-black bg-gray-200/50 p-1">
                                                {selectedCiclo?.id_ciclo || ''}
                                            </td>
                                            <td className="border border-black bg-blue-200/50 p-1 px-4 text-left">
                                                Simulacros
                                            </td>
                                            <td className="border border-black p-1">
                                                S/ {costoSin.toFixed(2)}
                                            </td>
                                            <td className="border border-black p-1">
                                                {data.tipo_pago === 'CREDITO'
                                                    ? data.cuotas_simulacro
                                                    : '1'}
                                            </td>
                                            <td className="border border-black bg-green-50/50 p-1">
                                                <div className="mx-1 flex h-5 items-center justify-center border border-green-700 bg-white">
                                                    {data.tipo_pago ===
                                                    'CREDITO'
                                                        ? (
                                              costoSin /
                                              Number(
                                                  data.cuotas_simulacro || 1,
                                              )
                                          ).toFixed(2)
                                                        : costoSin.toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {costoCar > 0 && (
                                        <tr>
                                            <td className="h-8 border border-black bg-gray-200/50 p-1">
                                                {selectedCiclo?.id_ciclo || ''}
                                            </td>
                                            <td className="border border-black bg-purple-200/50 p-1 px-4 text-left">
                                                Carnet
                                            </td>
                                            <td className="border border-black p-1">
                                                S/ {costoCar.toFixed(2)}
                                            </td>
                                            <td className="border border-black p-1">
                                                1
                                            </td>
                                            <td className="border border-black bg-green-50/50 p-1">
                                                <div className="mx-1 flex h-5 items-center justify-center border border-green-700 bg-white">
                                                    {costoCar.toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="h-8 border border-black bg-gray-200/50 p-1"></td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border-r border-b border-l border-black p-1">
                                            S/ -
                                        </td>
                                        <td className="border-b border-black bg-gray-100 p-1 font-bold text-red-600">
                                            Total
                                        </td>
                                        <td className="border-r border-b border-l border-black bg-green-50/50 p-1 font-bold">
                                            S/ {costoTotal.toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function asArray<T>(value: ArrayProp<T>): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === 'object' && Array.isArray(value.data)) {
        return value.data;
    }

    if (value && typeof value === 'object') {
        return Object.values(value);
    }

    return [];
}
