<?php

use App\Http\Controllers\Tesoreria\EgresoController;
use App\Http\Controllers\Tesoreria\EstadoCuentaController;
use App\Http\Controllers\Tesoreria\PagoExtraordinarioController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])->prefix('tesoreria')->name('tesoreria.')->group(function () {
    Route::get('caja', [EstadoCuentaController::class, 'caja'])->name('caja.index');
    Route::get('estado-cuenta', [EstadoCuentaController::class, 'index'])->name('estado-cuenta.index');
    Route::get('estado-cuenta/{alumno}', [EstadoCuentaController::class, 'show'])->name('estado-cuenta.show');
    Route::post('cuotas/{cuota}/prorrogar', [EstadoCuentaController::class, 'prorrogar'])->name('cuotas.prorrogar');
    Route::post('cuotas/{cuota}/pagar', [EstadoCuentaController::class, 'pagar'])->name('cuotas.pagar');
    Route::put('cuotas/{cuota}', [EstadoCuentaController::class, 'updateCuota'])->name('cuotas.update');
    Route::put('comprobantes/{comprobante}', [EstadoCuentaController::class, 'updateComprobante'])->name('comprobantes.update');
    Route::post('cuotas/pagar-comprobante', [EstadoCuentaController::class, 'pagarComprobante'])->name('cuotas.pagar-comprobante');
    Route::put('whatsapp-templates', [EstadoCuentaController::class, 'updateWhatsappTemplates'])->name('whatsapp-templates.update');

    Route::get('pago-extraordinario/nuevo', [PagoExtraordinarioController::class, 'create'])->name('pago-extraordinario.create');
    Route::post('pago-extraordinario', [PagoExtraordinarioController::class, 'store'])->name('pago-extraordinario.store');

    Route::post('egresos', [EgresoController::class, 'store'])->name('egresos.store');
    Route::put('egresos/{egreso}', [EgresoController::class, 'update'])->name('egresos.update');
    Route::delete('egresos/{egreso}', [EgresoController::class, 'destroy'])->name('egresos.destroy');
});
