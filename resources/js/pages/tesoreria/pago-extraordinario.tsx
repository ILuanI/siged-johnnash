import { Head, router, useForm } from '@inertiajs/react';
import { Landmark, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { index as tesoreriaIndex } from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { store as storePagoExtraordinario } from '@/actions/App/Http/Controllers/Tesoreria/PagoExtraordinarioController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type AlumnoOption = {
    id_alumno: number;
    nombres: string;
    apellidos: string;
    dni: string | null;
};

const CATEGORIAS_INGRESO_FALLBACK: { value: string; label: string }[] = [
    { value: 'ACADEMICO', label: 'Académico' },
    { value: 'SERVICIOS', label: 'Servicios' },
    { value: 'EVENTOS', label: 'Eventos' },
    { value: 'ADMINISTRATIVO', label: 'Administrativo' },
    { value: 'OTROS', label: 'Otros' },
];

type CategoriaIngresoItem = {
    nombre: string;
    descripcion: string | null;
    es_por_defecto: boolean;
};

const CONCEPTOS_COMUNES: { value: string; label: string }[] = [
    { value: 'examen', label: 'Examen' },
    { value: 'simulacro', label: 'Simulacro' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'material', label: 'Material educativo' },
    { value: 'donacion', label: 'Donación' },
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'otro', label: 'Otro / Personalizado' },
];

export default function PagoExtraordinario({
    alumnos,
    alumno_id,
    categoriasIngreso,
}: {
    alumnos: AlumnoOption[];
    alumno_id?: string | null;
    categoriasIngreso?: CategoriaIngresoItem[];
}) {
    const [perteneceEstudiante, setPerteneceEstudiante] = useState(true);
    const [tipoConcepto, setTipoConcepto] = useState('');

    // Categorías dinámicas del mantenedor con fallback al catálogo fijo.
    const categoriasIngresoDisponibles =
        categoriasIngreso && categoriasIngreso.length > 0
            ? categoriasIngreso.map((c) => ({
                  value: c.nombre,
                  label: c.nombre,
              }))
            : CATEGORIAS_INGRESO_FALLBACK;

    const categoriaIngresoPorDefecto =
        categoriasIngreso?.find((c) => c.es_por_defecto)?.nombre ?? 'ACADEMICO';

    const { data, setData, post, processing, errors } = useForm({
        id_alumno: alumno_id ?? '',
        monto: '',
        descripcion: '',
        num_cuotas: '1',
        categoria: categoriaIngresoPorDefecto,
    });

    const alumnoOptions = alumnos.map((alumno) => ({
        value: alumno.id_alumno.toString(),
        label: `${alumno.apellidos}, ${alumno.nombres}${
            alumno.dni ? ` · DNI ${alumno.dni}` : ''
        }`,
        keywords: `${alumno.dni ?? ''} ${alumno.nombres} ${alumno.apellidos}`,
    }));

    const seleccionarConcepto = (value: string) => {
        setTipoConcepto(value);

        if (value === 'otro') {
            setData('descripcion', '');

            return;
        }

        const concepto = CONCEPTOS_COMUNES.find((c) => c.value === value);

        if (concepto) {
            setData('descripcion', concepto.label);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storePagoExtraordinario.url(), {
            onSuccess: () => {
                toast.success('Pago extraordinario registrado correctamente');
            },
        });
    };

    return (
        <>
            <Head title="Pago Extraordinario" />

            <header className="border-b bg-white px-8 py-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Registrar Pago Extraordinario
                </h1>
                <p className="text-sm text-slate-500">
                    Crea un cobro adicional para un estudiante (exámenes,
                    certificados, materiales…) o un ingreso general de caja
                    (donaciones, alquileres, etc.)
                </p>
            </header>

            <div className="mx-auto max-w-2xl px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del cobro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <Checkbox
                                    id="pertenece_estudiante"
                                    checked={perteneceEstudiante}
                                    onCheckedChange={(checked) => {
                                        const activo = checked === true;
                                        setPerteneceEstudiante(activo);

                                        if (!activo) {
                                            setData('id_alumno', '');
                                        }
                                    }}
                                />
                                <div>
                                    <Label
                                        htmlFor="pertenece_estudiante"
                                        className="cursor-pointer font-medium text-slate-800"
                                    >
                                        ¿Este ingreso pertenece a un estudiante?
                                    </Label>
                                    <p className="text-xs text-slate-500">
                                        Desactívalo para registrar un ingreso
                                        general de caja (donación, alquiler,
                                        etc.)
                                    </p>
                                </div>
                            </div>

                            {perteneceEstudiante ? (
                                <div className="space-y-2">
                                    <Label htmlFor="id_alumno">Alumno *</Label>
                                    <Combobox
                                        id="id_alumno"
                                        value={data.id_alumno}
                                        onChange={(val) =>
                                            setData('id_alumno', val)
                                        }
                                        placeholder="Buscar alumno por nombre o DNI…"
                                        searchPlaceholder="Escribe DNI, nombres o apellidos…"
                                        emptyText="Sin resultados. Verifica el DNI o el nombre."
                                        options={alumnoOptions}
                                    />
                                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Search className="size-3" />
                                        El buscador filtra en tiempo real por
                                        DNI, nombres o apellidos.
                                    </p>
                                    <InputError message={errors.id_alumno} />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-3 text-sm text-slate-600">
                                    <Landmark className="size-4 shrink-0 text-slate-400" />
                                    Ingreso general de caja — no se vincula a
                                    ningún estudiante.
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="tipo_concepto">
                                    Concepto / Tipo de Cobro *
                                </Label>
                                <Select
                                    value={tipoConcepto}
                                    onValueChange={seleccionarConcepto}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="tipo_concepto"
                                    >
                                        <SelectValue placeholder="Seleccionar un concepto común o escribir uno propio…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONCEPTOS_COMUNES.map((concepto) => (
                                            <SelectItem
                                                key={concepto.value}
                                                value={concepto.value}
                                            >
                                                {concepto.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {tipoConcepto === 'otro' && (
                                    <div className="space-y-2 pt-1">
                                        <Label htmlFor="descripcion">
                                            Concepto personalizado *
                                        </Label>
                                        <Input
                                            id="descripcion"
                                            maxLength={60}
                                            placeholder="Ej: Examen de Conocimiento - Matemática"
                                            value={data.descripcion}
                                            onChange={(e) => {
                                                setData(
                                                    'descripcion',
                                                    e.target.value,
                                                );
                                                setTipoConcepto('otro');
                                            }}
                                        />
                                        <p className="text-right text-xs text-slate-400">
                                            {data.descripcion.length}/60
                                        </p>
                                    </div>
                                )}
                                {tipoConcepto !== 'otro' &&
                                    data.descripcion && (
                                        <p className="text-xs text-slate-500">
                                            Concepto: “{data.descripcion}”
                                        </p>
                                    )}
                                <InputError message={errors.descripcion} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoria">
                                    Categoría Contable
                                </Label>
                                <Select
                                    value={data.categoria}
                                    onValueChange={(val) =>
                                        setData('categoria', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="categoria"
                                    >
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoriasIngresoDisponibles.map(
                                            (categoria) => (
                                                <SelectItem
                                                    key={categoria.value}
                                                    value={categoria.value}
                                                >
                                                    {categoria.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.categoria} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="monto">Monto *</Label>
                                    <Input
                                        id="monto"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={data.monto}
                                        onChange={(e) =>
                                            setData('monto', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.monto} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="num_cuotas">
                                        N° cuotas
                                    </Label>
                                    <Input
                                        id="num_cuotas"
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={data.num_cuotas}
                                        onChange={(e) =>
                                            setData(
                                                'num_cuotas',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.num_cuotas} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#ff7043] hover:bg-[#f4511e]"
                                >
                                    {processing
                                        ? 'Registrando...'
                                        : 'Registrar Pago'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(tesoreriaIndex.url())
                                    }
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
