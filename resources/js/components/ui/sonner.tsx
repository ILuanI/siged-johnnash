import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="bottom-right"
            richColors
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--success-bg': 'var(--popover)',
                    '--success-text': '#15803d',
                    '--success-border': '#bbf7d0',
                    '--error-bg': 'var(--popover)',
                    '--error-text': '#b91c1c',
                    '--error-border': '#fecaca',
                    '--warning-bg': 'var(--popover)',
                    '--warning-text': '#ea580c',
                    '--warning-border': '#ffedd5',
                    '--info-bg': 'var(--popover)',
                    '--info-text': '#0284c7',
                    '--info-border': '#e0f2fe',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
