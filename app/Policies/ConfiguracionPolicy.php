<?php

namespace App\Policies;

use App\Models\User;

class ConfiguracionPolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user): bool
    {
        return $user->tienePermiso('pagos', 'editar');
    }
}
