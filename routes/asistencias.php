<?php

use App\Http\Controllers\Asistencias\LectorAsistenciaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('asistencias')
    ->name('asistencias.')
    ->group(function (): void {
        Route::get('/', [\App\Http\Controllers\Asistencias\AsistenciaController::class, 'index'])
            ->name('index');
            
        Route::get('lector', [\App\Http\Controllers\Asistencias\AsistenciaController::class, 'index'])
            ->name('lector.index'); // Redirect or alias for old route

        Route::post('lector', [LectorAsistenciaController::class, 'store'])
            ->name('lector.store');
    });
