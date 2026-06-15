import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    index as catalogoIndex,
    storeCarrera,
} from '@/actions/App/Http/Controllers/Matriculas/CatalogoAcademicoController';
import {
    index as estudiantesIndex,
    store as storeEstudiante,
} from '@/actions/App/Http/Controllers/Matriculas/EstudianteWebController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CarreraOption } from '@/types/matriculas';

type Area = {
    id_area: number;
    nombre: string;
    codigo: string;
};

type ColegioProcedencia = {
    id_colegio_procedencia: number;
    nombre: string;
};

type PageProps = {
    carreras: CarreraOption[];
    areas: Area[];
    colegios: ColegioProcedencia[];
};

export default function EstudianteCreate({ carreras, areas, colegios }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        nombres: '',
        apellidos: '',
        dni: '',
        fecha_nac: '',
        sexo: '',
        id_carrera: '',
        telefono: '',
        colegio_procedencia_id: '',
        apoderado: {
            nombres: '',
            telefono: '',
        },
    });

    const [isCarreraDialogOpen, setIsCarreraDialogOpen] = useState(false);
    const [carreraNombre, setCarreraNombre] = useState('');
    const [carreraAreaId, setCarreraAreaId] = useState('');
    const [carreraPuntajeMin, setCarreraPuntajeMin] = useState('');
    const [carreraPuntajeMax, setCarreraPuntajeMax] = useState('');
    const [carreraErrors, setCarreraErrors] = useState<Record<string, string>>({});
    const [carreraLoading, setCarreraLoading] = useState(false);

    const handleCreateCarrera = (e: React.FormEvent) => {
        e.preventDefault();
        setCarreraLoading(true);
        setCarreraErrors({});

        router.post(
            storeCarrera.url(),
            {
                nombre: carreraNombre,
                id_area: carreraAreaId,
                puntaje_min: carreraPuntajeMin || null,
                puntaje_max: carreraPuntajeMax || null,
            },
            {
                onSuccess: () => {
                    setIsCarreraDialogOpen(false);
                    setCarreraNombre('');
                    setCarreraAreaId('');
                    setCarreraPuntajeMin('');
                    setCarreraPuntajeMax('');
                    toast.success('Carrera creada exitosamente');
                },
                onError: (errs) => {
                    setCarreraErrors(errs as Record<string, string>);
                    Object.values(errs).forEach((message) => toast.error(message));
                },
                onFinish: () => setCarreraLoading(false),
                preserveState: true,
            },
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeEstudiante.url(), {
            onError: (errs) => {
                Object.values(errs).forEach((message) => toast.error(message));
            },
        });
    };

    return (
        <>
            <Head title="Nuevo estudiante" />

            <header className="border-b bg-white px-8 py-6">
                <Link
                    href={estudiantesIndex.url()}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="size-4" />
                    Volver al directorio
                </Link>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Registrar estudiante</h1>
                        <p className="text-sm text-slate-500">El código del alumno será su DNI.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={catalogoIndex.url()}>
                            <Settings2 className="size-4" />
                            Catálogo académico
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="mx-auto max-w-2xl px-8 py-8">
                <form onSubmit={submit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
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
                            <Label htmlFor="dni">DNI *</Label>
                            <Input
                                id="dni"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value.replace(/\D/g, ''))}
                                maxLength={8}
                                pattern="\d{8}"
                                required
                            />
                            <InputError message={errors.dni} />
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
                            <Select value={data.sexo} onValueChange={(val) => setData('sexo', val)}>
                                <SelectTrigger id="sexo">
                                    <SelectValue placeholder="Seleccionar" />
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
                            <div className="mb-1 flex items-center justify-between">
                                <Label htmlFor="id_carrera" className="mb-0">
                                    Carrera
                                </Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setIsCarreraDialogOpen(true)}
                                    className="flex h-auto items-center p-0 text-xs text-[#ff7043] hover:text-[#f4511e]"
                                >
                                    <Plus className="mr-1 size-3" />
                                    Nueva carrera
                                </Button>
                            </div>
                            <Select value={data.id_carrera} onValueChange={(val) => setData('id_carrera', val)}>
                                <SelectTrigger id="id_carrera">
                                    <SelectValue placeholder="Sin carrera" />
                                </SelectTrigger>
                                <SelectContent>
                                    {carreras.length > 0 ? (
                                        carreras.map((carrera) => (
                                            <SelectItem key={carrera.id_carrera} value={carrera.id_carrera.toString()}>
                                                {carrera.nombre}
                                                {carrera.area ? ` (Área ${carrera.area.codigo})` : ''}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="sin-carreras" disabled>
                                            Sin carreras registradas
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.id_carrera} />
                        </div>
                        <div>
                            <Label htmlFor="colegio_procedencia_id">Colegio de procedencia</Label>
                            <Select
                                value={data.colegio_procedencia_id}
                                onValueChange={(val) => setData('colegio_procedencia_id', val)}
                            >
                                <SelectTrigger id="colegio_procedencia_id">
                                    <SelectValue placeholder="Sin colegio registrado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {colegios.map((colegio) => (
                                        <SelectItem
                                            key={colegio.id_colegio_procedencia}
                                            value={colegio.id_colegio_procedencia.toString()}
                                        >
                                            {colegio.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.colegio_procedencia_id} />
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-100 pt-5">
                        <p className="text-sm font-medium text-slate-700">Apoderado</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="apoderado_nombres">Nombre</Label>
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
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing} className="bg-[#ff7043] hover:bg-[#f4511e]">
                            Registrar estudiante
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={estudiantesIndex.url()}>Cancelar</Link>
                        </Button>
                    </div>
                </form>
            </div>

            <Dialog open={isCarreraDialogOpen} onOpenChange={setIsCarreraDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Nueva carrera</DialogTitle>
                        <DialogDescription>Registra una carrera para asociarla a los estudiantes.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCarrera}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="carrera_nombre">Nombre *</Label>
                                <Input
                                    id="carrera_nombre"
                                    value={carreraNombre}
                                    onChange={(e) => setCarreraNombre(e.target.value)}
                                    required
                                />
                                {carreraErrors.nombre && <p className="text-sm text-destructive">{carreraErrors.nombre}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="carrera_area">Área *</Label>
                                <Select value={carreraAreaId} onValueChange={setCarreraAreaId}>
                                    <SelectTrigger id="carrera_area">
                                        <SelectValue placeholder="Selecciona un área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.length > 0 ? (
                                            areas.map((area) => (
                                                <SelectItem key={area.id_area} value={area.id_area.toString()}>
                                                    Área {area.codigo} - {area.nombre}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="sin-areas" disabled>
                                                Sin áreas registradas
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {carreraErrors.id_area && <p className="text-sm text-destructive">{carreraErrors.id_area}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="puntaje_min">Puntaje min.</Label>
                                    <Input
                                        id="puntaje_min"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="20"
                                        value={carreraPuntajeMin}
                                        onChange={(e) => setCarreraPuntajeMin(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="puntaje_max">Puntaje max.</Label>
                                    <Input
                                        id="puntaje_max"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="20"
                                        value={carreraPuntajeMax}
                                        onChange={(e) => setCarreraPuntajeMax(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCarreraDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={carreraLoading} className="bg-[#ff7043] hover:bg-[#f4511e]">
                                {carreraLoading ? 'Creando...' : 'Crear carrera'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
