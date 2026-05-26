<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Extiende el esquema de script.sql con periodo, turno y vínculos del módulo Laravel.
 * Es idempotente: seguro si las tablas ya existen parcialmente.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('periodo_academico')) {
            Schema::create('periodo_academico', function (Blueprint $table) {
                $table->smallIncrements('id_periodo');
                $table->string('nombre', 80);
                $table->unsignedSmallInteger('anio');
                $table->string('descripcion', 160)->nullable();
                $table->enum('estado', ['ABIERTO', 'CERRADO'])->default('ABIERTO');
                $table->unique('nombre', 'uq_periodo_nombre');
            });
        }

        if (! Schema::hasTable('turno')) {
            Schema::create('turno', function (Blueprint $table) {
                $table->tinyIncrements('id_turno');
                $table->string('nombre', 40)->unique();
                $table->time('hora_inicio')->nullable();
                $table->time('hora_fin')->nullable();
            });
        }

        if (Schema::hasTable('ciclo') && ! Schema::hasColumn('ciclo', 'id_periodo')) {
            Schema::table('ciclo', function (Blueprint $table) {
                $table->unsignedSmallInteger('id_periodo')->nullable()->after('id_ciclo');
                $table->foreign('id_periodo')->references('id_periodo')->on('periodo_academico');
            });
        }

        if (Schema::hasTable('matricula')) {
            Schema::table('matricula', function (Blueprint $table) {
                if (! Schema::hasColumn('matricula', 'id_periodo')) {
                    $table->unsignedSmallInteger('id_periodo')->nullable()->after('id_ciclo');
                }
                if (! Schema::hasColumn('matricula', 'id_turno')) {
                    $table->unsignedTinyInteger('id_turno')->nullable()->after('id_periodo');
                }
                if (! Schema::hasColumn('matricula', 'id_aula')) {
                    $table->unsignedSmallInteger('id_aula')->nullable()->after('id_turno');
                }
            });

            if (Schema::hasTable('periodo_academico') && Schema::hasColumn('matricula', 'id_periodo')) {
                Schema::table('matricula', function (Blueprint $table) {
                    $table->foreign('id_periodo')->references('id_periodo')->on('periodo_academico');
                });
            }

            if (Schema::hasTable('turno') && Schema::hasColumn('matricula', 'id_turno')) {
                Schema::table('matricula', function (Blueprint $table) {
                    $table->foreign('id_turno')->references('id_turno')->on('turno');
                });
            }

            if (Schema::hasTable('aula') && Schema::hasColumn('matricula', 'id_aula')) {
                Schema::table('matricula', function (Blueprint $table) {
                    $table->foreign('id_aula')->references('id_aula')->on('aula');
                });
            }
        }

        if (Schema::hasTable('alumno')) {
            DB::statement("ALTER TABLE alumno MODIFY estado ENUM('ACTIVO','MATRICULADO','RETIRADO','EGRESADO') NOT NULL DEFAULT 'ACTIVO'");
        }
    }

    public function down(): void
    {
        // No revertir en entornos con script.sql importado manualmente.
    }
};
