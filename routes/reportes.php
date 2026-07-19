<?php

use App\Http\Controllers\Bi\ReportesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])->group(function () {
    Route::get('/reportes', [ReportesController::class, 'index'])->name('reportes.index');
    Route::get('/reportes/exportar', [ReportesController::class, 'export'])->name('reportes.export');
    Route::get('/reportes/pdf', [ReportesController::class, 'exportPdf'])->name('reportes.pdf');
});
