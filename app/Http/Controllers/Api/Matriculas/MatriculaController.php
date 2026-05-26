<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreMatriculaRequest;
use App\Http\Resources\Matriculas\MatriculaResource;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\MatriculaFormalizacionService;
use Illuminate\Http\JsonResponse;
use Throwable;

class MatriculaController extends Controller
{
    public function __construct(
        private readonly MatriculaFormalizacionService $matriculaFormalizacionService,
    ) {}

    public function store(StoreMatriculaRequest $request): JsonResponse
    {
        try {
            $matricula = $this->matriculaFormalizacionService->formalizar($request->validated());

            return ApiResponse::success(
                new MatriculaResource($matricula),
                'Matrícula formalizada correctamente. El alumno quedó en estado MATRICULADO.',
                201,
            );
        } catch (BusinessRuleException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->statusCode);
        } catch (Throwable) {
            return ApiResponse::error('No se pudo formalizar la matrícula.', 500);
        }
    }
}
