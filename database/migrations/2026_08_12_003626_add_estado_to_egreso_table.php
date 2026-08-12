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
        Schema::table('egreso', function (Blueprint $table) {
            $table->enum('estado', ['REGISTRADO', 'ANULADO'])->default('REGISTRADO')->after('categoria');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('egreso', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
    }
};
