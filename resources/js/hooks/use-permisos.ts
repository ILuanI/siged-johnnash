import { usePage } from '@inertiajs/react';

export type PermisoModulo = {
    puede_ver: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
};

export type PermisosMap = Record<string, PermisoModulo>;

export function usePermisos() {
    const { auth } = usePage<{ auth: { permisos: PermisosMap } }>().props;

    const puede = (
        modulo: string,
        accion: 'ver' | 'editar' | 'eliminar',
    ): boolean => {
        const permiso = auth.permisos?.[modulo];

        if (!permiso) {
            return false;
        }

        return permiso[`puede_${accion}`] ?? false;
    };

    return { permisos: auth.permisos ?? {}, puede };
}
