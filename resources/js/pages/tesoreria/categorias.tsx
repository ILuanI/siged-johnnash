import { Head, router, useForm } from '@inertiajs/react';
import { Info, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    destroy as destroyCategoria,
    setDefault as setDefaultCategoria,
    store as storeCategoria,
    update as updateCategoria,
} from '@/actions/App/Http/Controllers/Tesoreria/CategoriaFinancieraController';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
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
import { usePermisos } from '@/hooks/use-permisos';

type TipoCategoria = 'INGRESO' | 'EGRESO';

type CategoriaItem = {
    id: number;
    nombre: string;
    tipo: TipoCategoria;
    es_por_defecto: boolean;
    descripcion: string | null;
};

type PageProps = {
    categorias: CategoriaItem[];
};

function CategoriaTable({
    categorias,
    puedeEditar,
    puedeEliminar,
    onEditar,
    onEliminar,
    onSetDefault,
    procesandoDefault,
}: {
    categorias: CategoriaItem[];
    puedeEditar: boolean;
    puedeEliminar: boolean;
    onEditar: (categoria: CategoriaItem) => void;
    onEliminar: (categoria: CategoriaItem) => void;
    onSetDefault: (categoria: CategoriaItem) => void;
    procesandoDefault: number | null;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                    <tr>
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3 text-center">Por defecto</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {categorias.length === 0 ? (
                        <tr>
                            <td
                                colSpan={4}
                                className="p-6 text-center text-slate-500"
                            >
                                No hay categorías registradas.
                            </td>
                        </tr>
                    ) : (
                        categorias.map((categoria) => (
                            <tr
                                key={categoria.id}
                                className="hover:bg-slate-50/50"
                            >
                                <td className="p-3 font-semibold text-slate-900">
                                    {categoria.nombre}
                                </td>
                                <td className="p-3 text-slate-600">
                                    {categoria.descripcion || (
                                        <span className="text-slate-400">
                                            Sin descripción
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 text-center">
                                    {categoria.es_por_defecto ? (
                                        <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-700">
                                            <Star className="size-3 fill-amber-500 text-amber-500" />
                                            Por defecto
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            —
                                        </span>
                                    )}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-end gap-1">
                                        {puedeEditar &&
                                            !categoria.es_por_defecto && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                    onClick={() =>
                                                        onSetDefault(categoria)
                                                    }
                                                    disabled={
                                                        procesandoDefault ===
                                                        categoria.id
                                                    }
                                                >
                                                    <Star className="mr-1 size-3" />
                                                    {procesandoDefault ===
                                                    categoria.id
                                                        ? 'Guardando...'
                                                        : 'Por defecto'}
                                                </Button>
                                            )}
                                        {puedeEditar && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-100"
                                                onClick={() =>
                                                    onEditar(categoria)
                                                }
                                            >
                                                <Pencil className="mr-1 size-3" />
                                                Editar
                                            </Button>
                                        )}
                                        {puedeEliminar && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() =>
                                                    onEliminar(categoria)
                                                }
                                            >
                                                <Trash2 className="mr-1 size-3" />
                                                Eliminar
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function CategoriasFinancieras({ categorias }: PageProps) {
    const { puede } = usePermisos();
    const puedeEditar = puede('pagos', 'editar');
    const puedeEliminar = puede('pagos', 'eliminar');

    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState<CategoriaItem | null>(null);
    const [eliminando, setEliminando] = useState<CategoriaItem | null>(null);
    const [procesandoDefault, setProcesandoDefault] = useState<number | null>(
        null,
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre: '',
        tipo: 'INGRESO' as TipoCategoria,
        descripcion: '',
    });

    const abrirCrear = () => {
        setEditando(null);
        reset();
        setData('tipo', 'INGRESO');
        setModalOpen(true);
    };

    const abrirEditar = (categoria: CategoriaItem) => {
        setEditando(categoria);
        setData({
            nombre: categoria.nombre,
            tipo: categoria.tipo,
            descripcion: categoria.descripcion ?? '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                setModalOpen(false);
                setEditando(null);
                reset();
            },
            onError: () => {
                toast.error('No se pudo guardar la categoría.');
            },
        };

        if (editando) {
            put(updateCategoria.url({ categoria: editando.id }), options);
        } else {
            post(storeCategoria.url(), options);
        }
    };

    const handleSetDefault = (categoria: CategoriaItem) => {
        setProcesandoDefault(categoria.id);
        router.post(
            setDefaultCategoria.url({ categoria: categoria.id }),
            {},
            {
                onSuccess: () => {
                    toast.success(
                        'Categoría establecida como por defecto correctamente.',
                    );
                },
                onFinish: () => setProcesandoDefault(null),
            },
        );
    };

    const handleEliminar = (categoria: CategoriaItem) => {
        router.delete(destroyCategoria.url({ categoria: categoria.id }), {
            onSuccess: () => setEliminando(null),
            onError: () => {
                toast.error('No se pudo eliminar la categoría.');
            },
        });
    };

    const ingresos = categorias.filter((c) => c.tipo === 'INGRESO');
    const egresos = categorias.filter((c) => c.tipo === 'EGRESO');

    return (
        <>
            <Head title="Categorías Financieras" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0b145f]">
                            Categorías Financieras
                        </h1>
                        <p className="text-sm text-slate-500">
                            Administra las categorías contables de ingresos y
                            egresos usadas en caja y pagos extraordinarios
                        </p>
                    </div>

                    {puedeEditar && (
                        <Button
                            onClick={abrirCrear}
                            className="gap-2 bg-[#ff7043] text-white hover:bg-[#f4511e]"
                        >
                            <Plus className="size-4" />
                            Nueva Categoría
                        </Button>
                    )}
                </div>

                <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                    <Info className="size-4 text-amber-600" />
                    <AlertTitle className="text-amber-900">
                        ¿Qué significa marcar una categoría como "Por defecto"?
                    </AlertTitle>
                    <AlertDescription className="text-amber-800">
                        La categoría marcada como <strong>Por defecto</strong>{' '}
                        (⭐) se preseleccionará automáticamente al abrir el
                        modal de registrar egreso o el formulario de pago
                        extraordinario/ingreso, ahorrando clics al personal.
                        Solo puede haber una categoría por defecto activa por
                        tipo (Ingreso o Egreso).
                    </AlertDescription>
                </Alert>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#0b145f]">
                                Categorías de Ingresos
                            </CardTitle>
                            <CardDescription>
                                Clasificación contable de comprobantes y pagos
                                extraordinarios
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoriaTable
                                categorias={ingresos}
                                puedeEditar={puedeEditar}
                                puedeEliminar={puedeEliminar}
                                onEditar={abrirEditar}
                                onEliminar={setEliminando}
                                onSetDefault={handleSetDefault}
                                procesandoDefault={procesandoDefault}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-[#0b145f]">
                                Categorías de Egresos
                            </CardTitle>
                            <CardDescription>
                                Clasificación contable de salidas de caja
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoriaTable
                                categorias={egresos}
                                puedeEditar={puedeEditar}
                                puedeEliminar={puedeEliminar}
                                onEditar={abrirEditar}
                                onEliminar={setEliminando}
                                onSetDefault={handleSetDefault}
                                procesandoDefault={procesandoDefault}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal crear / editar */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0b145f]">
                            {editando
                                ? `Editar categoría ${editando.nombre}`
                                : 'Nueva Categoría Financiera'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                maxLength={60}
                                placeholder="Ej: LABORATORIO, TRANSPORTE"
                                value={data.nombre}
                                onChange={(e) =>
                                    setData('nombre', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.nombre} />
                        </div>

                        <div>
                            <Label htmlFor="tipo">Tipo</Label>
                            <Select
                                value={data.tipo}
                                onValueChange={(val) =>
                                    setData('tipo', val as TipoCategoria)
                                }
                                disabled={editando !== null}
                            >
                                <SelectTrigger id="tipo" className="w-full">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INGRESO">
                                        Ingreso
                                    </SelectItem>
                                    <SelectItem value="EGRESO">
                                        Egreso
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.tipo} />
                        </div>

                        <div>
                            <Label htmlFor="descripcion">
                                Descripción (Opcional)
                            </Label>
                            <Input
                                id="descripcion"
                                maxLength={160}
                                placeholder="Detalle del uso de la categoría"
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                            />
                            <InputError message={errors.descripcion} />
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#ff7043] text-white hover:bg-[#f4511e]"
                            >
                                {processing
                                    ? 'Guardando...'
                                    : editando
                                      ? 'Guardar Cambios'
                                      : 'Crear Categoría'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal confirmar eliminación */}
            <Dialog
                open={eliminando !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEliminando(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-[#0b145f]">
                            Eliminar categoría
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600">
                        ¿Estás seguro de que deseas eliminar la categoría{' '}
                        <strong>{eliminando?.nombre}</strong>? Esta acción no se
                        puede deshacer.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setEliminando(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                eliminando && handleEliminar(eliminando)
                            }
                        >
                            Sí, eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
