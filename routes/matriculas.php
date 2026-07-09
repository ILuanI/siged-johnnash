<?php

use App\Http\Controllers\Matriculas\CatalogoAcademicoController;
use App\Http\Controllers\Matriculas\EstudianteWebController;
use App\Http\Controllers\Matriculas\MatriculaWebController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('matriculas')
    ->name('matriculas.')
    ->group(function (): void {
        Route::get('estudiantes', [EstudianteWebController::class, 'index'])
            ->name('estudiantes.index');

        Route::get('estudiantes/{alumno}/pdf', [EstudianteWebController::class, 'downloadPdf'])
            ->name('estudiantes.pdf');

        Route::get('estudiantes/nuevo', [EstudianteWebController::class, 'create'])
            ->name('estudiantes.create');

        Route::post('estudiantes', [EstudianteWebController::class, 'store'])
            ->name('estudiantes.store');

        Route::patch('estudiantes/{alumno}/carrera', [EstudianteWebController::class, 'updateCarrera'])
            ->name('estudiantes.carrera.update');

        Route::get('catalogo', [CatalogoAcademicoController::class, 'index'])
            ->name('catalogo.index');

        Route::post('areas', [CatalogoAcademicoController::class, 'storeArea'])
            ->name('areas.store');

        Route::patch('areas/{area}', [CatalogoAcademicoController::class, 'updateArea'])
            ->name('areas.update');

        Route::post('carreras', [CatalogoAcademicoController::class, 'storeCarrera'])
            ->name('carreras.store');

        Route::patch('carreras/{carrera}', [CatalogoAcademicoController::class, 'updateCarrera'])
            ->name('carreras.update');

        Route::post('cursos', [CatalogoAcademicoController::class, 'storeCurso'])
            ->name('cursos.store');

        Route::patch('cursos/{curso}', [CatalogoAcademicoController::class, 'updateCurso'])
            ->name('cursos.update');

        Route::get('nueva', [MatriculaWebController::class, 'create'])
            ->name('nueva');

        Route::post('nueva', [MatriculaWebController::class, 'store'])
            ->name('store');
    });
