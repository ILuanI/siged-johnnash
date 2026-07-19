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
        Schema::create('cuota', function (Blueprint $table) {
            $table->increments('id_cuota');
            $table->unsignedInteger('id_comprobante');
            $table->unsignedTinyInteger('numero_cuota');
            $table->decimal('monto', 8, 2);
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['PENDIENTE', 'PAGADA', 'VENCIDA'])->default('PENDIENTE');
            $table->timestamps();

            $table->foreign('id_comprobante')->references('id_comprobante')->on('comprobante_pago')->cascadeOnDelete();
            $table->unique(['id_comprobante', 'numero_cuota'], 'uq_cuota');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cuota');
    }
};
