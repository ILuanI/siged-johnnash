<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('asignacion_docente', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id_turno')
                ->nullable()
                ->after('id_aula');

            $table->foreign('id_turno')
                ->references('id_turno')
                ->on('turno')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('asignacion_docente', function (Blueprint $table): void {
            $table->dropForeign(['id_turno']);
            $table->dropColumn('id_turno');
        });
    }
};
