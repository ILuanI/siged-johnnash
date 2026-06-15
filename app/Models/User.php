<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'estado', 'id_rol'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    public function tienePermiso(string $modulo, string $accion): bool
    {
        if (! $this->rol) {
            return false;
        }

        $permiso = $this->rol->permisos()->where('modulo', $modulo)->first();

        if (! $permiso) {
            return false;
        }

        return match ($accion) {
            'ver' => $permiso->puede_ver,
            'editar' => $permiso->puede_editar,
            'eliminar' => $permiso->puede_eliminar,
            default => false,
        };
    }

    /**
     * @return array<string, array{puede_ver: bool, puede_editar: bool, puede_eliminar: bool}>
     */
    public function permisosPorModulo(): array
    {
        return $this->rol?->permisosPorModulo() ?? [];
    }
}
