<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('curso', function (Blueprint $table) {
            $table->smallIncrements('id_curso');
            $table->string('nombre', 80);
            $table->string('area_conoc', 40)->nullable();
            $table->string('color', 7)->default('#1a237e');
            $table->timestamps();

            $table->unique('nombre', 'uq_curso');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('curso');
    }
};
