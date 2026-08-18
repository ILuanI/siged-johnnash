<?php

use App\Http\Controllers\Cursos\CursoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])->group(function (): void {
    Route::post('cursos/ciclos', [CursoController::class, 'storeCiclo'])->name('cursos.ciclos.store');
    Route::put('cursos/ciclos/{ciclo}', [CursoController::class, 'updateCiclo'])->name('cursos.ciclos.update');
    Route::delete('cursos/ciclos/{ciclo}', [CursoController::class, 'destroyCiclo'])->name('cursos.ciclos.destroy');
    Route::post('cursos/aulas', [CursoController::class, 'storeAula'])->name('cursos.aulas.store');
    Route::post('cursos/configuracion', [CursoController::class, 'configurarHorario'])->name('cursos.configuracion.update');
    Route::resource('cursos', CursoController::class)
        ->except(['create', 'show', 'edit']);
});
