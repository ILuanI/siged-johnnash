import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Ciclo {
    id_ciclo: number;
    nombre: string;
}

interface PreviewRow {
    identifier: string;
    nombres: string;
    area: string;
    carrera: string;
    id_matricula: number | null;
    puntaje_aptitud: number;
    puntaje_conocimiento: number;
    puntaje_total: number;
    status: 'OK' | 'WARNING';
    mensaje: string;
}

interface Props {
    ciclos: Ciclo[];
}

export default function NotasCargar({ ciclos }: Props) {
    const [idCiclo, setIdCiclo] = useState<string>('');
    const [tipo, setTipo] = useState<string>('SIMULACRO');
    const [numero, setNumero] = useState<string>('');
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
    const [descripcion, setDescripcion] = useState<string>('');
    const [archivo, setArchivo] = useState<File | null>(null);

    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
    const [saving, setSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setArchivo(e.target.files[0]);
        }
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!idCiclo) {
            toast.error('Por favor seleccione un ciclo académico.');

            return;
        }

        if (!archivo) {
            toast.error('Por favor cargue un archivo de notas.');

            return;
        }

        setLoadingPreview(true);
        setPreviewRows([]);

        const formData = new FormData();
        formData.append('id_ciclo', idCiclo);
        formData.append('archivo', archivo);

        try {
            // Fetch token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch('/notas/preview-csv', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();

                throw new Error(errData.message || 'Error al procesar el archivo.');
            }

            const resData = await response.json();
            setPreviewRows(resData.rows || []);
            toast.success('Archivo procesado para pre-visualización.');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Ocurrió un error al cargar el archivo.');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleSave = () => {
        const validRows = previewRows.filter((r) => r.id_matricula !== null);

        if (validRows.length === 0) {
            toast.error('No hay estudiantes válidos para registrar en la base de datos.');

            return;
        }

        setSaving(true);

        router.post(
            '/notas/guardar',
            {
                id_ciclo: parseInt(idCiclo),
                tipo,
                numero: numero ? parseInt(numero) : null,
                fecha,
                descripcion,
                resultados: validRows.map((r) => ({
                    id_matricula: r.id_matricula,
                    puntaje_aptitud: r.puntaje_aptitud,
                    puntaje_conocimiento: r.puntaje_conocimiento,
                })),
            },
            {
                onSuccess: () => {
                    toast.success('Notas guardadas exitosamente.');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Error al guardar las notas.');
                    setSaving(false);
                },
            }
        );
    };

    const warningCount = previewRows.filter((r) => r.status === 'WARNING').length;
    const successCount = previewRows.filter((r) => r.status === 'OK').length;

    return (
        <>
            <Head title="Cargar Notas" />

            <header className="border-b bg-white px-8 py-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/notas"
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Cargar Notas de Lector Óptico
                        </h1>
                        <p className="text-sm text-slate-500">
                            Sube el archivo de notas obtenido de la lectora óptica, pre-visualiza los emparejamientos y guárdalos.
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex-1 space-y-6 px-8 py-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Formulario de Metadatos y Archivo */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm self-start lg:col-span-1">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detalles del Examen</h2>
                        <form onSubmit={handlePreview} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ciclo">Ciclo Académico</Label>
                                <Select value={idCiclo} onValueChange={setIdCiclo}>
                                    <SelectTrigger id="ciclo">
                                        <SelectValue placeholder="Seleccione el ciclo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ciclos.map((ciclo) => (
                                            <SelectItem key={ciclo.id_ciclo} value={ciclo.id_ciclo.toString()}>
                                                {ciclo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <Select value={tipo} onValueChange={setTipo}>
                                        <SelectTrigger id="tipo">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SIMULACRO">Simulacro</SelectItem>
                                            <SelectItem value="CONOCIMIENTO">Conocimiento</SelectItem>
                                            <SelectItem value="SEMANAL">Semanal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número (Opcional)</Label>
                                    <Input
                                        id="numero"
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 1"
                                        value={numero}
                                        onChange={(e) => setNumero(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fecha">Fecha</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Input
                                    id="descripcion"
                                    placeholder="Ej: Simulacro Admisión Especial"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="archivo">Archivo CSV / Notas</Label>
                                <Input
                                    id="archivo"
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileChange}
                                    required
                                />
                                <p className="text-xs text-slate-400">
                                    El CSV debe tener 3 columnas: Identificador (Código o DNI), Puntaje Aptitud, Puntaje Conocimiento.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loadingPreview || saving}
                                className="w-full bg-[#ff7043] hover:bg-[#f4511e]"
                            >
                                {loadingPreview ? (
                                    <>
                                        <RefreshCw className="mr-2 size-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 size-4" />
                                        Pre-visualizar Notas
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Previsualizador */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Pre-visualización de Notas</h2>
                                <p className="text-sm text-slate-500">
                                    Verifica que las calificaciones y estudiantes emparejados sean correctos.
                                </p>
                            </div>
                            {previewRows.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200" variant="outline">
                                        <CheckCircle2 className="mr-1 size-3" />
                                        {successCount} Listos
                                    </Badge>
                                    {warningCount > 0 && (
                                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200" variant="outline">
                                            <AlertTriangle className="mr-1 size-3" />
                                            {warningCount} Advertencias
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {previewRows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center border border-dashed rounded-xl py-24 text-center">
                                <Upload className="size-10 text-slate-300 mb-3" />
                                <p className="text-slate-600 font-medium">No hay datos cargados</p>
                                <p className="text-xs text-slate-400 max-w-sm mt-1">
                                    Completa el formulario de la izquierda y haz clic en "Pre-visualizar Notas" para ver el resultado de la lectora.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-h-[400px] overflow-y-auto border rounded-lg">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-slate-50 shadow-sm z-10">
                                            <TableRow>
                                                <TableHead>Identificador</TableHead>
                                                <TableHead>Estudiante</TableHead>
                                                <TableHead>Carrera (Área)</TableHead>
                                                <TableHead className="text-right">Aptitud</TableHead>
                                                <TableHead className="text-right">Conoc.</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead className="w-[120px]">Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewRows.map((row, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50/50">
                                                    <TableCell className="font-mono text-xs">{row.identifier}</TableCell>
                                                    <TableCell className="font-medium text-slate-900">{row.nombres}</TableCell>
                                                    <TableCell className="text-slate-500 text-xs">
                                                        {row.carrera} <span className="font-semibold">({row.area})</span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600">{row.puntaje_aptitud.toFixed(3)}</TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600">{row.puntaje_conocimiento.toFixed(3)}</TableCell>
                                                    <TableCell className="text-right font-bold text-slate-900">{row.puntaje_total.toFixed(3)}</TableCell>
                                                    <TableCell>
                                                        {row.status === 'OK' ? (
                                                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200" variant="outline">
                                                                {row.mensaje}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200" variant="outline" title={row.mensaje}>
                                                                Error / Advertencia
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setPreviewRows([]);
                                        }}
                                        disabled={saving}
                                    >
                                        Limpiar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || successCount === 0}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCw className="mr-2 size-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 size-4" />
                                                Confirmar y Guardar ({successCount})
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

NotasCargar.layout = {
    breadcrumbs: [
        {
            title: 'Notas',
            href: '/notas',
        },
        {
            title: 'Cargar Notas',
            href: '/notas/cargar',
        },
    ],
};
