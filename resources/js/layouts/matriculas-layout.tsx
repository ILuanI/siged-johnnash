import { Head, usePage } from '@inertiajs/react';
import { MatriculasSidebar } from '@/components/matriculas/matriculas-sidebar';
import { useFlashToast } from '@/hooks/use-flash-toast';

type SharedProps = {
    flash?: { success?: string; error?: string };
};

export default function MatriculasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useFlashToast();
    const { url, props } = usePage<SharedProps>();
    const flash = props.flash;

    return (
        <div className="flex min-h-screen bg-[#f0f2f5]">
            <Head title="Matrículas" />
            <MatriculasSidebar currentUrl={url} />
            <div className="flex min-w-0 flex-1 flex-col">
                {flash?.success && (
                    <div className="mx-8 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-8 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {flash.error}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
