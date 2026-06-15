<?php

use App\Http\Controllers\Bi\DashboardBiController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\Matriculas\EstudianteWebController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardBiController::class, 'index'])->name('dashboard');
    Route::resource('docentes', DocenteController::class)->except(['create', 'show', 'edit']);
});

Route::get('/matriculas/estudiantes', [EstudianteWebController::class, 'index'])->name('matriculas.estudiantes.index');

require __DIR__.'/settings.php';
require __DIR__.'/matriculas.php';
require __DIR__.'/cursos.php';
require __DIR__.'/notas.php';
require __DIR__.'/reportes.php';
