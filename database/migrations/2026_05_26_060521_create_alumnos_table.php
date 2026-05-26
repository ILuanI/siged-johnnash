<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumno', function (Blueprint $table) {
            $table->increments('id_alumno');
            $table->string('codigo', 15)->unique();
            $table->string('nombres', 80);
            $table->string('apellidos', 80);
            $table->char('dni', 8)->nullable()->unique();
            $table->date('fecha_nac')->nullable();
            $table->enum('sexo', ['M', 'F', 'OTRO'])->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('correo', 120)->nullable();
            $table->string('direccion', 160)->nullable();
            $table->string('colegio_proc', 120)->nullable();
            $table->unsignedSmallInteger('id_carrera')->nullable();
            $table->unsignedInteger('id_apoderado')->nullable();
            $table->enum('estado', ['ACTIVO', 'MATRICULADO', 'RETIRADO', 'EGRESADO'])->default('ACTIVO');
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('id_carrera')->references('id_carrera')->on('carrera');
            $table->foreign('id_apoderado')->references('id_apoderado')->on('apoderado');
            $table->index(['apellidos', 'nombres'], 'idx_alumno_nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumno');
    }
};
