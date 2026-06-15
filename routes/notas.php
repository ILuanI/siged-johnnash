<?php

use App\Http\Controllers\Academico\ExamenController;
use App\Http\Controllers\Public\ConsultaNotasController;
use Illuminate\Support\Facades\Route;

// Ruta pública para padres
Route::get('/consulta-notas', [ConsultaNotasController::class, 'index'])->name('notas.consulta');

// Rutas protegidas para secretarias / administración
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notas', [ExamenController::class, 'index'])->name('notas.index');
    Route::get('/notas/cargar', [ExamenController::class, 'cargarForm'])->name('notas.cargar');
    Route::post('/notas/preview-csv', [ExamenController::class, 'previewCsv'])->name('notas.preview-csv');
    Route::post('/notas/guardar', [ExamenController::class, 'guardar'])->name('notas.guardar');
});
