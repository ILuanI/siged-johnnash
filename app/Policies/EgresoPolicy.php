<?php

namespace App\Policies;

use App\Models\Egreso;
use App\Models\User;

class EgresoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->tienePermiso('pagos', 'ver');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Egreso $egreso): bool
    {
        return $user->tienePermiso('pagos', 'ver');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->tienePermiso('pagos', 'editar');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Egreso $egreso): bool
    {
        return $user->tienePermiso('pagos', 'editar');
    }

    /**
     * Determine whether the user can delete (anular) the model.
     */
    public function delete(User $user, Egreso $egreso): bool
    {
        return $user->tienePermiso('pagos', 'eliminar');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Egreso $egreso): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Egreso $egreso): bool
    {
        return false;
    }
}
