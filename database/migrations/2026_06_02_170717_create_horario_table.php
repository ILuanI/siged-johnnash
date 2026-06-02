<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horario', function (Blueprint $table) {
            $table->increments('id_horario');
            $table->unsignedInteger('id_asignacion');
            $table->enum('dia_semana', ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_asignacion')->references('id_asignacion')->on('asignacion_docente')->cascadeOnDelete();
            $table->index(['dia_semana', 'hora_inicio', 'hora_fin'], 'idx_horario_dia_horas');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horario');
    }
};
