<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\ConsultaPortalPadresRequest;
use App\Services\PublicPortal\PortalPadresConsultaService;
use Inertia\Inertia;
use Inertia\Response;

class PortalPadresController extends Controller
{
    public function __construct(
        private readonly PortalPadresConsultaService $portalPadresConsultaService,
    ) {}

    public function index(ConsultaPortalPadresRequest $request): Response
    {
        $dni = $request->string('dni')->trim()->toString();
        $consulta = $this->portalPadresConsultaService->consultar($dni !== '' ? $dni : null);

        return Inertia::render('PortalPadres', [
            ...$consulta,
            'filters' => ['dni' => $dni],
        ]);
    }
}
