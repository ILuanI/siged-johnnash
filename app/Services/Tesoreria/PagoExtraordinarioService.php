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

    /**
     * Registra un pago extraordinario. Cuando $matricula es null se genera un
     * ingreso general (sin alumno), con $id_matricula = null.
     *
     * $categoria puede ser un valor del enum CategoriaIngreso o una categoría
     * dinámica creada en el mantenedor `categoria_financiera`.
     */
    public function registrar(?Matricula $matricula, float $monto, string $descripcion, int $numCuotas = 1, ?string $fechaPrimeraCuota = null, ?int $diasEntreCuotas = null, ?string $categoria = null): ComprobantePago
    {
        return $this->planPagoService->generar(
            matricula: $matricula,
            concepto: ConceptoPago::Extraordinario,
            costo: $monto,
            numCuotas: $numCuotas,
            fechaPrimeraCuota: $fechaPrimeraCuota,
            diasEntreCuotas: $diasEntreCuotas,
            descripcion: $descripcion,
            categoria: $categoria,
        );
    }
}
