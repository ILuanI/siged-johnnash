<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periodo_academico', function (Blueprint $table) {
            $table->smallIncrements('id_periodo');
            $table->string('nombre', 80);
            $table->unsignedSmallInteger('anio');
            $table->string('descripcion', 160)->nullable();
            $table->enum('estado', ['ABIERTO', 'CERRADO'])->default('ABIERTO');
            $table->unique('nombre', 'uq_periodo_nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periodo_academico');
    }
};
