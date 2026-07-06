<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        if (Schema::hasTable('comprobante_pago')) {
            Schema::table('comprobante_pago', function (Blueprint $table): void {
                $table->index('id_matricula', 'idx_comprobante_matricula');
            });
        }

        if (Schema::hasTable('cuota')) {
            Schema::table('cuota', function (Blueprint $table): void {
                $table->index(['estado', 'fecha_vencimiento'], 'idx_cuota_estado_vencimiento');
            });
        }

        if (Schema::hasTable('pago')) {
            Schema::table('pago', function (Blueprint $table): void {
                $table->index(['id_cuota', 'fecha_pago'], 'idx_pago_cuota_fecha');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('pago')) {
            Schema::table('pago', function (Blueprint $table): void {
                $table->dropIndex('idx_pago_cuota_fecha');
            });
        }

        if (Schema::hasTable('cuota')) {
            Schema::table('cuota', function (Blueprint $table): void {
                $table->dropIndex('idx_cuota_estado_vencimiento');
            });
        }

        if (Schema::hasTable('comprobante_pago')) {
            Schema::table('comprobante_pago', function (Blueprint $table): void {
                $table->dropIndex('idx_comprobante_matricula');
            });
        }

    }
};
