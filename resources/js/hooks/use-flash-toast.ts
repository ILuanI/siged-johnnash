import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    const { props } = usePage();
    const flash = props.flash as { toast: FlashToast | null } | undefined;
    const lastToastRef = useRef<string | null>(null);

    useEffect(() => {
        const currentToast = flash?.toast;
        if (!currentToast) {
            lastToastRef.current = null;
            return;
        }

        const toastKey = `${currentToast.type}:${currentToast.message}`;

        if (lastToastRef.current !== toastKey) {
            const { type, message } = currentToast;
            if (typeof (toast as any)[type] === 'function') {
                (toast as any)[type](message);
            } else {
                toast(message);
            }
            lastToastRef.current = toastKey;
        }
    }, [flash]);
}
