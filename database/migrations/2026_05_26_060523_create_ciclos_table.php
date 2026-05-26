<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ciclo', function (Blueprint $table) {
            $table->smallIncrements('id_ciclo');
            $table->unsignedSmallInteger('id_periodo')->nullable();
            $table->string('nombre', 60);
            $table->string('tipo_ciclo', 40)->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->decimal('costo_base', 8, 2)->default(0);
            $table->enum('estado', ['ABIERTO', 'EN_CURSO', 'CERRADO'])->default('ABIERTO');

            $table->foreign('id_periodo')->references('id_periodo')->on('periodo_academico');
            $table->unique('nombre', 'uq_ciclo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ciclo');
    }
};
