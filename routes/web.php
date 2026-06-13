<?php

use App\Http\Controllers\DocenteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Matriculas\EstudianteWebController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('docentes', DocenteController::class)->except(['create', 'show', 'edit']);
});

Route::get('/matriculas/estudiantes', [EstudianteWebController::class, 'index'])->name('matriculas.estudiantes.index');

require __DIR__.'/settings.php';
require __DIR__.'/matriculas.php';
require __DIR__.'/cursos.php';
