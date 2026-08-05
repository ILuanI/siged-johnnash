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
}
