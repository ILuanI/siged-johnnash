<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('prediccion_desercion');

        try {
            DB::statement('DROP VIEW IF EXISTS vw_features_ia');
        } catch (Throwable $e) {
            // La vista puede no existir en todos los entornos.
        }
    }

    public function down(): void
    {
        // No se restaura el módulo de IA eliminado.
    }
};
