<?php

namespace App\Http\Controllers\Ia;

use App\Http\Controllers\Controller;
use App\Services\Ia\DesercionRiskService;
use Inertia\Inertia;
use Inertia\Response;

class DesercionController extends Controller
{
    public function index(DesercionRiskService $desercionRiskService): Response
    {
        $procesados = $desercionRiskService->recalcularTodos();

        return Inertia::render('ia/desercion', [
            'resumen' => $desercionRiskService->resumen(),
            'distribucion' => $desercionRiskService->distribucion(),
            'prioritarios' => $desercionRiskService->prioritarios(),
            'procesados' => $procesados,
        ]);
    }
}
