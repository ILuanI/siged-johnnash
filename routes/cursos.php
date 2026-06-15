<?php

use App\Http\Controllers\Cursos\CursoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])->group(function (): void {
    Route::post('cursos/ciclos', [CursoController::class, 'storeCiclo'])->name('cursos.ciclos.store');
    Route::post('cursos/aulas', [CursoController::class, 'storeAula'])->name('cursos.aulas.store');
    Route::resource('cursos', CursoController::class)
        ->except(['create', 'show', 'edit']);
});
