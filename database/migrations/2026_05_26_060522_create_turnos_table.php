<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turno', function (Blueprint $table) {
            $table->tinyIncrements('id_turno');
            $table->string('nombre', 40)->unique();
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fin')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turno');
    }
};
