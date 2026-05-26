import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CarreraOption } from '@/types/matriculas';

type PageProps = {
    carreras: CarreraOption[];
};

export default function EstudianteCreate({ carreras }: PageProps) {
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
                <Form
                    action="/matriculas/estudiantes"
                    method="post"
                    className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="nombres">Nombres *</Label>
                                    <Input
                                        id="nombres"
                                        name="nombres"
                                        required
                                    />
                                    <InputError message={errors.nombres} />
                                </div>
                                <div>
                                    <Label htmlFor="apellidos">
                                        Apellidos *
                                    </Label>
                                    <Input
                                        id="apellidos"
                                        name="apellidos"
                                        required
                                    />
                                    <InputError message={errors.apellidos} />
                                </div>
                                <div>
                                    <Label htmlFor="dni">DNI</Label>
                                    <Input
                                        id="dni"
                                        name="dni"
                                        maxLength={8}
                                        pattern="\d{8}"
                                    />
                                    <InputError message={errors.dni} />
                                </div>
                                <div>
                                    <Label htmlFor="fecha_nac">
                                        Fecha de nacimiento
                                    </Label>
                                    <Input
                                        id="fecha_nac"
                                        name="fecha_nac"
                                        type="date"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="id_carrera">Carrera</Label>
                                    <select
                                        id="id_carrera"
                                        name="id_carrera"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                    >
                                        <option value="">—</option>
                                        {carreras.map((c) => (
                                            <option
                                                key={c.id_carrera}
                                                value={c.id_carrera}
                                            >
                                                {c.nombre}
                                                {c.area
                                                    ? ` (Área ${c.area.codigo})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="correo">Correo</Label>
                                    <Input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                    />
                                </div>
                            </div>

                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" name="direccion" />

                            <hr className="border-slate-100" />
                            <p className="text-sm font-medium text-slate-700">
                                Apoderado (opcional)
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="apoderado_nombres">
                                        Nombres
                                    </Label>
                                    <Input
                                        id="apoderado_nombres"
                                        name="apoderado[nombres]"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="apoderado_parentesco">
                                        Parentesco
                                    </Label>
                                    <Input
                                        id="apoderado_parentesco"
                                        name="apoderado[parentesco]"
                                        placeholder="Madre, Padre…"
                                    />
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
                                    <Link href="/matriculas/estudiantes">
                                        Cancelar
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
