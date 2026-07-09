import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Brain,
    CreditCard,
    GraduationCap,
    LayoutGrid,
    Plus,
    ScanBarcode,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { index as tesoreriaIndex } from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { usePermisos } from '@/hooks/use-permisos';
import { dashboard } from '@/routes';
import { index as ajustesIndex } from '@/routes/ajustes';
import { index as lectorAsistenciaIndex } from '@/routes/asistencias/lector';
import { index as desercionIndex } from '@/routes/ia/desercion';
import { nueva as nuevaMatricula } from '@/routes/matriculas';
import { index as catalogoAcademicoIndex } from '@/routes/matriculas/catalogo';
import { index as estudiantesIndex } from '@/routes/matriculas/estudiantes';
import type { NavItem } from '@/types';

const mainNavItems: (NavItem & { modulo: string })[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        modulo: 'dashboard',
    },
    { title: 'Docentes', href: '/docentes', icon: Users, modulo: 'docentes' },
    {
        title: 'Estudiantes',
        href: estudiantesIndex(),
        icon: GraduationCap,
        modulo: 'estudiantes',
    },
    {
        title: 'Catálogo académico',
        href: catalogoAcademicoIndex(),
        icon: BookOpen,
        modulo: 'estudiantes',
    },
    { title: 'Cursos', href: '/cursos', icon: BookOpen, modulo: 'cursos' },
    {
        title: 'Asistencias',
        href: lectorAsistenciaIndex(),
        icon: ScanBarcode,
        modulo: 'asistencias',
    },
    { title: 'Usuarios', href: '/usuarios', icon: Users, modulo: 'usuarios' },
    { title: 'Roles', href: '/roles', icon: ShieldCheck, modulo: 'roles' },
    { title: 'Notas', href: '/notas', icon: BookOpen, modulo: 'academico' },
    {
        title: 'Pagos',
        href: tesoreriaIndex(),
        icon: CreditCard,
        modulo: 'pagos',
    },
    {
        title: 'Reportes',
        href: '/reportes',
        icon: BarChart3,
        modulo: 'reportes',
    },
    {
        title: 'IA Deserción',
        href: desercionIndex(),
        icon: Brain,
        modulo: 'ia',
    },
    {
        title: 'Ajustes',
        href: ajustesIndex(),
        icon: Settings,
        modulo: 'ajustes',
    },
];

export function AppSidebar() {
    const { puede } = usePermisos();

    const visibleNavItems = mainNavItems.filter((item) =>
        puede(item.modulo, 'ver'),
    );
    const puedeMatricular = puede('estudiantes', 'editar');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border px-5 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/15 text-white">
                        <GraduationCap className="size-6" />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="text-sm leading-tight font-semibold text-sidebar-foreground">
                            Academia John Nash
                        </p>
                        <p className="text-xs text-sidebar-foreground/70">
                            Gestión Educativa
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {puedeMatricular && (
                    <>
                        <div className="px-4 py-5 group-data-[collapsible=icon]:hidden">
                            <Link
                                href={nuevaMatricula.url()}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7043] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#f4511e]"
                            >
                                <Plus className="size-4 shrink-0" />
                                Nueva Matrícula
                            </Link>
                        </div>
                        <div className="hidden justify-center px-4 py-5 group-data-[collapsible=icon]:flex">
                            <Link
                                href={nuevaMatricula.url()}
                                className="flex size-10 items-center justify-center rounded-lg bg-[#ff7043] text-white shadow-md transition hover:bg-[#f4511e]"
                                title="Nueva Matrícula"
                            >
                                <Plus className="size-5 shrink-0" />
                            </Link>
                        </div>
                    </>
                )}

                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
