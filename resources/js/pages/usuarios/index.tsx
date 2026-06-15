import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Pen, Search, ShieldCheck, Trash2, UserPlus, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { destroy, store, update } from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { useInitials } from '@/hooks/use-initials';
import { usePermisos } from '@/hooks/use-permisos';
import { confirmAction } from '@/lib/confirm';
import { cn } from '@/lib/utils';

type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

interface RolOption {
    id_rol: number;
    nombre: string;
}

interface Usuario {
    id: number;
    name: string;
    email: string;
    estado: EstadoUsuario;
    id_rol: number | null;
    rol: RolOption | null;
    created_at: string;
}

interface Props {
    usuarios: {
        data: Usuario[];
        current_page: number;
        last_page: number;
        total: number;
    };
    roles: RolOption[];
}

export default function UsuariosIndex({ usuarios, roles }: Props) {
    const getInitials = useInitials();
    const { puede } = usePermisos();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

    const { data, setData, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        estado: 'ACTIVO' as EstadoUsuario,
        id_rol: roles[0]?.id_rol?.toString() ?? '',
    });

    const openCreateDialog = () => {
        setEditingUsuario(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (usuario: Usuario) => {
        setEditingUsuario(usuario);
        setData({
            name: usuario.name,
            email: usuario.email,
            password: '',
            password_confirmation: '',
            estado: usuario.estado,
            id_rol: usuario.id_rol?.toString() ?? '',
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleDelete = async (usuario: Usuario) => {
        const confirmed = await confirmAction({
            title: `Eliminar usuario ${usuario.name}`,
            text: 'Esta acción no se puede deshacer.',
            confirmButtonText: 'Eliminar',
        });

        if (! confirmed) {
            return;
        }

        router.delete(destroy.url({ user: usuario.id }), {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUsuario) {
            router.put(update.url({ user: editingUsuario.id }), {
                ...data,
                id_rol: Number(data.id_rol),
            }, {
                preserveScroll: true,
                onSuccess: () => setIsDialogOpen(false),
            });

            return;
        }

        router.post(store.url(), {
            ...data,
            id_rol: Number(data.id_rol),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    return (
        <>
            <Head title="Usuarios" />

            <header className="border-b bg-white px-8 py-6 dark:bg-background">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#ff7043]">
                            <ShieldCheck className="size-4" />
                            Seguridad y accesos
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Usuarios del sistema
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {usuarios.total} usuario{usuarios.total !== 1 ? 's' : ''} registrado{usuarios.total !== 1 ? 's' : ''}.
                        </p>
                    </div>
                    {puede('usuarios', 'editar') && (
                        <Button
                            onClick={openCreateDialog}
                            className="bg-[#ff7043] text-white hover:bg-[#f4511e]"
                        >
                            <UserPlus className="size-4" />
                            Nuevo usuario
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 px-8 py-6">
                <div className="mb-4 flex max-w-md items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-500 dark:bg-background">
                    <Search className="size-4 shrink-0" />
                    <span>Listado de cuentas internas de la academia</span>
                </div>

                {usuarios.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center dark:bg-background">
                        <p className="text-slate-600 dark:text-slate-300">
                            No hay usuarios registrados.
                        </p>
                        <Button
                            onClick={openCreateDialog}
                            className="mt-4"
                            variant="outline"
                        >
                            Registrar primer usuario
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {usuarios.data.map((usuario) => (
                            <li key={usuario.id}>
                                <div className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 transition hover:border-[#ff7043]/40 hover:shadow-sm dark:bg-background">
                                    <Avatar className="size-12">
                                        <AvatarFallback className="bg-[#1a237e]/10 text-[#1a237e]">
                                            {getInitials(usuario.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                                                {usuario.name}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="border-[#1a237e]/20 bg-[#1a237e]/5 text-[#1a237e]"
                                            >
                                                {usuario.rol?.nombre ?? 'Sin rol'}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    usuario.estado === 'ACTIVO'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-200 bg-slate-100 text-slate-600',
                                                )}
                                            >
                                                {usuario.estado === 'ACTIVO' ? (
                                                    <CheckCircle2 className="size-3" />
                                                ) : (
                                                    <XCircle className="size-3" />
                                                )}
                                                {usuario.estado}
                                            </Badge>
                                        </div>
                                        <p className="truncate text-sm text-slate-500">
                                            {usuario.email}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {puede('usuarios', 'editar') && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(usuario)}
                                                title="Editar"
                                            >
                                                <Pen className="size-4 text-slate-500" />
                                            </Button>
                                        )}
                                        {puede('usuarios', 'eliminar') && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(usuario)}
                                                className="text-destructive focus:text-destructive"
                                                title="Eliminar"
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
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUsuario ? 'Editar usuario' : 'Nuevo usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUsuario
                                ? 'Actualiza los datos de acceso y el estado de la cuenta.'
                                : 'Registra una nueva cuenta interna para el sistema.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nombre completo"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="usuario@johnnash.edu.pe"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="id_rol">Rol</Label>
                                <Select
                                    value={data.id_rol}
                                    onValueChange={(value) => setData('id_rol', value)}
                                >
                                    <SelectTrigger id="id_rol" className="w-full">
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((rol) => (
                                            <SelectItem
                                                key={rol.id_rol}
                                                value={rol.id_rol.toString()}
                                            >
                                                {rol.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.id_rol} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select
                                    value={data.estado}
                                    onValueChange={(value) =>
                                        setData('estado', value as EstadoUsuario)
                                    }
                                >
                                    <SelectTrigger id="estado" className="w-full">
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVO">Activo</SelectItem>
                                        <SelectItem value="INACTIVO">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.estado} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {editingUsuario ? 'Nueva contraseña' : 'Contraseña'}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    placeholder={editingUsuario ? 'Dejar en blanco para conservar' : 'Contraseña segura'}
                                />
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    autoComplete="new-password"
                                    placeholder="Repite la contraseña"
                                />
                                <InputError message={errors.password_confirmation} />
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
                                {editingUsuario ? 'Guardar cambios' : 'Registrar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsuariosIndex.layout = {
    breadcrumbs: [
        {
            title: 'Usuarios',
            href: '/usuarios',
        },
    ],
};
