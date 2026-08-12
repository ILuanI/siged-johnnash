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
        Schema::create('categoria_financiera', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 60);
            $table->enum('tipo', ['INGRESO', 'EGRESO']);
            $table->boolean('es_por_defecto')->default(false);
            $table->string('descripcion', 160)->nullable();
            $table->timestamps();

            $table->unique(['nombre', 'tipo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categoria_financiera');
    }
};
