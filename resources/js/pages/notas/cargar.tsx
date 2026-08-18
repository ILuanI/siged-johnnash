import { Head, router, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Upload,
    CheckCircle2,
    AlertTriangle,
    Save,
    RefreshCw,
    FileSpreadsheet,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
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

interface Ciclo {
    id_ciclo: number;
    nombre: string;
}

interface Area {
    id_area: number;
    nombre: string;
}

interface PreviewExamen {
    quiz_name: string;
    quiz_class: string;
    quiz_created: string;
    data_exported: string;
    key_version: string;
    possible_points: number;
    num_preguntas: number;
}

interface PreviewPregunta {
    numero: number;
    clave_correcta: string;
    puntos: number;
}

interface PreviewFila {
    student_id: string;
    nombre: string;
    dni: string | null;
    id_matricula: number | null;
    earned: number;
    possible: number;
    percent: number;
    status: 'OK' | 'WARNING';
    mensaje: string;
}

interface PreviewResumen {
    total: number;
    ok: number;
    warning: number;
    no_encontrados: { student_id: string; nombre: string }[];
}

interface Props {
    ciclos: Ciclo[];
    areas: Area[];
}

function extraerFecha(valor: string): string {
    if (!valor) {
return '';
}

    const match = valor.match(/^\d{4}-\d{2}-\d{2}/);

    return match ? match[0] : '';
}

export default function NotasCargar({ ciclos, areas }: Props) {
    const [idCiclo, setIdCiclo] = useState<string>('');
    const [idArea, setIdArea] = useState<string>('');
    const [tipo, setTipo] = useState<string>('SIMULACRO');
    const [numero, setNumero] = useState<string>('');
    const [fecha, setFecha] = useState<string>(
        new Date().toISOString().split('T')[0],
    );
    const [descripcion, setDescripcion] = useState<string>('');
    const [archivo, setArchivo] = useState<File | null>(null);

    const [loadingPreview, setLoadingPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const [examenMeta, setExamenMeta] = useState<PreviewExamen | null>(null);
    const [preguntas, setPreguntas] = useState<PreviewPregunta[]>([]);
    const [filas, setFilas] = useState<PreviewFila[]>([]);
    const [resumen, setResumen] = useState<PreviewResumen | null>(null);

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
            toast.error('Por favor cargue un archivo CSV de ZipGrade.');

            return;
        }

        setLoadingPreview(true);
        setExamenMeta(null);
        setFilas([]);
        setPreguntas([]);
        setResumen(null);

        const formData = new FormData();
        formData.append('id_ciclo', idCiclo);
        formData.append('archivo', archivo);

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';

            const response = await fetch('/notas/preview-csv', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: formData,
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || 'Error al procesar el archivo.');
            }

            setExamenMeta(resData.examen);
            setPreguntas(resData.preguntas || []);
            setFilas(resData.filas || []);
            setResumen(resData.resumen);

            // Precargar datos sugeridos desde el CSV
            const fechaSuge = extraerFecha(resData.examen?.data_exported);

            if (fechaSuge) {
setFecha(fechaSuge);
}

            if (resData.examen?.quiz_name) {
                setDescripcion((prev) => prev || resData.examen.quiz_name);
            }

            toast.success('Archivo de ZipGrade procesado para pre-visualización.');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Ocurrió un error al cargar el archivo.');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleSave = () => {
        const validRows = filas.filter((r) => r.id_matricula !== null);

        if (validRows.length === 0) {
            toast.error('No hay estudiantes válidos para registrar en la base de datos.');

            return;
        }

        setSaving(true);

        const formData = new FormData();
        formData.append('id_ciclo', idCiclo);
        formData.append('tipo', tipo);
        formData.append('numero', numero || '');
        formData.append('fecha', fecha);
        formData.append('descripcion', descripcion);
        formData.append('id_area', idArea || '');

        if (archivo) {
formData.append('archivo', archivo);
}

        router.post('/notas/guardar', formData, {
            onSuccess: () => {
                toast.success('Resultados de ZipGrade guardados exitosamente.');
            },
            onError: (err: any) => {
                console.error(err);
                const msg =
                    err?.archivo?.[0] ||
                    err?.descripcion?.[0] ||
                    'Error al guardar los resultados.';
                toast.error(msg);
                setSaving(false);
            },
        });
    };

    const warningCount = resumen?.warning ?? 0;
    const successCount = resumen?.ok ?? 0;

    return (
        <>
            <Head title="Cargar Resultados ZipGrade" />

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
                            Cargar Resultados ZIP Grade
                        </h1>
                        <p className="text-sm text-slate-500">
                            Importe calificaciones exportadas desde ZIP Grade
                            (CSV con respuestas por pregunta).
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex-1 space-y-6 px-8 py-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Formulario de configuración */}
                    <div className="self-start rounded-xl border bg-white p-6 shadow-sm lg:col-span-1">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">
                            Configuración del Examen
                        </h2>
                        <form onSubmit={handlePreview} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ciclo">Ciclo Académico</Label>
                                <Select value={idCiclo} onValueChange={setIdCiclo}>
                                    <SelectTrigger id="ciclo">
                                        <SelectValue placeholder="Seleccione el ciclo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ciclos.map((ciclo) => (
                                            <SelectItem
                                                key={ciclo.id_ciclo}
                                                value={ciclo.id_ciclo.toString()}
                                            >
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
                                            <SelectItem value="SIMULACRO">
                                                Simulacro
                                            </SelectItem>
                                            <SelectItem value="CONOCIMIENTO">
                                                Conocimiento
                                            </SelectItem>
                                            <SelectItem value="SEMANAL">
                                                Semanal
                                            </SelectItem>
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
                                <Label htmlFor="area">Área (Opcional)</Label>
                                <Select value={idArea} onValueChange={setIdArea}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Sin área específica" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.map((area) => (
                                            <SelectItem
                                                key={area.id_area}
                                                value={area.id_area.toString()}
                                            >
                                                {area.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="archivo">Archivo CSV ZIP Grade</Label>
                                <Input
                                    id="archivo"
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileChange}
                                    required
                                />
                                <p className="text-xs text-slate-400">
                                    Columnas esperadas: StudentID, Earned Points,
                                    Possible Points, StuN, PriKeyN, PointsN, MarkN, etc.
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
                                        Pre-visualizar CSV
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Previsualizador */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Pre-visualización
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Verifique la detección del examen y el
                                    emparejamiento de estudiantes.
                                </p>
                            </div>
                            {resumen && (
                                <div className="flex items-center gap-3">
                                    <Badge
                                        className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
                                        variant="outline"
                                    >
                                        <FileSpreadsheet className="mr-1 size-3" />
                                        {examenMeta?.num_preguntas ?? 0} preguntas
                                    </Badge>
                                    <Badge
                                        className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                        variant="outline"
                                    >
                                        <CheckCircle2 className="mr-1 size-3" />
                                        {successCount} Listos
                                    </Badge>
                                    {warningCount > 0 && (
                                        <Badge
                                            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                                            variant="outline"
                                        >
                                            <AlertTriangle className="mr-1 size-3" />
                                            {warningCount} Advertencias
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {!examenMeta ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                                <Upload className="mb-3 size-10 text-slate-300" />
                                <p className="font-medium text-slate-600">
                                    No hay datos cargados
                                </p>
                                <p className="mt-1 max-w-sm text-xs text-slate-400">
                                    Seleccione un ciclo y un archivo CSV de ZIP
                                    Grade, luego haga clic en "Pre-visualizar CSV".
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Metadata del examen */}
                                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Quiz</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {examenMeta.quiz_name || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Clase</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {examenMeta.quiz_class || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Pts. Posibles</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {examenMeta.possible_points}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-500">Versión Clave</p>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {examenMeta.key_version || '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Estudiantes no encontrados */}
                                {resumen && resumen.no_encontrados.length > 0 && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <p className="text-xs font-semibold text-amber-800">
                                            Estudiantes no encontrados ({resumen.no_encontrados.length})
                                        </p>
                                        <p className="mt-1 text-xs text-amber-700">
                                            {resumen.no_encontrados
                                                .map((n) => n.student_id)
                                                .join(', ')}
                                        </p>
                                    </div>
                                )}

                                {/* Tabla de estudiantes */}
                                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                                            <TableRow>
                                                <TableHead>StudentID</TableHead>
                                                <TableHead>Estudiante</TableHead>
                                                <TableHead>DNI</TableHead>
                                                <TableHead className="text-right">Puntaje</TableHead>
                                                <TableHead className="text-right">%</TableHead>
                                                <TableHead className="w-[120px]">Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filas.map((row, index) => (
                                                <TableRow
                                                    key={index}
                                                    className="hover:bg-slate-50/50"
                                                >
                                                    <TableCell className="font-mono text-xs">
                                                        {row.student_id}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-900">
                                                        {row.nombre}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-slate-500">
                                                        {row.dni ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600">
                                                        {Number(row.earned).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-slate-600">
                                                        {Number(row.percent).toFixed(1)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.status === 'OK' ? (
                                                            <Badge
                                                                className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                                                variant="outline"
                                                            >
                                                                {row.mensaje}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
                                                                variant="outline"
                                                                title={row.mensaje}
                                                            >
                                                                No encontrado
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
                                            setExamenMeta(null);
                                            setFilas([]);
                                            setPreguntas([]);
                                            setResumen(null);
                                        }}
                                        disabled={saving}
                                    >
                                        Limpiar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving || successCount === 0}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
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
            title: 'Cargar ZIP Grade',
            href: '/notas/cargar',
        },
    ],
};
