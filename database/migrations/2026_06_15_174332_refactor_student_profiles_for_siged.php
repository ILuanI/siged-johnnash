<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('colegio_procedencia')) {
            Schema::create('colegio_procedencia', function (Blueprint $table): void {
                $table->smallIncrements('id_colegio_procedencia');
                $table->string('nombre', 120)->unique();
            });
        }

        if (Schema::hasTable('apoderado')) {
            if (Schema::hasColumn('apoderado', 'dni')) {
                $this->dropIndexIfExists('apoderado', 'apoderado_dni_unique');
            }

            Schema::table('apoderado', function (Blueprint $table): void {
                if (Schema::hasColumn('apoderado', 'dni')) {
                    $table->dropColumn('dni');
                }

                if (Schema::hasColumn('apoderado', 'parentesco')) {
                    $table->dropColumn('parentesco');
                }

                if (Schema::hasColumn('apoderado', 'correo')) {
                    $table->dropColumn('correo');
                }
            });
        }

        if (Schema::hasTable('alumno')) {
            Schema::table('alumno', function (Blueprint $table): void {
                if (! Schema::hasColumn('alumno', 'colegio_procedencia_id')) {
                    $table->unsignedSmallInteger('colegio_procedencia_id')->nullable()->after('telefono')->index();
                    $table->foreign('colegio_procedencia_id', 'alumno_colegio_proc_fk')
                        ->references('id_colegio_procedencia')
                        ->on('colegio_procedencia')
                        ->nullOnDelete();
                }

                if (Schema::hasColumn('alumno', 'correo')) {
                    $table->dropColumn('correo');
                }

                if (Schema::hasColumn('alumno', 'direccion')) {
                    $table->dropColumn('direccion');
                }

                if (Schema::hasColumn('alumno', 'colegio_proc')) {
                    $table->dropColumn('colegio_proc');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('alumno')) {
            if (Schema::hasColumn('alumno', 'colegio_procedencia_id') && DB::getDriverName() !== 'sqlite') {
                Schema::table('alumno', function (Blueprint $table): void {
                    $table->dropForeign('alumno_colegio_proc_fk');
                });
            }

            Schema::table('alumno', function (Blueprint $table): void {
                if (Schema::hasColumn('alumno', 'colegio_procedencia_id')) {
                    $table->dropColumn('colegio_procedencia_id');
                }

                if (! Schema::hasColumn('alumno', 'correo')) {
                    $table->string('correo', 120)->nullable()->after('telefono');
                }

                if (! Schema::hasColumn('alumno', 'direccion')) {
                    $table->string('direccion', 160)->nullable()->after('correo');
                }

                if (! Schema::hasColumn('alumno', 'colegio_proc')) {
                    $table->string('colegio_proc', 120)->nullable()->after('direccion');
                }
            });
        }

        if (Schema::hasTable('apoderado')) {
            Schema::table('apoderado', function (Blueprint $table): void {
                if (! Schema::hasColumn('apoderado', 'dni')) {
                    $table->char('dni', 8)->nullable()->unique()->after('nombres');
                }

                if (! Schema::hasColumn('apoderado', 'parentesco')) {
                    $table->string('parentesco', 40)->nullable()->after('telefono');
                }

                if (! Schema::hasColumn('apoderado', 'correo')) {
                    $table->string('correo', 120)->nullable()->after('parentesco');
                }
            });
        }

        Schema::dropIfExists('colegio_procedencia');
    }

    private function dropIndexIfExists(string $table, string $index): void
    {
        try {
            Schema::table($table, function (Blueprint $table) use ($index): void {
                $table->dropIndex($index);
            });
        } catch (Throwable) {
        }
    }
};
