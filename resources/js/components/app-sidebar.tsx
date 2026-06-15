import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    CreditCard,
    GraduationCap,
    LayoutGrid,
    Plus,
    Settings,
    Users,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Docentes', href: '/docentes', icon: Users },
    { title: 'Estudiantes', href: '/matriculas/estudiantes', icon: GraduationCap },
    { title: 'Cursos', href: '/cursos', icon: BookOpen },
    { title: 'Usuarios', href: '#', icon: Users },
    { title: 'Notas', href: '/notas', icon: BookOpen },
    { title: 'Pagos', href: '#', icon: CreditCard },
    { title: 'Reportes', href: '/reportes', icon: BarChart3 },
    { title: 'Ajustes', href: '#', icon: Settings },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border px-5 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/15 text-white">
                        <GraduationCap className="size-6" />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-semibold leading-tight text-sidebar-foreground">
                            Academia John Nash
                        </p>
                        <p className="text-xs text-sidebar-foreground/70">
                            Gestión Educativa
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-4 py-5 group-data-[collapsible=icon]:hidden">
                    <Link
                        href="/matriculas/nueva"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7043] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#f4511e]"
                    >
                        <Plus className="size-4 shrink-0" />
                        Nueva Matrícula
                    </Link>
                </div>
                <div className="px-4 py-5 hidden group-data-[collapsible=icon]:flex justify-center">
                    <Link
                        href="/matriculas/nueva"
                        className="flex size-10 items-center justify-center rounded-lg bg-[#ff7043] text-white shadow-md hover:bg-[#f4511e] transition"
                        title="Nueva Matrícula"
                    >
                        <Plus className="size-5 shrink-0" />
                    </Link>
                </div>

                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
