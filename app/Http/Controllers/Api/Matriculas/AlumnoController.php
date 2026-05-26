<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAlumnoRequest;
use App\Http\Resources\Matriculas\AlumnoResource;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\AlumnoRegistroService;
use Illuminate\Http\JsonResponse;
use Throwable;

class AlumnoController extends Controller
{
    public function __construct(
        private readonly AlumnoRegistroService $alumnoRegistroService,
    ) {}

    public function store(StoreAlumnoRequest $request): JsonResponse
    {
        try {
            $alumno = $this->alumnoRegistroService->registrar($request->validated());

            return ApiResponse::success(
                new AlumnoResource($alumno),
                'Alumno registrado correctamente.',
                201,
            );
        } catch (BusinessRuleException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->statusCode);
        } catch (Throwable) {
            return ApiResponse::error('No se pudo registrar al alumno.', 500);
        }
    }
}
