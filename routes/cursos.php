<?php

use App\Http\Controllers\Cursos\CursoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])->group(function (): void {
    Route::resource('cursos', CursoController::class)
        ->except(['create', 'show', 'edit']);
});
