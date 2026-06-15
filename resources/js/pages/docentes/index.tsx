import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/DocenteController';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Pen, Trash2, UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

interface Docente {
    id: number;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
    dni: string;
}

interface Props {
    docentes: {
        data: Docente[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function DocentesIndex({ docentes }: Props) {
    const getInitials = useInitials();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        dni: '',
    });

    const openCreateDialog = () => {
        setEditingDocente(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (docente: Docente) => {
        setEditingDocente(docente);
        setData({
            nombres: docente.nombres,
            apellidos: docente.apellidos,
            correo: docente.correo,
            telefono: docente.telefono || '',
            dni: docente.dni,
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleDelete = (docente: Docente) => {
        if (confirm(`¿Estás seguro de eliminar a ${docente.nombres} ${docente.apellidos}?`)) {
            router.delete(destroy.url({ docente: docente.id }), {
                onSuccess: () => toast.success('Docente eliminado exitosamente'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingDocente) {
            router.put(update.url({ docente: editingDocente.id }), data, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Docente actualizado exitosamente');
                },
                onError: (errors) => console.error(errors),
            });
        } else {
            router.post(store.url(), data, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.success('Docente creado exitosamente');
                },
                onError: (errors) => console.error(errors),
            });
        }
    };

    return (
        <>
            <Head title="Docentes" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Directorio de Docentes
                        </h1>
                        <p className="text-sm text-slate-500">
                            {docentes.total} docente{docentes.total !== 1 ? 's' : ''} registrado{docentes.total !== 1 ? 's' : ''} en la academia.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="bg-[#ff7043] hover:bg-[#f4511e]"
                    >
                        <UserPlus className="mr-2 size-4" />
                        Nuevo docente
                    </Button>
                </div>
            </header>

            <div className="flex-1 px-8 py-6">
                {docentes.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-white p-12 text-center">
                        <p className="text-slate-600">
                            No hay docentes registrados.
                        </p>
                        <Button onClick={openCreateDialog} className="mt-4" variant="outline">
                            Registrar primer docente
                        </Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {docentes.data.map((docente) => (
                            <li key={docente.id}>
                                <div
                                    className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 transition hover:border-[#ff7043]/40 hover:shadow-sm"
                                >
                                    <Avatar className="size-12">
                                        <AvatarFallback className="bg-[#1a237e]/10 text-[#1a237e]">
                                            {getInitials(
                                                `${docente.nombres} ${docente.apellidos}`,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-slate-900">
                                            {docente.apellidos},{' '}
                                            {docente.nombres}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {docente.correo}
                                            {docente.telefono
                                                ? ` · Telf: ${docente.telefono}`
                                                : ''}
                                            {docente.dni
                                                ? ` · DNI ${docente.dni}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(docente)}
                                            title="Editar"
                                        >
                                            <Pen className="size-4 text-slate-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(docente)}
                                            className="text-destructive focus:text-destructive"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingDocente ? 'Editar Docente' : 'Nuevo Docente'}</DialogTitle>
                        <DialogDescription>
                            {editingDocente
                                ? 'Modifica los datos del docente.'
                                : 'Ingresa los datos para registrar un nuevo docente.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dni">DNI</Label>
                                <Input
                                    id="dni"
                                    value={data.dni}
                                    onChange={(e) => setData('dni', e.target.value)}
                                    maxLength={8}
                                    placeholder="Número de DNI"
                                />
                                {errors.dni && <p className="text-sm text-destructive">{errors.dni}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nombres">Nombres</Label>
                                    <Input
                                        id="nombres"
                                        value={data.nombres}
                                        onChange={(e) => setData('nombres', e.target.value)}
                                    />
                                    {errors.nombres && <p className="text-sm text-destructive">{errors.nombres}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="apellidos">Apellidos</Label>
                                    <Input
                                        id="apellidos"
                                        value={data.apellidos}
                                        onChange={(e) => setData('apellidos', e.target.value)}
                                    />
                                    {errors.apellidos && <p className="text-sm text-destructive">{errors.apellidos}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="correo">Correo Electrónico</Label>
                                <Input
                                    id="correo"
                                    type="email"
                                    value={data.correo}
                                    onChange={(e) => setData('correo', e.target.value)}
                                    placeholder="ejemplo@correo.com"
                                />
                                {errors.correo && <p className="text-sm text-destructive">{errors.correo}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                                <Input
                                    id="telefono"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    placeholder="Número de contacto"
                                />
                                {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-[#ff7043] hover:bg-[#f4511e]">
                                {editingDocente ? 'Guardar Cambios' : 'Registrar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

DocentesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Docentes',
            href: '/docentes',
        },
    ],
};
