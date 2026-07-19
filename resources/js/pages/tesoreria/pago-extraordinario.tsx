import { Head, router, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { index as tesoreriaIndex } from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { store as storePagoExtraordinario } from '@/actions/App/Http/Controllers/Tesoreria/PagoExtraordinarioController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type AlumnoOption = {
    id_alumno: number;
    nombres: string;
    apellidos: string;
    dni: string | null;
};

export default function PagoExtraordinario({
    alumnos,
    alumno_id,
}: {
    alumnos: AlumnoOption[];
    alumno_id?: string | null;
}) {
    const [search, setSearch] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        id_alumno: alumno_id ?? '',
        monto: '',
        descripcion: '',
        num_cuotas: '1',
    });

    const filteredAlumnos = search
        ? alumnos.filter(
              (a) =>
                  a.nombres.toLowerCase().includes(search.toLowerCase()) ||
                  a.apellidos.toLowerCase().includes(search.toLowerCase()) ||
                  (a.dni && a.dni.includes(search)),
          )
        : alumnos;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storePagoExtraordinario.url(), {
            onSuccess: () => {
                toast.success('Pago extraordinario registrado correctamente');
            },
        });
    };

    return (
        <>
            <Head title="Pago Extraordinario" />

            <header className="border-b bg-white px-8 py-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Registrar Pago Extraordinario
                </h1>
                <p className="text-sm text-slate-500">
                    Crea un cobro adicional para un estudiante (exámenes,
                    certificados, materiales, etc.)
                </p>
            </header>

            <div className="mx-auto max-w-2xl px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del cobro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {!alumno_id && (
                                <div className="space-y-2">
                                    <Label>Buscar alumno</Label>
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Buscar por nombre o DNI…"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="id_alumno">
                                    Alumno *
                                </Label>
                                <Select
                                    value={data.id_alumno}
                                    onValueChange={(val) =>
                                        setData('id_alumno', val)
                                    }
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        id="id_alumno"
                                    >
                                        <SelectValue placeholder="Seleccionar alumno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredAlumnos.map((alumno) => (
                                            <SelectItem
                                                key={alumno.id_alumno}
                                                value={alumno.id_alumno.toString()}
                                            >
                                                {alumno.apellidos},{' '}
                                                {alumno.nombres}
                                                {alumno.dni
                                                    ? ` (${alumno.dni})`
                                                    : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">
                                    Concepto / Descripción *
                                </Label>
                                <Input
                                    id="descripcion"
                                    placeholder="Ej: Examen de Conocimiento - Matemática"
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="monto">Monto *</Label>
                                    <Input
                                        id="monto"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={data.monto}
                                        onChange={(e) =>
                                            setData('monto', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="num_cuotas">
                                        N° cuotas
                                    </Label>
                                    <Input
                                        id="num_cuotas"
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={data.num_cuotas}
                                        onChange={(e) =>
                                            setData(
                                                'num_cuotas',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#ff7043] hover:bg-[#f4511e]"
                                >
                                    {processing
                                        ? 'Registrando...'
                                        : 'Registrar Pago'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(tesoreriaIndex.url())
                                    }
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
