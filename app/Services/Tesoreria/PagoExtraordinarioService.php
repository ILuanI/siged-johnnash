<?php

namespace App\Services\Tesoreria;

use App\Enums\ConceptoPago;
use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use App\Models\Matricula;
use App\Models\Pago;
use Illuminate\Support\Facades\DB;

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
     *
     * El pago extraordinario se cobra al momento: además del comprobante y sus
     * cuotas, se generan los `Pago` correspondientes (fecha actual, método de
     * pago y usuario autenticado), marcando las cuotas como `PAGADA` y dejando
     * el `saldo_pendiente` del comprobante en `0.00`.
     */
    public function registrar(?Matricula $matricula, float $monto, string $descripcion, int $numCuotas = 1, ?string $fechaPrimeraCuota = null, ?int $diasEntreCuotas = null, ?string $categoria = null, ?string $metodoPago = null, ?int $userId = null): ComprobantePago
    {
        $comprobante = $this->planPagoService->generar(
            matricula: $matricula,
            concepto: ConceptoPago::Extraordinario,
            costo: $monto,
            numCuotas: $numCuotas,
            fechaPrimeraCuota: $fechaPrimeraCuota,
            diasEntreCuotas: $diasEntreCuotas,
            descripcion: $descripcion,
            categoria: $categoria,
        );

        // Solo se generan los pagos para el comprobante recién creado. La
        // idempotencia de `generar()` (comprobante ya existente para la misma
        // matrícula y concepto) no debe duplicar pagos.
        if ($comprobante->wasRecentlyCreated) {
            $this->registrarPagosCompletos(
                comprobante: $comprobante,
                metodoPago: $metodoPago ?? 'EFECTIVO',
                userId: $userId,
            );
        }

        return $comprobante;
    }

    /**
     * Crea un `Pago` por cada cuota del comprobante, marca las cuotas como
     * `PAGADA` y deja el `saldo_pendiente` del comprobante en `0.00`.
     */
    private function registrarPagosCompletos(ComprobantePago $comprobante, string $metodoPago, ?int $userId): void
    {
        DB::transaction(function () use ($comprobante, $metodoPago, $userId): void {
            foreach ($comprobante->cuotas as $cuota) {
                Pago::create([
                    'id_cuota' => $cuota->id_cuota,
                    'monto' => $cuota->monto,
                    'fecha_pago' => now()->toDateTimeString(),
                    'metodo_pago' => $metodoPago,
                    'user_id' => $userId,
                    'estado' => 'PAGADO',
                ]);

                $cuota->update(['estado' => EstadoCuota::Pagada]);
            }

            $comprobante->update(['saldo_pendiente' => '0.00']);
        });
    }
}
