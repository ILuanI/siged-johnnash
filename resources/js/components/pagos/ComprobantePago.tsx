import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Apoderado = { nombres?: string; telefono?: string } | null;

type CuotaItem = {
    id_cuota: number;
    numero_cuota: number;
    monto: string | number;
    concepto: string;
    fecha_vencimiento: string;
    pagos?: { monto: string | number }[];
};

type Props = {
    selectedCuotas: CuotaItem[];
    onRemove: (id: number) => void;
    onClear: () => void;
    alumno?: {
        nombres?: string;
        apellidos?: string;
        dni?: string;
        telefono?: string;
        apoderado?: Apoderado;
    } | null;
    cicloNombre?: string;
    modalidad?: string;
    tipoPago?: string;
    fechaMatricula?: string;
    numero?: string;
};

const CONCEPTO_LABEL: Record<string, string> = {
    MATRICULA: 'Matrícula',
    SIMULACRO: 'Simulacro',
    CARNET: 'Carnet',
    EXTRAORDINARIO: 'Extraordinario',
};

const CONCEPTO_BG: Record<string, string> = {
    MATRICULA: 'bg-orange-200/50',
    SIMULACRO: 'bg-blue-200/50',
    CARNET: 'bg-purple-200/50',
    EXTRAORDINARIO: 'bg-gray-200/50',
};

export function ComprobantePago({
    selectedCuotas,
    onRemove,
    onClear,
    alumno,
    cicloNombre,
    modalidad,
    tipoPago,
    fechaMatricula,
    numero,
}: Props) {
    const [openPagar, setOpenPagar] = useState(false);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');
    const [processing, setProcessing] = useState(false);

    const total = selectedCuotas.reduce(
        (sum, c) => sum + Number(c.monto) - (c.pagos?.reduce((s, p) => s + Number(p.monto), 0) ?? 0),
        0,
    );

    const handlePagarComprobante = () => {
        setProcessing(true);
        router.post(
            '/tesoreria/cuotas/pagar-comprobante',
            {
                cuota_ids: selectedCuotas.map((c) => c.id_cuota),
                metodo_pago: metodoPago,
            },
            {
                onSuccess: () => {
                    setOpenPagar(false);
                    setProcessing(false);
                    onClear();
                    toast.success('Comprobante pagado correctamente');
                },
                onError: () => {
                    setProcessing(false);
                    toast.error('Error al procesar el pago');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div
            id="comprobante-print"
            className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-sm print:p-8 print:shadow-none"
        >
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #comprobante-print, #comprobante-print * { visibility: visible; }
                    #comprobante-print { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
            <div className="mb-3 flex items-start justify-between border-b-2 border-black pb-2 print:border-black">
                <div className="flex items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        <img
                            src="/images/logo-cuadrada.png"
                            alt="Logo John Nash"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg leading-none font-black tracking-wider text-[#00a2e8]">
                            John Nash
                        </h2>
                        <p className="mt-0.5 text-[8px] font-bold tracking-widest text-[#00a2e8]">
                            ACADEMIA PRE-UNIVERSITARIA
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border border-black p-1.5 text-center print:border-black">
                    <p className="text-[10px] font-bold text-red-600">
                        COMPROBANTE DE PAGO
                    </p>
                    <p className="text-[9px] font-bold">RUC: 20601307562</p>
                    {numero && (
                        <p className="mt-1 text-[9px] font-bold text-gray-600">
                            N°: {numero}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-3 grid grid-cols-[100px_1fr_100px_1fr] gap-x-3 gap-y-2 border-b-2 border-black pb-3 text-[10px] print:border-black">
                <div className="font-bold text-gray-700">Fecha:</div>
                <div className="text-red-600 italic">
                    {fechaMatricula
                        ? new Date(fechaMatricula).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                          })
                        : '______________________'}
                </div>
                <div className="pl-2 font-bold text-gray-700">Modalidad:</div>
                <div className="border-b border-dotted border-gray-400 text-gray-700">
                    {modalidad === 'PRESENCIAL' ? 'Presencial' : 'Virtual'}
                </div>

                <div className="font-bold text-gray-700">Cliente:</div>
                <div className="border-b border-dotted border-gray-400 text-gray-700">
                    {alumno?.apoderado?.nombres ||
                        (alumno ? `${alumno.apellidos}, ${alumno.nombres}` : '______________________')}
                </div>
                <div className="pl-2 font-bold text-gray-700">Contacto:</div>
                <div className="border-b border-dotted border-gray-400 text-gray-700">
                    {alumno?.apoderado?.telefono || alumno?.telefono || '_________'}
                </div>

                <div className="font-bold text-gray-700">Estudiante:</div>
                <div className="border-b border-dotted border-gray-400 text-gray-700">
                    {alumno ? `${alumno.apellidos}, ${alumno.nombres}` : '______________________'}
                </div>
                <div className="pl-2 font-bold text-gray-700">DNI:</div>
                <div className="border-b border-dotted border-gray-400 text-gray-700">
                    {alumno?.dni || '_________'}
                </div>

                <div className="font-bold text-gray-700">Concepto:</div>
                <div className="flex items-center border-b border-dotted border-gray-400 bg-orange-200/50 px-1 text-gray-700">
                    {cicloNombre ? `AL CICLO ${cicloNombre}` : '______________________'}
                </div>
                <div className="pl-2 font-bold text-gray-700">Tipo pago:</div>
                <div className="flex items-center border-b border-dotted border-gray-400 bg-orange-200/50 px-1 text-gray-700">
                    {tipoPago === 'CONTADO' ? 'CONTADO' : 'CRÉDITO'}
                </div>
            </div>

            {selectedCuotas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <p className="mb-1 text-lg">COMPROBANTE DE PAGO</p>
                    <p className="text-xs">Agregue cuotas al comprobante</p>
                    <p className="text-[10px]">
                        Presione "Agregar" en cada cuota
                    </p>
                </div>
            ) : (
                <>
                    <table className="w-full border-collapse border border-gray-300 text-[10px] print:border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-red-600">
                                <th className="border border-gray-300 p-1 font-bold">Item</th>
                                <th className="border border-gray-300 p-1 font-bold">Cuota</th>
                                <th className="border border-gray-300 p-1 font-bold">Vence</th>
                                <th className="border border-gray-300 p-1 font-bold">Monto</th>
                                <th className="border border-gray-300 p-1 font-bold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCuotas.map((cuota) => {
                                const restante =
                                    Number(cuota.monto) -
                                    (cuota.pagos?.reduce((s, p) => s + Number(p.monto), 0) ?? 0);
                                return (
                                    <tr key={cuota.id_cuota}>
                                        <td
                                            className={`border border-gray-300 p-1 text-left font-medium ${
                                                CONCEPTO_BG[cuota.concepto] ?? ''
                                            }`}
                                        >
                                            {CONCEPTO_LABEL[cuota.concepto] ?? cuota.concepto}
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            {cuota.numero_cuota}
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            {new Date(
                                                cuota.fecha_vencimiento,
                                            ).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                            })}
                                        </td>
                                        <td className="border border-gray-300 p-1 font-medium">
                                            S/ {restante.toFixed(2)}
                                        </td>
                                        <td className="border border-gray-300 p-1">
                                            <button
                                                onClick={() =>
                                                    onRemove(cuota.id_cuota)
                                                }
                                                className="cursor-pointer text-red-500 hover:text-red-700"
                                                title="Quitar"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-gray-50 font-bold">
                                <td
                                    colSpan={3}
                                    className="border border-gray-300 p-1 text-right"
                                >
                                    Total a pagar:
                                </td>
                                <td className="border border-gray-300 p-1 text-red-600">
                                    S/ {total.toFixed(2)}
                                </td>
                                <td className="border border-gray-300 p-1"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-3 flex items-center justify-between print:hidden">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.print()}
                            className="text-xs"
                        >
                            Descargar
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onClear}
                                className="text-xs text-red-500"
                            >
                                Limpiar
                            </Button>
                            <Dialog
                                open={openPagar}
                                onOpenChange={setOpenPagar}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="bg-[#4caf50] text-xs hover:bg-[#43a047]"
                                    >
                                        Pagar Comprobante
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-lg">
                                            Pagar Comprobante
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600">
                                            Se pagarán {selectedCuotas.length} cuota(s) por un total
                                            de <strong>S/ {total.toFixed(2)}</strong>.
                                        </p>
                                        <div className="space-y-2">
                                            <Label>Método de Pago</Label>
                                            <Select
                                                value={metodoPago}
                                                onValueChange={setMetodoPago}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EFECTIVO">
                                                        Efectivo
                                                    </SelectItem>
                                                    <SelectItem value="TRANSFERENCIA">
                                                        Transferencia / Yape / Plin
                                                    </SelectItem>
                                                    <SelectItem value="TARJETA">
                                                        Tarjeta de Débito/Crédito
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={handlePagarComprobante}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            {processing
                                                ? 'Procesando...'
                                                : 'Confirmar Pago'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export type { CuotaItem as ComprobanteCuotaItem };
