<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_docente', function (Blueprint $table) {
            $table->increments('id_asignacion');
            $table->foreignId('id_docente')->constrained('docentes');
            $table->unsignedSmallInteger('id_curso');
            $table->unsignedSmallInteger('id_ciclo');
            $table->unsignedSmallInteger('id_aula')->nullable();
            $table->timestamps();

            $table->foreign('id_curso')->references('id_curso')->on('curso')->cascadeOnDelete();
            $table->foreign('id_ciclo')->references('id_ciclo')->on('ciclo');
            $table->foreign('id_aula')->references('id_aula')->on('aula')->nullOnDelete();
            $table->unique(['id_curso', 'id_ciclo'], 'uq_asignacion_curso_ciclo');
            $table->index(['id_docente', 'id_ciclo'], 'idx_asignacion_docente_ciclo');
            $table->index(['id_aula', 'id_ciclo'], 'idx_asignacion_aula_ciclo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_docente');
    }
};
