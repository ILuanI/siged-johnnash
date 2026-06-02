import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CreditCard,
    GraduationCap,
    LayoutGrid,
    LogOut,
    Plus,
    Settings,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';

type NavLink = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
};

const navItems: NavLink[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid, disabled: true },
    { title: 'Estudiantes', href: '/matriculas/estudiantes', icon: Users },
    { title: 'Académico', href: '/cursos', icon: BookOpen },
    { title: 'Pagos', href: '#', icon: CreditCard, disabled: true },
    { title: 'Reportes', href: '#', icon: BarChart3, disabled: true },
    { title: 'Ajustes', href: '#', icon: Settings, disabled: true },
];

export function MatriculasSidebar({ currentUrl }: { currentUrl: string }) {
    const isActive = (href: string) =>
        href !== '#' && (currentUrl === href || currentUrl.startsWith(`${href}?`));

    return (
        <aside className="flex w-64 shrink-0 flex-col bg-[#1a237e] text-white">
            <div className="border-b border-white/10 px-5 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/15">
                        <GraduationCap className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight">
                            Academia John Nash
                        </p>
                        <p className="text-xs text-white/70">Gestión Educativa</p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-5">
                <Link
                    href="/matriculas/nueva"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7043] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#f4511e]"
                >
                    <Plus className="size-4" />
                    Nueva Matrícula
                </Link>
            </div>

            <nav className="flex-1 space-y-0.5 px-3">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    if (item.disabled) {
                        return (
                            <span
                                key={item.title}
                                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40"
                                title="Próximamente"
                            >
                                <Icon className="size-5 shrink-0" />
                                {item.title}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                                active
                                    ? 'bg-white/15 font-medium text-white'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                            )}
                        >
                            <Icon className="size-5 shrink-0" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="space-y-1 border-t border-white/10 px-3 py-4 text-sm">
                <a
                    href="#"
                    className="block rounded-lg px-3 py-2 text-white/60 hover:text-white"
                >
                    Soporte
                </a>
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-white/60 hover:text-white"
                >
                    <LogOut className="size-4" />
                    Cerrar Sesión
                </Link>
            </div>
        </aside>
    );
}
