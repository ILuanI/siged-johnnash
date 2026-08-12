<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `rol.id_rol` era `tinyIncrements` (TINYINT UNSIGNED, máximo 255). El
     * contador auto-increment de MySQL no se revierte al hacer rollback de una
     * transacción, por lo que una corrida completa de tests (RefreshDatabase +
     * RolSeeder por test) desbordaba el valor y rompía todos los inserts
     * posteriores en `rol`.
     *
     * Se amplía a INT UNSIGNED junto con las columnas FK que lo referencian
     * (`users.id_rol` y `rol_permiso.id_rol`).
     */
    public function up(): void
    {
        // MySQL no permite cambiar el tipo de una columna con una FK activa.
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_rol']);
        });

        Schema::table('rol_permiso', function (Blueprint $table) {
            $table->dropForeign(['id_rol']);
        });

        Schema::table('rol', function (Blueprint $table) {
            $table->integer('id_rol', true, true)->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('id_rol')->nullable()->change();
            $table->foreign('id_rol')->references('id_rol')->on('rol')->nullOnDelete();
        });

        Schema::table('rol_permiso', function (Blueprint $table) {
            $table->unsignedInteger('id_rol')->change();
            $table->foreign('id_rol')->references('id_rol')->on('rol')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_rol']);
        });

        Schema::table('rol_permiso', function (Blueprint $table) {
            $table->dropForeign(['id_rol']);
        });

        Schema::table('rol', function (Blueprint $table) {
            $table->tinyIncrements('id_rol')->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('id_rol')->nullable()->change();
            $table->foreign('id_rol')->references('id_rol')->on('rol')->nullOnDelete();
        });

        Schema::table('rol_permiso', function (Blueprint $table) {
            $table->unsignedTinyInteger('id_rol')->change();
            $table->foreign('id_rol')->references('id_rol')->on('rol')->cascadeOnDelete();
        });
    }
};
