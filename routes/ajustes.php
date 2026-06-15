<?php

use App\Http\Controllers\Ajustes\ConfiguracionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('ajustes')
    ->name('ajustes.')
    ->group(function (): void {
        Route::get('/', [ConfiguracionController::class, 'index'])->name('index');

        // Aulas
        Route::post('aulas', [ConfiguracionController::class, 'storeAula'])->name('aulas.store');
        Route::patch('aulas/{aula}', [ConfiguracionController::class, 'updateAula'])->name('aulas.update');
        Route::delete('aulas/{aula}', [ConfiguracionController::class, 'destroyAula'])->name('aulas.destroy');

        // Turnos
        Route::post('turnos', [ConfiguracionController::class, 'storeTurno'])->name('turnos.store');
        Route::patch('turnos/{turno}', [ConfiguracionController::class, 'updateTurno'])->name('turnos.update');
        Route::delete('turnos/{turno}', [ConfiguracionController::class, 'destroyTurno'])->name('turnos.destroy');

        // Periodos académicos
        Route::post('periodos', [ConfiguracionController::class, 'storePeriodo'])->name('periodos.store');
        Route::patch('periodos/{periodo}', [ConfiguracionController::class, 'updatePeriodo'])->name('periodos.update');
        Route::delete('periodos/{periodo}', [ConfiguracionController::class, 'destroyPeriodo'])->name('periodos.destroy');

        // Colegios de procedencia
        Route::post('colegios', [ConfiguracionController::class, 'storeColegio'])->name('colegios.store');
        Route::patch('colegios/{colegio}', [ConfiguracionController::class, 'updateColegio'])->name('colegios.update');
        Route::delete('colegios/{colegio}', [ConfiguracionController::class, 'destroyColegio'])->name('colegios.destroy');
    });
