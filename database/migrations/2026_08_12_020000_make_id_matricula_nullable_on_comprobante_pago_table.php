<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Permite comprobantes de ingresos generales (sin alumno/matrícula),
     * p. ej. donaciones, alquileres u otros cobros de caja.
     */
    public function up(): void
    {
        Schema::table('comprobante_pago', function (Blueprint $table) {
            $table->unsignedInteger('id_matricula')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comprobante_pago', function (Blueprint $table) {
            $table->unsignedInteger('id_matricula')->nullable(false)->change();
        });
    }
};
