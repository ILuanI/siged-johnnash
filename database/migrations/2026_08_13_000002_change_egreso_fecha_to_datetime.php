<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Cambia la columna `fecha` de la tabla `egreso` de DATE a DATETIME para
     * registrar la fecha y hora exacta del movimiento.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE egreso MODIFY fecha DATETIME NOT NULL');
    }

    /**
     * Revierte el cambio a DATE.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE egreso MODIFY fecha DATE NOT NULL');
    }
};
