<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('egreso', function (Blueprint $table) {
            if (! Schema::hasColumn('egreso', 'aplica_igv')) {
                $table->boolean('aplica_igv')->default(true);
            }
            if (! Schema::hasColumn('egreso', 'igv_porcentaje')) {
                $table->decimal('igv_porcentaje', 5, 2)->default(18.00);
            }
            if (! Schema::hasColumn('egreso', 'igv_tipo')) {
                $table->string('igv_tipo', 20)->default('ANTES');
            }
        });
    }

    public function down(): void
    {
        Schema::table('egreso', function (Blueprint $table) {
            $table->dropColumn(['aplica_igv', 'igv_porcentaje', 'igv_tipo']);
        });
    }
};
