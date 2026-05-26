<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('area', function (Blueprint $table) {
            $table->tinyIncrements('id_area');
            $table->char('codigo', 1)->unique();
            $table->string('nombre', 80);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area');
    }
};
