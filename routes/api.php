<?php

use App\Http\Controllers\Api\Matriculas\AlumnoController;
use App\Http\Controllers\Api\Matriculas\MatriculaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('matriculas')->name('api.matriculas.')->group(function (): void {
    Route::post('estudiantes', [AlumnoController::class, 'store'])
        ->name('estudiantes.store');

    Route::get('estudiantes/{alumno}/consolidado', [AlumnoController::class, 'consolidado'])
        ->name('estudiantes.consolidado');

    Route::post('/', [MatriculaController::class, 'store'])
        ->name('store');
});
