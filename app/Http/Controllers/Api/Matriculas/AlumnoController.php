<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAlumnoRequest;
use App\Http\Resources\Matriculas\AlumnoResource;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\AlumnoRegistroService;
use Illuminate\Http\JsonResponse;

class AlumnoController extends Controller
{
    public function __construct(
        private readonly AlumnoRegistroService $alumnoRegistroService,
    ) {}

    public function store(StoreAlumnoRequest $request): JsonResponse
    {
        $alumno = $this->alumnoRegistroService->registrar($request->validated());

        return ApiResponse::success(
            new AlumnoResource($alumno),
            'Alumno registrado correctamente.',
            201,
        );
    }
}
