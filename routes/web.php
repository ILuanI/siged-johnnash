<?php

use App\Http\Controllers\Bi\DashboardBiController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified', 'permiso'])->group(function () {
    Route::get('dashboard', [DashboardBiController::class, 'index'])->name('dashboard');
    Route::resource('docentes', DocenteController::class)->except(['create', 'show', 'edit']);
    Route::resource('usuarios', UserController::class)
        ->except(['create', 'show', 'edit'])
        ->parameters(['usuarios' => 'user']);
    Route::resource('roles', RolController::class)
        ->except(['create', 'show', 'edit'])
        ->parameters(['roles' => 'rol']);
});

require __DIR__.'/settings.php';
require __DIR__.'/matriculas.php';
require __DIR__.'/cursos.php';
require __DIR__.'/asistencias.php';
require __DIR__.'/notas.php';
require __DIR__.'/reportes.php';
require __DIR__.'/ia.php';
require __DIR__.'/tesoreria.php';
