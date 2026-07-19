<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matricula', function (Blueprint $table) {
            $table->decimal('costo_matricula', 8, 2)->default(0)->after('costo_total');
            $table->decimal('costo_simulacro', 8, 2)->default(0)->after('costo_matricula');
            $table->decimal('costo_carnet', 8, 2)->default(0)->after('costo_simulacro');
            $table->unsignedTinyInteger('cuotas_matricula')->default(1)->after('costo_carnet');
            $table->unsignedTinyInteger('cuotas_simulacro')->default(1)->after('cuotas_matricula');
        });
    }

    public function down(): void
    {
        Schema::table('matricula', function (Blueprint $table) {
            $table->dropColumn([
                'costo_matricula',
                'costo_simulacro',
                'costo_carnet',
                'cuotas_matricula',
                'cuotas_simulacro',
            ]);
        });
    }
};
