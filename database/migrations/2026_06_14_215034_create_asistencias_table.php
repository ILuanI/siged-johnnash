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
        Schema::create('asistencia', function (Blueprint $table) {
            $table->increments('id_asistencia');
            $table->unsignedInteger('id_matricula');
            $table->unsignedInteger('id_asignacion');
            $table->date('fecha');
            $table->enum('estado', ['ASISTIO', 'FALTO', 'TARDANZA', 'JUSTIFICADO']);
            $table->timestamps(); // Provides created_at and updated_at

            $table->foreign('id_matricula')->references('id_matricula')->on('matricula')->cascadeOnDelete();
            $table->foreign('id_asignacion')->references('id_asignacion')->on('asignacion_docente')->cascadeOnDelete();
            $table->unique(['id_matricula', 'id_asignacion', 'fecha'], 'uq_asistencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencia');
    }
};
