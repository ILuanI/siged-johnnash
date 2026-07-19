<?php

namespace App\Http\Middleware;

use App\Support\ModulosSistema;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $modulo = $this->resolverModulo($request);

        if ($modulo === null) {
            return $next($request);
        }

        $accion = match (true) {
            $request->isMethod('DELETE') => 'eliminar',
            $request->isMethod('GET'), $request->isMethod('HEAD') => 'ver',
            default => 'editar',
        };

        if (! $user->tienePermiso($modulo, $accion)) {
            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        return $next($request);
    }

    private function resolverModulo(Request $request): ?string
    {
        $routeName = $request->route()?->getName();

        if ($routeName === null) {
            return null;
        }

        if (str_starts_with($routeName, 'matriculas.estudiantes') || str_starts_with($routeName, 'matriculas.')) {
            return 'estudiantes';
        }

        if (str_starts_with($routeName, 'tesoreria.pago-extraordinario')) {
            return 'pagos_extraordinarios';
        }

        if (str_starts_with($routeName, 'tesoreria.')) {
            return 'pagos';
        }

        if (str_starts_with($routeName, 'notas.')) {
            return 'academico';
        }

        if (str_starts_with($routeName, 'profile.') || str_starts_with($routeName, 'password.') || str_starts_with($routeName, 'passkeys.') || str_starts_with($routeName, 'two-factor.') || str_starts_with($routeName, 'appearance.')) {
            return null;
        }

        $modulo = explode('.', $routeName)[0];

        return in_array($modulo, ModulosSistema::keys(), true) ? $modulo : null;
    }
}
