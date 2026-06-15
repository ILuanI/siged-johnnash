import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { CarreraOption } from '@/types/matriculas';

interface Area {
    id_area: number;
    nombre: string;
    codigo: string;
}

type PageProps = {
    carreras: CarreraOption[];
    areas: Area[];
};

export default function EstudianteCreate({ carreras, areas }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        nombres: '',
        apellidos: '',
        dni: '',
        fecha_nac: '',
        sexo: '',
        id_carrera: '',
        telefono: '',
        correo: '',
        direccion: '',
        colegio_proc: '',
        apoderado: {
            nombres: '',
            dni: '',
            parentesco: '',
            telefono: '',
            correo: '',
        },
    });

    const [isCarreraDialogOpen, setIsCarreraDialogOpen] = useState(false);
    const [carreraNombre, setCarreraNombre] = useState('');
    const [carreraAreaId, setCarreraAreaId] = useState('');
    const [carreraPuntajeMin, setCarreraPuntajeMin] = useState('');
    const [carreraPuntajeMax, setCarreraPuntajeMax] = useState('');
    const [carreraErrors, setCarreraErrors] = useState<any>({});
    const [carreraLoading, setCarreraLoading] = useState(false);

    const handleCreateCarrera = (e: React.FormEvent) => {
        e.preventDefault();
        setCarreraLoading(true);
        setCarreraErrors({});

        router.post('/matriculas/carreras', {
            nombre: carreraNombre,
            id_area: carreraAreaId,
            puntaje_min: carreraPuntajeMin || null,
            puntaje_max: carreraPuntajeMax || null,
        }, {
            onSuccess: () => {
                setIsCarreraDialogOpen(false);
                setCarreraNombre('');
                setCarreraAreaId('');
                setCarreraPuntajeMin('');
                setCarreraPuntajeMax('');
                toast.success('Carrera creada exitosamente');
            },
            onError: (errs) => {
                setCarreraErrors(errs);
                const fieldsOrder = ['nombre', 'id_area', 'puntaje_min', 'puntaje_max'] as const;
                fieldsOrder.forEach((field) => {
                    if (errs[field]) {
                        toast.error(errs[field], {
                            className: 'bg-rose-50 border-rose-200 text-rose-800'
                        });
                    }
                });
            },
            onFinish: () => setCarreraLoading(false),
            preserveState: true,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/matriculas/estudiantes', {
            onError: (errs) => {
                console.error(errs);
                const fieldsOrder = [
                    'nombres',
                    'apellidos',
                    'dni',
                    'fecha_nac',
                    'sexo',
                    'id_carrera',
                    'telefono',
                    'correo',
                    'direccion',
                    'colegio_proc',
                    'apoderado.nombres',
                    'apoderado.dni',
                    'apoderado.parentesco',
                    'apoderado.telefono',
                    'apoderado.correo'
                ] as const;
                fieldsOrder.forEach((field) => {
                    if (errs[field]) {
                        toast.error(errs[field], {
                            className: 'bg-rose-50 border-rose-200 text-rose-800'
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Nuevo estudiante" />

            <header className="border-b bg-white px-8 py-6">
                <Link
                    href="/matriculas/estudiantes"
                    className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="size-4" />
                    Volver al directorio
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    Registrar estudiante
                </h1>
                <p className="text-sm text-slate-500">
                    Datos personales del alumno (RI001)
                </p>
            </header>

            <div className="mx-auto max-w-2xl px-8 py-8">
                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="nombres">Nombres *</Label>
                            <Input
                                id="nombres"
                                value={data.nombres}
                                onChange={(e) => setData('nombres', e.target.value)}
                                required
                            />
                            <InputError message={errors.nombres} />
                        </div>
                        <div>
                            <Label htmlFor="apellidos">Apellidos *</Label>
                            <Input
                                id="apellidos"
                                value={data.apellidos}
                                onChange={(e) => setData('apellidos', e.target.value)}
                                required
                            />
                            <InputError message={errors.apellidos} />
                        </div>
                        <div>
                            <Label htmlFor="dni">DNI</Label>
                            <Input
                                id="dni"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value)}
                                maxLength={8}
                                pattern="\d{8}"
                            />
                            <InputError message={errors.dni} />
                        </div>
                        <div>
                            <Label htmlFor="fecha_nac">Fecha de nacimiento</Label>
                            <Input
                                id="fecha_nac"
                                type="date"
                                value={data.fecha_nac}
                                onChange={(e) => setData('fecha_nac', e.target.value)}
                            />
                            <InputError message={errors.fecha_nac} />
                        </div>
                        <div>
                            <Label htmlFor="sexo">Sexo</Label>
                            <Select
                                value={data.sexo}
                                onValueChange={(val) => setData('sexo', val)}
                            >
                                <SelectTrigger id="sexo">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">M</SelectItem>
                                    <SelectItem value="F">F</SelectItem>
                                    <SelectItem value="OTRO">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.sexo} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="id_carrera" className="mb-0">Carrera</Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setIsCarreraDialogOpen(true)}
                                    className="h-auto p-0 text-xs text-[#ff7043] hover:text-[#f4511e] flex items-center"
                                >
                                    <Plus className="mr-1 size-3" />
                                    Nueva carrera
                                </Button>
                            </div>
                            <Select
                                value={data.id_carrera}
                                onValueChange={(val) => setData('id_carrera', val)}
                            >
                                <SelectTrigger id="id_carrera">
                                    <SelectValue placeholder="— Sin carrera —" />
                                </SelectTrigger>
                                <SelectContent>
                                    {carreras.map((c) => (
                                        <SelectItem
                                            key={c.id_carrera}
                                            value={c.id_carrera.toString()}
                                        >
                                            {c.nombre}
                                            {c.area ? ` (Área ${c.area.codigo})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_carrera} />
                        </div>
                        <div>
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                                id="telefono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                            />
                            <InputError message={errors.telefono} />
                        </div>
                        <div>
                            <Label htmlFor="correo">Correo</Label>
                            <Input
                                id="correo"
                                type="email"
                                value={data.correo}
                                onChange={(e) => setData('correo', e.target.value)}
                            />
                            <InputError message={errors.correo} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input
                                id="direccion"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                            />
                            <InputError message={errors.direccion} />
                        </div>
                        <div>
                            <Label htmlFor="colegio_proc">Colegio de procedencia</Label>
                            <Input
                                id="colegio_proc"
                                value={data.colegio_proc}
                                onChange={(e) => setData('colegio_proc', e.target.value)}
                            />
                            <InputError message={errors.colegio_proc} />
                        </div>
                    </div>

                    <hr className="border-slate-100" />
                    <p className="text-sm font-medium text-slate-700">
                        Apoderado (opcional)
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Label htmlFor="apoderado_nombres">Nombres</Label>
                            <Input
                                id="apoderado_nombres"
                                value={data.apoderado.nombres}
                                onChange={(e) =>
                                    setData('apoderado', {
                                        ...data.apoderado,
                                        nombres: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors['apoderado.nombres']} />
                        </div>
                        <div>
                            <Label htmlFor="apoderado_dni">DNI</Label>
                            <Input
                                id="apoderado_dni"
                                maxLength={8}
                                pattern="\d{8}"
                                value={data.apoderado.dni}
                                onChange={(e) =>
                                    setData('apoderado', {
                                        ...data.apoderado,
                                        dni: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors['apoderado.dni']} />
                        </div>
                        <div>
                            <Label htmlFor="apoderado_parentesco">Parentesco</Label>
                            <Input
                                id="apoderado_parentesco"
                                placeholder="Madre, Padre…"
                                value={data.apoderado.parentesco}
                                onChange={(e) =>
                                    setData('apoderado', {
                                        ...data.apoderado,
                                        parentesco: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors['apoderado.parentesco']} />
                        </div>
                        <div>
                            <Label htmlFor="apoderado_telefono">Teléfono</Label>
                            <Input
                                id="apoderado_telefono"
                                value={data.apoderado.telefono}
                                onChange={(e) =>
                                    setData('apoderado', {
                                        ...data.apoderado,
                                        telefono: e.target.value,
                                    })
                                }
                            />
                            <InputError message={errors['apoderado.telefono']} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#ff7043] hover:bg-[#f4511e]"
                        >
                            Registrar estudiante
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/matriculas/estudiantes">Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>

            <Dialog open={isCarreraDialogOpen} onOpenChange={setIsCarreraDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Nueva Carrera</DialogTitle>
                        <DialogDescription>
                            Registra una nueva carrera profesional para asociarla a los estudiantes.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCarrera}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="carrera_nombre">Nombre de la Carrera *</Label>
                                <Input
                                    id="carrera_nombre"
                                    value={carreraNombre}
                                    onChange={(e) => setCarreraNombre(e.target.value)}
                                    placeholder="Ej. Medicina Humana, Ingeniería Civil..."
                                    required
                                />
                                {carreraErrors.nombre && <p className="text-sm text-destructive">{carreraErrors.nombre}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="carrera_area">Área de Conocimiento *</Label>
                                <Select
                                    value={carreraAreaId}
                                    onValueChange={setCarreraAreaId}
                                >
                                    <SelectTrigger id="carrera_area">
                                        <SelectValue placeholder="Selecciona un área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas && areas.map((a) => (
                                            <SelectItem key={a.id_area} value={a.id_area.toString()}>
                                                Área {a.codigo} - {a.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {carreraErrors.id_area && <p className="text-sm text-destructive">{carreraErrors.id_area}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="puntaje_min">Puntaje Mín. (Opcional)</Label>
                                    <Input
                                        id="puntaje_min"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="20"
                                        value={carreraPuntajeMin}
                                        onChange={(e) => setCarreraPuntajeMin(e.target.value)}
                                        placeholder="0.000"
                                    />
                                    {carreraErrors.puntaje_min && <p className="text-sm text-destructive">{carreraErrors.puntaje_min}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="puntaje_max">Puntaje Máx. (Opcional)</Label>
                                    <Input
                                        id="puntaje_max"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="20"
                                        value={carreraPuntajeMax}
                                        onChange={(e) => setCarreraPuntajeMax(e.target.value)}
                                        placeholder="20.000"
                                    />
                                    {carreraErrors.puntaje_max && <p className="text-sm text-destructive">{carreraErrors.puntaje_max}</p>}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCarreraDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={carreraLoading} className="bg-[#ff7043] hover:bg-[#f4511e]">
                                {carreraLoading ? 'Creando...' : 'Crear Carrera'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
