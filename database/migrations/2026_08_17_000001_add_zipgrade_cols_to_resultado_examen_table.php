<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resultado_examen', function (Blueprint $table) {
            $table->decimal('puntaje_posible', 7, 3)->nullable()->after('puntaje_total');
            $table->decimal('porcentaje', 5, 2)->nullable()->after('puntaje_posible');
        });
    }

    public function down(): void
    {
        Schema::table('resultado_examen', function (Blueprint $table) {
            $table->dropColumn(['puntaje_posible', 'porcentaje']);
        });
    }
};
