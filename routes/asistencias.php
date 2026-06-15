<?php

use App\Http\Controllers\Asistencias\LectorAsistenciaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('asistencias')
    ->name('asistencias.')
    ->group(function (): void {
        Route::get('lector', [LectorAsistenciaController::class, 'index'])
            ->name('lector.index');

        Route::post('lector', [LectorAsistenciaController::class, 'store'])
            ->name('lector.store');
    });
