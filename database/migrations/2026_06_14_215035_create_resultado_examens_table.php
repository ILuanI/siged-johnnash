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
        Schema::create('resultado_examen', function (Blueprint $table) {
            $table->increments('id_resultado');
            $table->unsignedInteger('id_examen');
            $table->unsignedInteger('id_matricula');
            $table->decimal('puntaje_aptitud', 7, 3)->default(0);
            $table->decimal('puntaje_conocimiento', 7, 3)->default(0);
            $table->decimal('puntaje_total', 7, 3)->default(0);
            $table->unsignedSmallInteger('puesto')->nullable();
            $table->timestamps();

            $table->foreign('id_examen')->references('id_examen')->on('examen')->cascadeOnDelete();
            $table->foreign('id_matricula')->references('id_matricula')->on('matricula')->cascadeOnDelete();
            $table->unique(['id_examen', 'id_matricula'], 'uq_resultado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultado_examen');
    }
};
