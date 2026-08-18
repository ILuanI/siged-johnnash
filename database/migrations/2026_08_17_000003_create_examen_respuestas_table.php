<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examen_respuesta', function (Blueprint $table) {
            $table->increments('id_respuesta');
            $table->unsignedInteger('id_resultado');
            $table->unsignedInteger('id_pregunta');
            $table->unsignedSmallInteger('numero');
            $table->string('respuesta', 10)->nullable();
            $table->decimal('puntos_obtenidos', 7, 3)->default(0);
            $table->string('marca', 5)->nullable();
            $table->timestamps();

            $table->foreign('id_resultado')->references('id_resultado')->on('resultado_examen')->cascadeOnDelete();
            $table->foreign('id_pregunta')->references('id_pregunta')->on('examen_pregunta')->cascadeOnDelete();
            $table->unique(['id_resultado', 'id_pregunta'], 'uq_resultado_pregunta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examen_respuesta');
    }
};
