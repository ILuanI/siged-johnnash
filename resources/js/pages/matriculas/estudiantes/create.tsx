import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import type { CarreraOption } from '@/types/matriculas';

type PageProps = {
    carreras: CarreraOption[];
};

export default function EstudianteCreate({ carreras }: PageProps) {
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/matriculas/estudiantes');
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
                            <Label htmlFor="id_carrera">Carrera</Label>
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
        </>
    );
}
