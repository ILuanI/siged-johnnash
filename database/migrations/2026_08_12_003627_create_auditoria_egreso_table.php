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
        Schema::create('auditoria_egreso', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('egreso_id');
            $table->unsignedBigInteger('usuario_id');
            $table->string('accion', 50);
            $table->text('motivo')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->foreign('egreso_id')->references('id_egreso')->on('egreso')->restrictOnDelete();
            $table->foreign('usuario_id')->references('id')->on('users')->restrictOnDelete();

            $table->index('egreso_id');
            $table->index('usuario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_egreso');
    }
};
