<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('configuracion')->updateOrInsert(
            ['clave' => 'igv_porcentaje_defecto'],
            ['valor' => '18.00', 'created_at' => now(), 'updated_at' => now()]
        );
    }

    public function down(): void
    {
        DB::table('configuracion')->where('clave', 'igv_porcentaje_defecto')->delete();
    }
};
