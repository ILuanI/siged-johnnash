import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    ChevronRight,
    CreditCard,
    GraduationCap,
    LayoutGrid,
    Plus,
    ScanBarcode,
    Settings,
    ShieldCheck,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import {
    caja as cajaIndex,
    index as tesoreriaIndex,
    movimientos as movimientosIndex,
} from '@/actions/App/Http/Controllers/Tesoreria/EstadoCuentaController';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermisos } from '@/hooks/use-permisos';
import { dashboard } from '@/routes';
import { index as ajustesIndex } from '@/routes/ajustes';
import { index as lectorAsistenciaIndex } from '@/routes/asistencias/lector';
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
    { title: 'Horario', href: '/cursos', icon: BookOpen, modulo: 'cursos' },
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
        title: 'Reportes',
        href: '/reportes',
        icon: BarChart3,
        modulo: 'reportes',
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
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    const visibleNavItems = mainNavItems.filter((item) =>
        puede(item.modulo, 'ver'),
    );
    const puedeMatricular = puede('estudiantes', 'editar');
    const puedeTesoreria = puede('pagos', 'ver');

    // Sub-items del módulo financiero agrupados bajo "Tesorería".
    const tesoreriaSubItems = [
        {
            title: 'Alumnos y Cuotas',
            href: tesoreriaIndex(),
            icon: CreditCard,
        },
        { title: 'Caja General', href: cajaIndex(), icon: Wallet },
        {
            title: 'Libro Diario / Movimientos',
            href: movimientosIndex(),
            icon: BookOpen,
        },
    ];

    const algunaTesoreriaActiva = tesoreriaSubItems.some((item) =>
        isCurrentUrl(item.href),
    );
    const [tesoreriaAbierto, setTesoreriaAbierto] = useState(
        algunaTesoreriaActiva,
    );

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

                {puedeTesoreria && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarMenu>
                            <Collapsible
                                open={tesoreriaAbierto}
                                onOpenChange={setTesoreriaAbierto}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: 'Tesorería' }}
                                            isActive={algunaTesoreriaActiva}
                                        >
                                            <Wallet />
                                            <span>Tesorería</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                </SidebarMenuItem>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {tesoreriaSubItems.map((sub) => (
                                            <SidebarMenuSubItem key={sub.title}>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isCurrentUrl(
                                                        sub.href,
                                                    )}
                                                >
                                                    <Link
                                                        href={sub.href}
                                                        prefetch
                                                        onClick={() => {
                                                            if (isMobile) {
                                                                setOpenMobile(
                                                                    false,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <sub.icon />
                                                        <span>{sub.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
