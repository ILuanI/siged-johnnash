<?php

use App\Http\Controllers\Matriculas\DemoController;
use Illuminate\Support\Facades\Route;

Route::prefix('demo/matriculas')->name('demo.matriculas.')->group(function (): void {
    Route::get('/', [DemoController::class, 'index'])->name('index');
    Route::get('/estudiantes/nuevo', [DemoController::class, 'createEstudiante'])->name('estudiante');
    Route::post('/estudiantes', [DemoController::class, 'storeEstudiante'])->name('estudiante.store');
    Route::get('/matricula/nueva', [DemoController::class, 'createMatricula'])->name('matricula');
    Route::post('/matricula', [DemoController::class, 'storeMatricula'])->name('matricula.store');
    Route::get('/consolidado/{id?}', [DemoController::class, 'consolidado'])->name('consolidado');
});
