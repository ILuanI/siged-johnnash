<?php

namespace App\Http\Controllers\Api\Matriculas;

use App\Http\Controllers\Controller;
use App\Http\Requests\Matriculas\StoreAlumnoRequest;
use App\Http\Resources\Matriculas\AlumnoResource;
use App\Http\Responses\ApiResponse;
use App\Services\Matriculas\AlumnoRegistroService;
use App\Services\Matriculas\ConsolidadoAlumnoService;
use Illuminate\Http\JsonResponse;

class AlumnoController extends Controller
{
    public function __construct(
        private readonly AlumnoRegistroService $alumnoRegistroService,
        private readonly ConsolidadoAlumnoService $consolidadoAlumnoService,
    ) {}

    public function store(StoreAlumnoRequest $request): JsonResponse
    {
        $alumno = $this->alumnoRegistroService->registrar($request->validated());

        return ApiResponse::success(
            AlumnoResource::make($alumno)->resolve(),
            'Estudiante registrado correctamente.',
            201,
        );
    }

    public function consolidado(int $alumno): JsonResponse
    {
        return ApiResponse::success(
            $this->consolidadoAlumnoService->obtener($alumno),
        );
    }
}
