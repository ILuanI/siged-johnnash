import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/DocenteController';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Pen, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Docente {
    id: number;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
    dni: string;
    curso_id: number | null;
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDocente, setEditingDocente] = useState<Docente | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        dni: '',
        curso_id: '' as string | number,
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
            curso_id: docente.curso_id || '',
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

        // Transform empty string to null for curso_id
        const payload = { ...data, curso_id: data.curso_id === '' ? null : Number(data.curso_id) };

        if (editingDocente) {
            router.put(update.url({ docente: editingDocente.id }), payload, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Docente actualizado exitosamente');
                },
                onError: (errors) => console.error(errors),
            });
        } else {
            router.post(store.url(), payload, {
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
            <Head title="Gestión de Docentes" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Docentes</h2>
                        <p className="text-muted-foreground">
                            Gestiona el personal docente de la academia.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Docente
                    </Button>
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>DNI</TableHead>
                                <TableHead>Nombres y Apellidos</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {docentes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No hay docentes registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                docentes.data.map((docente) => (
                                    <TableRow key={docente.id}>
                                        <TableCell className="font-medium">{docente.dni}</TableCell>
                                        <TableCell>
                                            {docente.nombres} {docente.apellidos}
                                        </TableCell>
                                        <TableCell>{docente.correo}</TableCell>
                                        <TableCell>{docente.telefono || '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(docente)}
                                                title="Editar"
                                            >
                                                <Pen className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(docente)}
                                                className="text-destructive focus:text-destructive"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
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
                            <div className="grid gap-2">
                                <Label htmlFor="curso_id">Curso (Opcional)</Label>
                                <Input
                                    id="curso_id"
                                    value={data.curso_id}
                                    onChange={(e) => setData('curso_id', e.target.value)}
                                    placeholder="ID del curso (temporal)"
                                    disabled
                                    title="Los cursos aún no están implementados en el sistema"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Asignación de cursos deshabilitada temporalmente.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
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
