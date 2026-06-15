<?php

namespace App\Http\Controllers\Asistencias;

use App\Http\Controllers\Controller;
use App\Http\Requests\Asistencias\StoreLectorAsistenciaRequest;
use App\Services\Asistencias\AsistenciaBarcodeService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LectorAsistenciaController extends Controller
{
    public function __construct(
        private readonly AsistenciaBarcodeService $asistenciaBarcodeService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('asistencias/lector');
    }

    public function store(StoreLectorAsistenciaRequest $request): RedirectResponse
    {
        $resultado = $this->asistenciaBarcodeService->registrar($request->validated());

        return redirect()
            ->back()
            ->with($resultado['registrada'] ? 'success' : 'info', $resultado['mensaje']);
    }
}
