<?php

use App\Http\Controllers\Ia\DesercionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('ia')
    ->name('ia.')
    ->group(function (): void {
        Route::get('desercion', [DesercionController::class, 'index'])
            ->name('desercion.index');
    });
