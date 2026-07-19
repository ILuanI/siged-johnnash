import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

/**
 * El registro público está desactivado en Fortify.
 * Los usuarios se crean desde el módulo de administración.
 * Esta página existe solo para que el build de Vite no falle
 * si el componente queda referenciado.
 */
export default function Register() {
    return (
        <>
            <Head title="Registro desactivado" />

            <div className="flex flex-col gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                    El registro público no está disponible. Solicita una cuenta
                    al administrador del sistema.
                </p>

                <TextLink href={login()} className="text-sm">
                    Ir a iniciar sesión
                </TextLink>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Registro desactivado',
    description: 'Las cuentas se crean únicamente por un administrador',
};
