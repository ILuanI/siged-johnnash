<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apoderado', function (Blueprint $table) {
            $table->increments('id_apoderado');
            $table->string('nombres', 120);
            $table->char('dni', 8)->nullable()->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('parentesco', 40)->nullable();
            $table->string('correo', 120)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apoderado');
    }
};
