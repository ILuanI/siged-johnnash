<?php

namespace App\Services\Tesoreria;

use App\Enums\TipoPagoMatricula;
use App\Models\ComprobantePago;
use App\Models\Matricula;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class PlanPagoMatriculaService
{
    /**
     * @param  array<string, mixed>  $datos
     */
    public function generar(Matricula $matricula, array $datos = []): ComprobantePago
    {
        return DB::transaction(function () use ($matricula, $datos): ComprobantePago {
            $matricula->loadMissing('comprobantePago');

            if ($matricula->comprobantePago) {
                return $matricula->comprobantePago;
            }

            $costoTotal = $this->normalizarMonto($matricula->costo_total);
            $fechaMatricula = CarbonImmutable::parse($matricula->fecha_matricula ?? now());

            $comprobante = ComprobantePago::query()->create([
                'id_matricula' => $matricula->id_matricula,
                'numero' => $datos['numero_comprobante'] ?? $this->generarNumeroComprobante($matricula),
                'tipo' => $datos['tipo_comprobante'] ?? 'RECIBO',
                'fecha_emision' => $datos['fecha_emision'] ?? $fechaMatricula->toDateString(),
                'costo_total' => $costoTotal,
                'saldo_pendiente' => $costoTotal,
            ]);

            $tipoPago = $matricula->tipo_pago instanceof TipoPagoMatricula
                ? $matricula->tipo_pago
                : TipoPagoMatricula::from((string) $matricula->tipo_pago);

            $numeroCuotas = $tipoPago === TipoPagoMatricula::Credito
                ? max(2, (int) ($datos['numero_cuotas'] ?? 2))
                : 1;

            $fechaPrimeraCuota = CarbonImmutable::parse($datos['fecha_primera_cuota'] ?? $fechaMatricula);
            $diasEntreCuotas = max(1, (int) ($datos['dias_entre_cuotas'] ?? 30));
            $montos = $this->dividirMonto($costoTotal, $numeroCuotas);

            foreach ($montos as $indice => $monto) {
                $comprobante->cuotas()->create([
                    'numero_cuota' => $indice + 1,
                    'monto' => $monto,
                    'fecha_vencimiento' => $fechaPrimeraCuota->addDays($diasEntreCuotas * $indice)->toDateString(),
                    'estado' => 'PENDIENTE',
                ]);
            }

            return $comprobante->load('cuotas');
        });
    }

    /**
     * @return array<int, string>
     */
    private function dividirMonto(string $monto, int $numeroCuotas): array
    {
        $centavos = (int) round(((float) $monto) * 100);
        $base = intdiv($centavos, $numeroCuotas);
        $restante = $centavos - ($base * $numeroCuotas);
        $montos = [];

        for ($indice = 0; $indice < $numeroCuotas; $indice++) {
            $cuotaCentavos = $base + ($indice === $numeroCuotas - 1 ? $restante : 0);
            $montos[] = number_format($cuotaCentavos / 100, 2, '.', '');
        }

        return $montos;
    }

    private function normalizarMonto(mixed $monto): string
    {
        return number_format((float) $monto, 2, '.', '');
    }

    private function generarNumeroComprobante(Matricula $matricula): string
    {
        return 'M'.str_pad((string) $matricula->id_matricula, 8, '0', STR_PAD_LEFT);
    }
}
