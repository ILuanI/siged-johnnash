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
        Schema::create('comprobante_pago', function (Blueprint $table) {
            $table->increments('id_comprobante');
            $table->unsignedInteger('id_matricula');
            $table->string('numero', 15)->nullable()->unique();
            $table->enum('tipo', ['BOLETA', 'FACTURA', 'RECIBO', 'NINGUNO'])->default('BOLETA');
            $table->date('fecha_emision');
            $table->decimal('costo_total', 8, 2);
            $table->decimal('saldo_pendiente', 8, 2);
            $table->timestamps();

            $table->foreign('id_matricula')->references('id_matricula')->on('matricula')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comprobante_pago');
    }
};
