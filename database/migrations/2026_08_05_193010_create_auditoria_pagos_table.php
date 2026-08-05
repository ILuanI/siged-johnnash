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
        Schema::create('auditoria_pagos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('pago_id');
            $table->unsignedBigInteger('usuario_id');
            $table->string('accion', 50);
            $table->text('motivo')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->foreign('pago_id')->references('id_pago')->on('pago')->restrictOnDelete();
            $table->foreign('usuario_id')->references('id')->on('users')->restrictOnDelete();

            $table->index('pago_id');
            $table->index('usuario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_pagos');
    }
};
