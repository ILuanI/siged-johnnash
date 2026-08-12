<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cuota', function (Blueprint $table) {
            $table->enum('estado', ['PENDIENTE', 'PAGADA', 'VENCIDA', 'EXONERADA'])
                ->default('PENDIENTE')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuota', function (Blueprint $table) {
            $table->enum('estado', ['PENDIENTE', 'PAGADA', 'VENCIDA'])
                ->default('PENDIENTE')
                ->change();
        });
    }
};
