<?php

use App\Enums\ConceptoPago;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comprobante_pago', function (Blueprint $table) {
            $table->string('concepto', 30)->default('MATRICULA')->after('tipo');
            $table->string('descripcion', 255)->nullable()->after('concepto');
            $table->string('numero', 20)->nullable()->change();
        });

        DB::table('comprobante_pago')->update(['concepto' => ConceptoPago::Matricula->value]);

        Schema::table('comprobante_pago', function (Blueprint $table) {
            $table->string('concepto', 30)->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('comprobante_pago', function (Blueprint $table) {
            $table->dropColumn(['concepto', 'descripcion']);
            $table->string('numero', 15)->nullable()->change();
        });
    }
};
