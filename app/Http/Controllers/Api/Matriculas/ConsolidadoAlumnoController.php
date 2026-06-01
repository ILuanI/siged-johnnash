<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\ConsolidadoAlumnoService;
use Illuminate\Http\JsonResponse;

class ConsolidadoAlumnoController extends Controller
{
    public function __construct(
        private readonly ConsolidadoAlumnoService $consolidadoAlumnoService,
    ) {}

    public function __invoke(int $id): JsonResponse
    {
        return ApiResponse::success(
            $this->consolidadoAlumnoService->obtener($id),
            'Consolidado del alumno obtenido correctamente.',
        );
    }
}
