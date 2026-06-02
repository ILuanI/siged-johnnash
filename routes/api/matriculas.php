<?php

use App\Http\Controllers\Api\Matriculas\AlumnoController;
use App\Http\Controllers\Api\Matriculas\ConsolidadoAlumnoController;
use App\Http\Controllers\Api\Matriculas\MatriculaController;
use Illuminate\Support\Facades\Route;

Route::prefix('matriculas')
    ->name('api.matriculas.')
    ->group(function (): void {
        Route::post('estudiantes', [AlumnoController::class, 'store'])
            ->name('estudiantes.store');

        Route::post('/', [MatriculaController::class, 'store'])
            ->name('store');

        Route::get('estudiantes/{id}/consolidado', ConsolidadoAlumnoController::class)
            ->whereNumber('id')
            ->name('estudiantes.consolidado');
    });
