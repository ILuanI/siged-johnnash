<?php

namespace App\Policies;

use App\Models\Cuota;
use App\Models\User;

class CuotaPolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Cuota $cuota): bool
    {
        return $user->tienePermiso('pagos', 'editar');
    }

    /**
     * Determine whether the user can exonerate a fee (cuota).
     *
     * La exoneración es una acción financiera sensible e irreversible
     * (como la anulación de pagos), por lo que exige el permiso más alto
     * del módulo de pagos.
     */
    public function exonerar(User $user, Cuota $cuota): bool
    {
        return $user->tienePermiso('pagos', 'eliminar');
    }
}
