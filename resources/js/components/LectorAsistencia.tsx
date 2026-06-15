import { router } from '@inertiajs/react';
import { ScanBarcode } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { store as registrarAsistencia } from '@/actions/App/Http/Controllers/Asistencias/LectorAsistenciaController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LectorAsistencia() {
    const [dni, setDni] = useState('');
    const [processing, setProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastScanRef = useRef({ dni: '', timestamp: 0 });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const submitDni = (value: string) => {
        const dniLimpio = value.replace(/\D/g, '').slice(0, 8);

        if (dniLimpio.length !== 8 || processing) {
            return;
        }

        const now = Date.now();
        const lastScan = lastScanRef.current;

        if (lastScan.dni === dniLimpio && now - lastScan.timestamp < 1500) {
            setDni('');
            inputRef.current?.focus();

            return;
        }

        lastScanRef.current = { dni: dniLimpio, timestamp: now };
        setProcessing(true);

        router.post(
            registrarAsistencia.url(),
            { dni: dniLimpio },
            {
                preserveScroll: true,
                onSuccess: () => setDni(''),
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError ?? 'No se pudo registrar la asistencia.');
                },
                onFinish: () => {
                    setProcessing(false);
                    window.setTimeout(() => inputRef.current?.focus(), 50);
                },
            },
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') {
            return;
        }

        e.preventDefault();
        submitDni(dni);
    };

    return (
        <div className="mx-auto flex max-w-xl flex-col gap-5">
            <Alert className="border-slate-200 bg-white">
                <ScanBarcode className="size-4" />
                <AlertTitle>Lector de asistencia</AlertTitle>
                <AlertDescription>Escaneo activo para el turno actual.</AlertDescription>
            </Alert>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="lector-dni">DNI escaneado</Label>
                    <Input
                        ref={inputRef}
                        id="lector-dni"
                        inputMode="numeric"
                        autoComplete="off"
                        autoFocus
                        value={dni}
                        maxLength={8}
                        onBlur={() => window.setTimeout(() => inputRef.current?.focus(), 50)}
                        onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        onKeyDown={handleKeyDown}
                        className="h-12 font-mono text-lg tracking-widest"
                        placeholder="00000000"
                    />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">{processing ? 'Registrando asistencia...' : 'Listo para escanear'}</p>
                    <Button type="button" disabled={processing || dni.length !== 8} onClick={() => submitDni(dni)}>
                        <ScanBarcode className="size-4" />
                        Registrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
