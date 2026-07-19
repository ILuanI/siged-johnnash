import { Head, router, useForm } from '@inertiajs/react';
import {
    Pen,
    Search,
    ShieldCheck,
    ShieldPlus,
    Trash2,
    Users,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    destroy,
    store,
    update,
} from '@/actions/App/Http/Controllers/RolController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { usePermisos } from '@/hooks/use-permisos';
import type { PermisoModulo, PermisosMap } from '@/hooks/use-permisos';
import { confirmAction } from '@/lib/confirm';
import { cn } from '@/lib/utils';

interface Rol {
    id_rol: number;
    nombre: string;
    descripcion: string | null;
    usuarios_count: number;
    created_at: string;
    permisos: PermisosMap;
}

interface Props {
    roles: {
        data: Rol[];
        current_page: number;
        last_page: number;
        total: number;
    };
    modulos: Record<string, string>;
    filters: {
        search?: string;
    };
}

function crearPermisosVacios(modulos: Record<string, string>): PermisosMap {
    return Object.fromEntries(
        Object.keys(modulos).map((modulo) => [
            modulo,
            { puede_ver: false, puede_editar: false, puede_eliminar: false },
        ]),
    );
}

export default function RolesIndex({ roles, modulos, filters }: Props) {
    const { puede } = usePermisos();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRol, setEditingRol] = useState<Rol | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        router.get(
            '/roles',
            { search: e.target.value },
            { preserveState: true, replace: true },
        );
    };

    const permisosVacios = useMemo(
        () => crearPermisosVacios(modulos),
        [modulos],
    );

    const { data, setData, processing, errors, reset, clearErrors } = useForm({
        nombre: '',
        descripcion: '',
        permisos: permisosVacios,
    });

    const actualizarPermiso = (
        modulo: string,
        campo: keyof PermisoModulo,
        valor: boolean,
    ) => {
        setData('permisos', {
            ...data.permisos,
            [modulo]: {
                ...data.permisos[modulo],
                [campo]: valor,
                ...(campo === 'puede_ver' && !valor
                    ? { puede_editar: false, puede_eliminar: false }
                    : {}),
                ...(campo === 'puede_editar' && valor
                    ? { puede_ver: true }
                    : {}),
                ...(campo === 'puede_eliminar' && valor
                    ? { puede_ver: true, puede_editar: true }
                    : {}),
            },
        });
    };

    const openCreateDialog = () => {
        setEditingRol(null);
        reset();
        setData('permisos', permisosVacios);
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (rol: Rol) => {
        setEditingRol(rol);
        setData({
            nombre: rol.nombre,
            descripcion: rol.descripcion ?? '',
            permisos: rol.permisos,
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleDelete = async (rol: Rol) => {
        const confirmed = await confirmAction({
            title: `Eliminar rol ${rol.nombre}`,
            text: 'Los usuarios con este rol podrían perder permisos asociados.',
            confirmButtonText: 'Eliminar',
        });

        if (!confirmed) {
            return;
        }

        router.delete(destroy.url({ rol: rol.id_rol.toString() }), {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingRol) {
            router.put(
                update.url({ rol: editingRol.id_rol.toString() }),
                data,
                {
                    preserveScroll: true,
                    onSuccess: () => setIsDialogOpen(false),
                },
            );

            return;
        }

        router.post(store.url(), data, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const contarPermisos = (permisos: PermisosMap) =>
        Object.values(permisos).filter((permiso) => permiso.puede_ver).length;

    return (
        <>
            <Head title="Roles" />

            <header className="border-b bg-white px-8 py-6 dark:bg-background">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#ff7043]">
                            <ShieldCheck className="size-4" />
                            Seguridad y accesos
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Roles del sistema
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {roles.total} rol{roles.total !== 1 ? 'es' : ''}{' '}
                            configurado{roles.total !== 1 ? 's' : ''}.
                        </p>
                    </div>
                    {puede('roles', 'editar') && (
                        <Button
                            onClick={openCreateDialog}
                            className="bg-[#ff7043] text-white hover:bg-[#f4511e]"
                        >
                            <ShieldPlus className="size-4" />
                            Nuevo rol
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 px-8 py-6">
                <div className="mb-4 relative max-w-md">
                    <Search className="absolute top-2.5 left-2.5 size-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar roles por nombre o descripción..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {roles.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center dark:bg-background">
                        <p className="text-slate-600 dark:text-slate-300">
                            No hay roles registrados.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {roles.data.map((rol) => (
                            <li key={rol.id_rol}>
                                <div className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 transition hover:border-[#ff7043]/40 hover:shadow-sm dark:bg-background">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-[#1a237e]/10 text-[#1a237e]">
                                        <ShieldCheck className="size-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                {rol.nombre}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="gap-1"
                                            >
                                                <Users className="size-3" />
                                                {rol.usuarios_count} usuario
                                                {rol.usuarios_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                            <Badge variant="outline">
                                                {contarPermisos(rol.permisos)}{' '}
                                                vista
                                                {contarPermisos(
                                                    rol.permisos,
                                                ) !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </div>
                                        <p className="truncate text-sm text-slate-500">
                                            {rol.descripcion ||
                                                'Sin descripción'}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {puede('roles', 'editar') && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditDialog(rol)
                                                }
                                                title="Editar"
                                            >
                                                <Pen className="size-4 text-slate-500" />
                                            </Button>
                                        )}
                                        {puede('roles', 'eliminar') && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleDelete(rol)
                                                }
                                                className="text-destructive focus:text-destructive"
                                                title="Eliminar"
                                                disabled={
                                                    rol.usuarios_count > 0
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRol ? 'Editar rol' : 'Nuevo rol'}
                        </DialogTitle>
                        <DialogDescription>
                            Define el nombre del rol y qué módulos puede ver,
                            editar o eliminar.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    placeholder="Ej. Coordinador"
                                />
                                <InputError message={errors.nombre} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <textarea
                                    id="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                    placeholder="Describe las responsabilidades del rol"
                                    rows={2}
                                    className={cn(
                                        'flex min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground md:text-sm',
                                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                    )}
                                />
                                <InputError message={errors.descripcion} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Permisos por módulo</Label>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Módulo
                                                </th>
                                                <th className="px-3 py-2 text-center font-medium">
                                                    Ver
                                                </th>
                                                <th className="px-3 py-2 text-center font-medium">
                                                    Editar
                                                </th>
                                                <th className="px-3 py-2 text-center font-medium">
                                                    Eliminar
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(modulos).map(
                                                ([modulo, etiqueta]) => (
                                                    <tr
                                                        key={modulo}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-2">
                                                            {etiqueta}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <Checkbox
                                                                checked={
                                                                    data
                                                                        .permisos[
                                                                        modulo
                                                                    ]
                                                                        ?.puede_ver ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    actualizarPermiso(
                                                                        modulo,
                                                                        'puede_ver',
                                                                        checked ===
                                                                            true,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <Checkbox
                                                                checked={
                                                                    data
                                                                        .permisos[
                                                                        modulo
                                                                    ]
                                                                        ?.puede_editar ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    actualizarPermiso(
                                                                        modulo,
                                                                        'puede_editar',
                                                                        checked ===
                                                                            true,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <Checkbox
                                                                checked={
                                                                    data
                                                                        .permisos[
                                                                        modulo
                                                                    ]
                                                                        ?.puede_eliminar ??
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    actualizarPermiso(
                                                                        modulo,
                                                                        'puede_eliminar',
                                                                        checked ===
                                                                            true,
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <InputError
                                    message={errors.permisos as string}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#ff7043] text-white hover:bg-[#f4511e]"
                            >
                                {editingRol ? 'Guardar cambios' : 'Registrar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: '/roles',
        },
    ],
};
