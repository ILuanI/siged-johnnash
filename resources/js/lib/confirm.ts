type ConfirmOptions = {
    title: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: 'warning' | 'error' | 'info' | 'question' | 'success';
};

type SweetAlertResult = {
    isConfirmed: boolean;
};

type SweetAlertModule = {
    default?: {
        fire: (options: Record<string, unknown>) => Promise<SweetAlertResult>;
    };
    fire?: (options: Record<string, unknown>) => Promise<SweetAlertResult>;
};

export async function confirmAction({
    title,
    text,
    confirmButtonText = 'Confirmar',
    cancelButtonText = 'Cancelar',
    icon = 'warning',
}: ConfirmOptions): Promise<boolean> {
    try {
        const specifier = 'sweetalert2';
        const module = (await import(/* @vite-ignore */ specifier)) as SweetAlertModule;
        const sweetAlert = module.default ?? module;

        if (typeof sweetAlert.fire === 'function') {
            const result = await sweetAlert.fire({
                title,
                text,
                icon,
                showCancelButton: true,
                confirmButtonText,
                cancelButtonText,
                confirmButtonColor: '#dc2626',
            });

            return result.isConfirmed;
        }
    } catch {
        // SweetAlert2 is optional here; the project does not currently ship it.
    }

    return window.confirm([title, text].filter(Boolean).join('\n\n'));
}
