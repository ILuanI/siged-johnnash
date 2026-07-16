<?php

use App\Http\Controllers\Tesoreria\EstadoCuentaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])->prefix('tesoreria')->name('tesoreria.')->group(function () {
    Route::get('estado-cuenta', [EstadoCuentaController::class, 'index'])->name('estado-cuenta.index');
    Route::get('estado-cuenta/{alumno}', [EstadoCuentaController::class, 'show'])->name('estado-cuenta.show');
    Route::post('cuotas/{cuota}/prorrogar', [EstadoCuentaController::class, 'prorrogar'])->name('cuotas.prorrogar');
    Route::post('cuotas/{cuota}/pagar', [EstadoCuentaController::class, 'pagar'])->name('cuotas.pagar');
    Route::put('whatsapp-templates', [EstadoCuentaController::class, 'updateWhatsappTemplates'])->name('whatsapp-templates.update');
});
