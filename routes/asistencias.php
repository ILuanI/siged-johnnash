<?php

use App\Http\Controllers\Asistencias\AsistenciaController;
use App\Http\Controllers\Asistencias\LectorAsistenciaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('asistencias')
    ->name('asistencias.')
    ->group(function (): void {
        Route::get('/', [AsistenciaController::class, 'index'])
            ->name('index');

        Route::get('lector', [AsistenciaController::class, 'index'])
            ->name('lector.index'); // Redirect or alias for old route

        Route::post('lector', [LectorAsistenciaController::class, 'store'])
            ->name('lector.store');
    });
