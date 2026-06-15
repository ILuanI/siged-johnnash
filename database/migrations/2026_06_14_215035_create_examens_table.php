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
        Schema::create('examen', function (Blueprint $table) {
            $table->increments('id_examen');
            $table->unsignedSmallInteger('id_ciclo');
            $table->enum('tipo', ['SIMULACRO', 'CONOCIMIENTO', 'SEMANAL']);
            $table->unsignedSmallInteger('numero')->nullable();
            $table->unsignedTinyInteger('id_area')->nullable();
            $table->date('fecha');
            $table->string('descripcion', 120)->nullable();
            $table->timestamps();

            $table->foreign('id_ciclo')->references('id_ciclo')->on('ciclo')->cascadeOnDelete();
            $table->foreign('id_area')->references('id_area')->on('area')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examen');
    }
};
