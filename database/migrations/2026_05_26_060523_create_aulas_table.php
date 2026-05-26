<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aula', function (Blueprint $table) {
            $table->smallIncrements('id_aula');
            $table->string('nombre', 40)->unique();
            $table->unsignedSmallInteger('capacidad')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aula');
    }
};
