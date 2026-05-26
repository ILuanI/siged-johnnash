<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matricula', function (Blueprint $table) {
            $table->increments('id_matricula');
            $table->unsignedInteger('id_alumno');
            $table->unsignedSmallInteger('id_ciclo');
            $table->unsignedSmallInteger('id_periodo');
            $table->unsignedTinyInteger('id_turno');
            $table->unsignedSmallInteger('id_aula');
            $table->date('fecha_matricula');
            $table->enum('modalidad', ['PRESENCIAL', 'VIRTUAL'])->default('PRESENCIAL');
            $table->enum('tipo_pago', ['CONTADO', 'CREDITO'])->default('CONTADO');
            $table->decimal('costo_total', 8, 2);
            $table->enum('estado', ['VIGENTE', 'ANULADA', 'FINALIZADA'])->default('VIGENTE');

            $table->foreign('id_alumno')->references('id_alumno')->on('alumno');
            $table->foreign('id_ciclo')->references('id_ciclo')->on('ciclo');
            $table->foreign('id_periodo')->references('id_periodo')->on('periodo_academico');
            $table->foreign('id_turno')->references('id_turno')->on('turno');
            $table->foreign('id_aula')->references('id_aula')->on('aula');
            $table->unique(['id_alumno', 'id_ciclo'], 'uq_matricula');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matricula');
    }
};
