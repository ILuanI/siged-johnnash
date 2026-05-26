<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\ConsolidadoAlumnoService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Throwable;

class ConsolidadoAlumnoController extends Controller
{
    public function __construct(
        private readonly ConsolidadoAlumnoService $consolidadoAlumnoService,
    ) {}

    public function __invoke(int $id): JsonResponse
    {
        try {
            $consolidado = $this->consolidadoAlumnoService->obtener($id);

            return ApiResponse::success(
                $consolidado,
                'Consolidado del alumno obtenido correctamente.',
            );
        } catch (ModelNotFoundException) {
            return ApiResponse::error('El alumno solicitado no existe.', 404);
        } catch (Throwable) {
            return ApiResponse::error('No se pudo obtener el consolidado del alumno.', 500);
        }
    }
}
