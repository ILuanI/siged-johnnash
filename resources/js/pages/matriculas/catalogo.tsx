import { Head, useForm, router } from '@inertiajs/react';
import { BookOpen, Layers3, Plus, Save, Book, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { confirmAction } from '@/lib/confirm';
import {
    storeArea,
    storeCarrera,
    storeCurso,
    updateArea,
    updateCarrera,
    updateCurso,
    destroyArea,
    destroyCarrera,
    destroyCurso,
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
import type {
    AreaCatalogo,
    CarreraOption,
    CursoCatalogo,
} from '@/types/matriculas';

type PageProps = {
    areas: AreaCatalogo[];
    carreras: CarreraOption[];
    cursos: CursoCatalogo[];
};

export default function CatalogoAcademico({
    areas,
    carreras,
    cursos,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'areas' | 'carreras' | 'cursos'>('areas');

    const areaForm = useForm({ codigo: '', nombre: '' });
    const carreraForm = useForm({
        nombre: '',
        id_area: areas[0]?.id_area.toString() ?? '',
        puntaje_min: '',
        puntaje_max: '',
    });
    const cursoForm = useForm({
        nombre: '',
        area_conoc: '',
        color: '#FF7043',
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

    const crearCurso = (event: React.FormEvent) => {
        event.preventDefault();
        cursoForm.post(storeCurso.url(), {
            preserveScroll: true,
            onSuccess: () => cursoForm.reset('nombre', 'area_conoc'),
            onError: () => toast.error('Revisa los datos del curso.'),
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
                            Configura las áreas de postulación, carreras académicas y cursos.
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-8 py-6">
                {/* Selector de pestañas */}
                <div className="flex border-b px-2 mb-6">
                    {[
                        { id: 'areas', label: `Áreas (${areas.length})` },
                        { id: 'carreras', label: `Carreras (${carreras.length})` },
                        { id: 'cursos', label: `Cursos (${cursos.length})` },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id as any)}
                            className={cn(
                                'border-b-2 px-6 py-3 text-sm font-medium transition cursor-pointer',
                                activeTab === item.id
                                    ? 'border-[#ff7043] text-[#ff7043]'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Contenido de la pestaña: Áreas */}
                {activeTab === 'areas' && (
                    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                        <div>
                            <form
                                onSubmit={crearArea}
                                className="rounded-lg border bg-white p-5 sticky top-6"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <Layers3 className="size-5 text-slate-500" />
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Nueva área
                                    </h2>
                                </div>
                                <div className="grid gap-4">
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
                                    className="mt-6 w-full bg-[#ff7043] hover:bg-[#f4511e]"
                                    disabled={areaForm.processing}
                                >
                                    <Plus className="size-4" />
                                    Crear área
                                </Button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                Áreas Registradas
                            </h2>
                            {areas.length > 0 ? (
                                areas.map((area) => (
                                    <AreaBlock
                                        key={area.id_area}
                                        area={area}
                                        areas={areas}
                                        showCarreras={false}
                                    />
                                ))
                            ) : (
                                <div className="rounded-lg border border-dashed p-8 text-center bg-white text-slate-500">
                                    No hay áreas registradas.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contenido de la pestaña: Carreras */}
                {activeTab === 'carreras' && (
                    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                        <div>
                            <form
                                onSubmit={crearCarrera}
                                className="rounded-lg border bg-white p-5 sticky top-6"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <BookOpen className="size-5 text-slate-500" />
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Nueva carrera
                                    </h2>
                                </div>
                                <div className="grid gap-4">
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
                                        <InputError message={carreraForm.errors.nombre} />
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
                                                        Área {area.codigo} · {area.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={carreraForm.errors.id_area} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="puntaje_min">Puntaje Mín.</Label>
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
                                            <InputError message={carreraForm.errors.puntaje_min} />
                                        </div>
                                        <div>
                                            <Label htmlFor="puntaje_max">Puntaje Máx.</Label>
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
                                            <InputError message={carreraForm.errors.puntaje_max} />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="mt-6 w-full bg-[#ff7043] hover:bg-[#f4511e]"
                                    disabled={carreraForm.processing || areas.length === 0}
                                >
                                    <Plus className="size-4" />
                                    Crear carrera
                                </Button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                Carreras Académicas
                            </h2>
                            <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Carrera</TableHead>
                                            <TableHead className="w-48">Área</TableHead>
                                            <TableHead className="w-36">Puntaje mín.</TableHead>
                                            <TableHead className="w-36">Puntaje máx.</TableHead>
                                            <TableHead className="w-32 text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {carreras.length > 0 ? (
                                            carreras.map((carrera) => (
                                                <CarreraRow
                                                    key={carrera.id_carrera}
                                                    carrera={carrera}
                                                    areas={areas}
                                                />
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                                                    No hay carreras registradas.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido de la pestaña: Cursos */}
                {activeTab === 'cursos' && (
                    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                        <div>
                            <form
                                onSubmit={crearCurso}
                                className="rounded-lg border bg-white p-5 sticky top-6"
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <Book className="size-5 text-slate-500" />
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Nuevo curso
                                    </h2>
                                </div>
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="nombre_curso">Nombre</Label>
                                        <Input
                                            id="nombre_curso"
                                            value={cursoForm.data.nombre}
                                            onChange={(event) =>
                                                cursoForm.setData(
                                                    'nombre',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError message={cursoForm.errors.nombre} />
                                    </div>
                                    <div>
                                        <Label htmlFor="area_conoc">Área de conocimiento</Label>
                                        <Input
                                            id="area_conoc"
                                            value={cursoForm.data.area_conoc}
                                            onChange={(event) =>
                                                cursoForm.setData(
                                                    'area_conoc',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Ej. Matemáticas, Comunicación"
                                        />
                                        <InputError message={cursoForm.errors.area_conoc} />
                                    </div>
                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <Input
                                            id="color"
                                            type="color"
                                            value={cursoForm.data.color}
                                            onChange={(event) =>
                                                cursoForm.setData(
                                                    'color',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-10 w-full cursor-pointer"
                                        />
                                        <InputError message={cursoForm.errors.color} />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="mt-6 w-full bg-[#ff7043] hover:bg-[#f4511e]"
                                    disabled={cursoForm.processing}
                                >
                                    <Plus className="size-4" />
                                    Crear curso
                                </Button>
                            </form>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                Cursos Académicos
                            </h2>
                            <CursosBlock cursos={cursos} />
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}


function AreaBlock({
    area,
    areas,
    showCarreras = true,
}: {
    area: AreaCatalogo;
    areas: AreaCatalogo[];
    showCarreras?: boolean;
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

    const eliminarArea = async () => {
        const confirmed = await confirmAction({
            title: `Eliminar área ${area.codigo}`,
            text: 'Esta acción no se puede deshacer.',
            confirmButtonText: 'Eliminar',
        });

        if (!confirmed) {
            return;
        }

        router.delete(destroyArea.url(area.id_area.toString()), {
            preserveScroll: true,
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
                <div className="flex gap-2 self-end">
                    <Button
                        type="submit"
                        variant="outline"
                        disabled={form.processing}
                    >
                        <Save className="size-4" />
                        Guardar área
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={eliminarArea}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </form>

            {showCarreras && (
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
            )}
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

    const eliminarCarrera = async () => {
        const confirmed = await confirmAction({
            title: `Eliminar carrera ${carrera.nombre}`,
            text: 'Esta acción no se puede deshacer.',
            confirmButtonText: 'Eliminar',
        });

        if (!confirmed) {
            return;
        }

        router.delete(destroyCarrera.url(carrera.id_carrera.toString()), {
            preserveScroll: true,
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
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={guardarCarrera}
                        disabled={form.processing}
                    >
                        <Save className="size-4" />
                        Guardar
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={eliminarCarrera}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

function CursosBlock({ cursos }: { cursos: CursoCatalogo[] }) {
    return (
        <article className="rounded-lg border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead className="w-56">
                            Área de conocimiento
                        </TableHead>
                        <TableHead className="w-24">Color</TableHead>
                        <TableHead className="w-32 text-right">
                            Acción
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cursos.length > 0 ? (
                        cursos.map((curso) => (
                            <CursoRow key={curso.id_curso} curso={curso} />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="py-6 text-center text-slate-500"
                            >
                                Todavía no hay cursos registrados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </article>
    );
}

function CursoRow({ curso }: { curso: CursoCatalogo }) {
    const form = useForm({
        nombre: curso.nombre,
        area_conoc: curso.area_conoc ?? '',
        color: curso.color,
    });

    const guardarCurso = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch(updateCurso.url(curso.id_curso.toString()), {
            preserveScroll: true,
            onError: () => toast.error('No se pudo actualizar el curso.'),
        });
    };

    const eliminarCurso = async () => {
        const confirmed = await confirmAction({
            title: `Eliminar curso ${curso.nombre}`,
            text: 'Esta acción no se puede deshacer.',
            confirmButtonText: 'Eliminar',
        });

        if (!confirmed) {
            return;
        }

        router.delete(destroyCurso.url(curso.id_curso.toString()), {
            preserveScroll: true,
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
                <Input
                    value={form.data.area_conoc}
                    onChange={(event) =>
                        form.setData('area_conoc', event.target.value)
                    }
                    placeholder="Ej. Matemáticas, Comunicación"
                />
                <InputError message={form.errors.area_conoc} />
            </TableCell>
            <TableCell>
                <Input
                    type="color"
                    value={form.data.color}
                    onChange={(event) =>
                        form.setData('color', event.target.value)
                    }
                    className="h-10 w-full cursor-pointer"
                />
                <InputError message={form.errors.color} />
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={guardarCurso}
                        disabled={form.processing}
                    >
                        <Save className="size-4" />
                        Guardar
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={eliminarCurso}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
