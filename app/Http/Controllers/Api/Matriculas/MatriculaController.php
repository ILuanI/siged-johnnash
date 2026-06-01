<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreMatriculaRequest;
use App\Http\Resources\Matriculas\MatriculaResource;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\MatriculaFormalizacionService;
use Illuminate\Http\JsonResponse;

class MatriculaController extends Controller
{
    public function __construct(
        private readonly MatriculaFormalizacionService $matriculaFormalizacionService,
    ) {}

    public function store(StoreMatriculaRequest $request): JsonResponse
    {
        $matricula = $this->matriculaFormalizacionService->formalizar($request->validated());

        return ApiResponse::success(
            new MatriculaResource($matricula),
            'Matrícula formalizada correctamente. El alumno quedó en estado MATRICULADO.',
            201,
        );
    }
}
