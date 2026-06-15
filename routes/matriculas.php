<?php

use App\Http\Controllers\Matriculas\EstudianteWebController;
use App\Http\Controllers\Matriculas\MatriculaWebController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('matriculas')
    ->name('matriculas.')
    ->group(function (): void {
        Route::get('estudiantes', [EstudianteWebController::class, 'index'])
            ->name('estudiantes.index');

        Route::get('estudiantes/nuevo', [EstudianteWebController::class, 'create'])
            ->name('estudiantes.create');

        Route::post('estudiantes', [EstudianteWebController::class, 'store'])
            ->name('estudiantes.store');

        Route::post('carreras', [EstudianteWebController::class, 'storeCarrera'])
            ->name('carreras.store');

        Route::get('nueva', [MatriculaWebController::class, 'create'])
            ->name('nueva');

        Route::post('nueva', [MatriculaWebController::class, 'store'])
            ->name('store');
    });
