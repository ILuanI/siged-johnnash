<?php

namespace App\Services\Tesoreria;

use App\Enums\ConceptoPago;
use App\Models\ComprobantePago;
use App\Models\Matricula;

class PagoExtraordinarioService
{
    public function __construct(
        private readonly PlanPagoMatriculaService $planPagoService,
    ) {}

    public function registrar(Matricula $matricula, float $monto, string $descripcion, int $numCuotas = 1, ?string $fechaPrimeraCuota = null, ?int $diasEntreCuotas = null): ComprobantePago
    {
        return $this->planPagoService->generar(
            matricula: $matricula,
            concepto: ConceptoPago::Extraordinario,
            costo: $monto,
            numCuotas: $numCuotas,
            fechaPrimeraCuota: $fechaPrimeraCuota,
            diasEntreCuotas: $diasEntreCuotas,
            descripcion: $descripcion,
        );
    }
}
