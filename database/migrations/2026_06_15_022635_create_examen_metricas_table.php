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
        Schema::create('examen_metrica', function (Blueprint $table) {
            $table->increments('id_metrica');
            $table->unsignedInteger('id_examen');
            $table->unsignedTinyInteger('id_area');
            $table->decimal('puntaje_max', 7, 3);
            $table->decimal('puntaje_min', 7, 3);
            $table->timestamps();

            $table->foreign('id_examen')->references('id_examen')->on('examen')->cascadeOnDelete();
            $table->foreign('id_area')->references('id_area')->on('area')->cascadeOnDelete();
            $table->unique(['id_examen', 'id_area'], 'uq_examen_area');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examen_metrica');
    }
};
