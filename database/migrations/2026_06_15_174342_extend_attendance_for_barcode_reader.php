<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('asistencia')) {
            return;
        }

        Schema::table('asistencia', function (Blueprint $table): void {
            if (! Schema::hasColumn('asistencia', 'tipo_alumno')) {
                $table->enum('tipo_alumno', ['INTERNO', 'CONVENIO'])
                    ->default('INTERNO')
                    ->after('id_asistencia')
                    ->index();
            }

            if (! Schema::hasColumn('asistencia', 'dni')) {
                $table->char('dni', 8)->nullable()->after('tipo_alumno')->index();
            }

            if (! Schema::hasColumn('asistencia', 'nombres_convenio')) {
                $table->string('nombres_convenio', 160)->nullable()->after('dni');
            }

            if (! Schema::hasColumn('asistencia', 'registrado_en')) {
                $table->timestamp('registrado_en')->nullable()->useCurrent()->after('estado')->index();
            }

            $table->unsignedInteger('id_matricula')->nullable()->change();
            $table->unsignedInteger('id_asignacion')->nullable()->change();
            $table->index(['tipo_alumno', 'dni', 'fecha'], 'idx_asistencia_tipo_dni_fecha');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('asistencia')) {
            return;
        }

        Schema::table('asistencia', function (Blueprint $table): void {
            $table->dropIndex('idx_asistencia_tipo_dni_fecha');

            if (Schema::hasColumn('asistencia', 'registrado_en')) {
                $table->dropColumn('registrado_en');
            }

            if (Schema::hasColumn('asistencia', 'nombres_convenio')) {
                $table->dropColumn('nombres_convenio');
            }

            if (Schema::hasColumn('asistencia', 'dni')) {
                $table->dropColumn('dni');
            }

            if (Schema::hasColumn('asistencia', 'tipo_alumno')) {
                $table->dropColumn('tipo_alumno');
            }

            $table->unsignedInteger('id_matricula')->nullable(false)->change();
            $table->unsignedInteger('id_asignacion')->nullable(false)->change();
        });
    }
};
