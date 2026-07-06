import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Layers3, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
    storeArea,
    storeCarrera,
    updateArea,
    updateCarrera,
} from '@/actions/App/Http/Controllers/Matriculas/CatalogoAcademicoController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { AreaCatalogo, CarreraOption } from '@/types/matriculas';

type PageProps = {
    areas: AreaCatalogo[];
    carreras: CarreraOption[];
};

export default function CatalogoAcademico({ areas, carreras }: PageProps) {
    const areaForm = useForm({ codigo: '', nombre: '' });
    const carreraForm = useForm({
        nombre: '',
        id_area: areas[0]?.id_area.toString() ?? '',
        puntaje_min: '',
        puntaje_max: '',
    });

    const crearArea = (event: React.FormEvent) => {
        event.preventDefault();
        areaForm.post(storeArea.url(), {
            preserveScroll: true,
            onSuccess: () => areaForm.reset(),
            onError: () => toast.error('Revisa los datos del área.'),
        });
    };

    const crearCarrera = (event: React.FormEvent) => {
        event.preventDefault();
        carreraForm.post(storeCarrera.url(), {
            preserveScroll: true,
            onSuccess: () =>
                carreraForm.reset('nombre', 'puntaje_min', 'puntaje_max'),
            onError: () => toast.error('Revisa los datos de la carrera.'),
        });
    };

    return (
        <>
            <Head title="Catálogo académico" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Catálogo académico
                        </h1>
                        <p className="text-sm text-slate-500">
                            Áreas A, B, C y D con sus carreras de postulación.
                        </p>
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                        {carreras.length} carreras
                    </Badge>
                </div>
            </header>

            <main className="space-y-6 px-8 py-6">
                <section className="grid gap-4 lg:grid-cols-2">
                    <form
                        onSubmit={crearArea}
                        className="rounded-lg border bg-white p-5"
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <Layers3 className="size-5 text-slate-500" />
                            <h2 className="text-base font-semibold text-slate-900">
                                Nueva área
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                            <div>
                                <Label htmlFor="codigo">Código</Label>
                                <Input
                                    id="codigo"
                                    maxLength={1}
                                    value={areaForm.data.codigo}
                                    onChange={(event) =>
                                        areaForm.setData(
                                            'codigo',
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                />
                                <InputError message={areaForm.errors.codigo} />
                            </div>
                            <div>
                                <Label htmlFor="nombre_area">Nombre</Label>
                                <Input
                                    id="nombre_area"
                                    value={areaForm.data.nombre}
                                    onChange={(event) =>
                                        areaForm.setData(
                                            'nombre',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={areaForm.errors.nombre} />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="mt-4 bg-[#ff7043] hover:bg-[#f4511e]"
                            disabled={areaForm.processing}
                        >
                            <Plus className="size-4" />
                            Crear área
                        </Button>
                    </form>

                    <form
                        onSubmit={crearCarrera}
                        className="rounded-lg border bg-white p-5"
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <BookOpen className="size-5 text-slate-500" />
                            <h2 className="text-base font-semibold text-slate-900">
                                Nueva carrera
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="nombre_carrera">Nombre</Label>
                                <Input
                                    id="nombre_carrera"
                                    value={carreraForm.data.nombre}
                                    onChange={(event) =>
                                        carreraForm.setData(
                                            'nombre',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={carreraForm.errors.nombre}
                                />
                            </div>
                            <div>
                                <Label>Área</Label>
                                <Select
                                    value={carreraForm.data.id_area}
                                    onValueChange={(value) =>
                                        carreraForm.setData('id_area', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.map((area) => (
                                            <SelectItem
                                                key={area.id_area}
                                                value={area.id_area.toString()}
                                            >
                                                Área {area.codigo} ·{' '}
                                                {area.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={carreraForm.errors.id_area}
                                />
                            </div>
                            <div>
                                <Label htmlFor="puntaje_min">
                                    Puntaje mínimo
                                </Label>
                                <Input
                                    id="puntaje_min"
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.001"
                                    value={carreraForm.data.puntaje_min}
                                    onChange={(event) =>
                                        carreraForm.setData(
                                            'puntaje_min',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={carreraForm.errors.puntaje_min}
                                />
                            </div>
                            <div>
                                <Label htmlFor="puntaje_max">
                                    Puntaje máximo
                                </Label>
                                <Input
                                    id="puntaje_max"
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.001"
                                    value={carreraForm.data.puntaje_max}
                                    onChange={(event) =>
                                        carreraForm.setData(
                                            'puntaje_max',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={carreraForm.errors.puntaje_max}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="mt-4 bg-[#ff7043] hover:bg-[#f4511e]"
                            disabled={
                                carreraForm.processing || areas.length === 0
                            }
                        >
                            <Plus className="size-4" />
                            Crear carrera
                        </Button>
                    </form>
                </section>

                <section className="space-y-4">
                    {areas.map((area) => (
                        <AreaBlock
                            key={area.id_area}
                            area={area}
                            areas={areas}
                        />
                    ))}
                </section>
            </main>
        </>
    );
}

function AreaBlock({
    area,
    areas,
}: {
    area: AreaCatalogo;
    areas: AreaCatalogo[];
}) {
    const form = useForm({
        codigo: area.codigo,
        nombre: area.nombre,
    });

    const guardarArea = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch(updateArea.url(area.id_area.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar el área.'),
        });
    };

    return (
        <article className="rounded-lg border bg-white">
            <form
                onSubmit={guardarArea}
                className="grid gap-3 border-b p-4 md:grid-cols-[96px_1fr_auto]"
            >
                <div>
                    <Label htmlFor={`area_codigo_${area.id_area}`}>
                        Código
                    </Label>
                    <Input
                        id={`area_codigo_${area.id_area}`}
                        maxLength={1}
                        value={form.data.codigo}
                        onChange={(event) =>
                            form.setData(
                                'codigo',
                                event.target.value.toUpperCase(),
                            )
                        }
                    />
                    <InputError message={form.errors.codigo} />
                </div>
                <div>
                    <Label htmlFor={`area_nombre_${area.id_area}`}>Área</Label>
                    <Input
                        id={`area_nombre_${area.id_area}`}
                        value={form.data.nombre}
                        onChange={(event) =>
                            form.setData('nombre', event.target.value)
                        }
                    />
                    <InputError message={form.errors.nombre} />
                </div>
                <Button
                    type="submit"
                    variant="outline"
                    className="self-end"
                    disabled={form.processing}
                >
                    <Save className="size-4" />
                    Guardar área
                </Button>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Carrera</TableHead>
                        <TableHead className="w-40">Área</TableHead>
                        <TableHead className="w-36">Puntaje mín.</TableHead>
                        <TableHead className="w-36">Puntaje máx.</TableHead>
                        <TableHead className="w-32 text-right">
                            Acción
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {area.carreras.length > 0 ? (
                        area.carreras.map((carrera) => (
                            <CarreraRow
                                key={carrera.id_carrera}
                                carrera={carrera}
                                areas={areas}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="py-6 text-center text-slate-500"
                            >
                                Esta área todavía no tiene carreras.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </article>
    );
}

function CarreraRow({
    carrera,
    areas,
}: {
    carrera: CarreraOption;
    areas: AreaCatalogo[];
}) {
    const form = useForm({
        nombre: carrera.nombre,
        id_area: carrera.id_area.toString(),
        puntaje_min: carrera.puntaje_min?.toString() ?? '',
        puntaje_max: carrera.puntaje_max?.toString() ?? '',
    });

    const guardarCarrera = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch(updateCarrera.url(carrera.id_carrera.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar la carrera.'),
        });
    };

    return (
        <TableRow>
            <TableCell>
                <Input
                    value={form.data.nombre}
                    onChange={(event) =>
                        form.setData('nombre', event.target.value)
                    }
                />
                <InputError message={form.errors.nombre} />
            </TableCell>
            <TableCell>
                <Select
                    value={form.data.id_area}
                    onValueChange={(value) => form.setData('id_area', value)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {areas.map((area) => (
                            <SelectItem
                                key={area.id_area}
                                value={area.id_area.toString()}
                            >
                                Área {area.codigo}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={form.errors.id_area} />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.001"
                    value={form.data.puntaje_min}
                    onChange={(event) =>
                        form.setData('puntaje_min', event.target.value)
                    }
                />
                <InputError message={form.errors.puntaje_min} />
            </TableCell>
            <TableCell>
                <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.001"
                    value={form.data.puntaje_max}
                    onChange={(event) =>
                        form.setData('puntaje_max', event.target.value)
                    }
                />
                <InputError message={form.errors.puntaje_max} />
            </TableCell>
            <TableCell className="text-right">
                <Button
                    type="button"
                    variant="outline"
                    onClick={guardarCarrera}
                    disabled={form.processing}
                >
                    <Save className="size-4" />
                    Guardar
                </Button>
            </TableCell>
        </TableRow>
    );
}
