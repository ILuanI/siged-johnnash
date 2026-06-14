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
        Schema::create('egreso', function (Blueprint $table) {
            $table->increments('id_egreso');
            $table->date('fecha');
            $table->string('tipo_egreso', 60);
            $table->string('descripcion', 160)->nullable();
            $table->decimal('cantidad', 8, 2)->default(1);
            $table->decimal('precio', 8, 2);
            $table->decimal('igv', 8, 2)->default(0);
            $table->decimal('total', 10, 2)->storedAs('cantidad * precio + igv');
            $table->enum('metodo_pago', ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'YAPE', 'PLIN'])->default('EFECTIVO');
            $table->enum('tipo_comprobante', ['FACTURA', 'BOLETA', 'RECIBO', 'NINGUNO'])->default('NINGUNO');
            $table->string('personal', 120)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('egreso');
    }
};
