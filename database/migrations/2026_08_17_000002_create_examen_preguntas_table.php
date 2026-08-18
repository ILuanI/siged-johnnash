<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examen_pregunta', function (Blueprint $table) {
            $table->increments('id_pregunta');
            $table->unsignedInteger('id_examen');
            $table->unsignedSmallInteger('numero');
            $table->string('clave_correcta', 10);
            $table->decimal('puntos', 7, 3)->default(0);
            $table->timestamps();

            $table->foreign('id_examen')->references('id_examen')->on('examen')->cascadeOnDelete();
            $table->unique(['id_examen', 'numero'], 'uq_examen_pregunta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examen_pregunta');
    }
};
