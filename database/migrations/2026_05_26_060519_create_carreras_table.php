<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carrera', function (Blueprint $table) {
            $table->smallIncrements('id_carrera');
            $table->unsignedTinyInteger('id_area');
            $table->string('nombre', 120);
            $table->decimal('puntaje_min', 7, 3)->nullable();
            $table->decimal('puntaje_max', 7, 3)->nullable();

            $table->foreign('id_area')->references('id_area')->on('area');
            $table->unique(['id_area', 'nombre'], 'uq_carrera');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carrera');
    }
};
