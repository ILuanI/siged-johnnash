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
        Schema::create('prediccion_desercion', function (Blueprint $table) {
            $table->increments('id_prediccion');
            $table->unsignedInteger('id_matricula');
            $table->dateTime('fecha_calculo')->useCurrent();
            $table->decimal('riesgo_pct', 5, 2);
            $table->enum('nivel_riesgo', ['BAJO', 'MEDIO', 'ALTO']);
            $table->boolean('prioritario')->storedAs('riesgo_pct > 75');
            $table->decimal('tasa_asistencia', 5, 2)->nullable();
            $table->decimal('promedio_examenes', 7, 3)->nullable();
            $table->unsignedTinyInteger('cuotas_vencidas')->nullable();
            $table->timestamps();

            $table->foreign('id_matricula')->references('id_matricula')->on('matricula')->cascadeOnDelete();
            $table->index('riesgo_pct', 'idx_pred_riesgo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prediccion_desercion');
    }
};
