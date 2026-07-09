import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { Toaster } from '@/components/ui/sonner';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            {children}
            <Toaster expand={true} visibleToasts={9} />
        </AuthLayoutTemplate>
    );
}
