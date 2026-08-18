<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('curso', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id_area')
                ->nullable()
                ->after('area_conoc');

            $table->foreign('id_area')
                ->references('id_area')
                ->on('area')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('curso', function (Blueprint $table): void {
            $table->dropForeign(['id_area']);
            $table->dropColumn('id_area');
        });
    }
};
