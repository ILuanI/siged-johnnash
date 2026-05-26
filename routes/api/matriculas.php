<?php

use App\Http\Controllers\Api\Matriculas\AlumnoController;
use App\Http\Controllers\Api\Matriculas\ConsolidadoAlumnoController;
use App\Http\Controllers\Api\Matriculas\MatriculaController;
use Illuminate\Support\Facades\Route;

Route::prefix('matriculas')->group(function (): void {
    Route::post('estudiantes', [AlumnoController::class, 'store'])
        ->name('matriculas.estudiantes.store');

    Route::post('/', [MatriculaController::class, 'store'])
        ->name('matriculas.store');

    Route::get('estudiantes/{id}/consolidado', ConsolidadoAlumnoController::class)
        ->whereNumber('id')
        ->name('matriculas.estudiantes.consolidado');
});
