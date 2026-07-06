import { Head } from '@inertiajs/react';
import LectorAsistencia from '@/components/LectorAsistencia';

export default function LectorAsistenciaPage() {
    return (
        <>
            <Head title="Lector de asistencia" />

            <header className="border-b bg-white px-8 py-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Asistencia por código de barras
                </h1>
                <p className="text-sm text-slate-500">
                    Registro rápido de alumnos internos y por convenio.
                </p>
            </header>

            <div className="px-8 py-8">
                <LectorAsistencia />
            </div>
        </>
    );
}
