<?php

namespace App\Services\Tesoreria;

use App\Enums\ConceptoPago;
use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Matricula;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class PlanPagoMatriculaService
{
    public function generar(Matricula $matricula, ConceptoPago $concepto, float $costo, int $numCuotas, ?string $fechaPrimeraCuota = null, ?int $diasEntreCuotas = null, ?string $descripcion = null): ComprobantePago
    {
        return DB::transaction(function () use ($matricula, $concepto, $costo, $numCuotas, $fechaPrimeraCuota, $diasEntreCuotas, $descripcion): ComprobantePago {
            $existing = ComprobantePago::query()
                ->where('id_matricula', $matricula->id_matricula)
                ->where('concepto', $concepto)
                ->first();

            if ($existing) {
                return $existing;
            }

            $costoTotal = $this->normalizarMonto($costo);
            $fechaMatricula = CarbonImmutable::parse($matricula->fecha_matricula ?? now());

            $comprobante = ComprobantePago::query()->create([
                'id_matricula' => $matricula->id_matricula,
                'numero' => $this->generarNumeroComprobante($matricula, $concepto),
                'tipo' => 'RECIBO',
                'concepto' => $concepto,
                'descripcion' => $descripcion,
                'fecha_emision' => $fechaMatricula->toDateString(),
                'costo_total' => $costoTotal,
                'saldo_pendiente' => $costoTotal,
            ]);

            $fechaPrimera = CarbonImmutable::parse($fechaPrimeraCuota ?? $fechaMatricula);
            $diasEntre = max(1, $diasEntreCuotas ?? 30);
            $montos = $this->dividirMonto($costoTotal, $numCuotas);

            foreach ($montos as $indice => $monto) {
                $comprobante->cuotas()->create([
                    'numero_cuota' => $indice + 1,
                    'monto' => $monto,
                    'fecha_vencimiento' => $fechaPrimera->addDays($diasEntre * $indice)->toDateString(),
                    'estado' => EstadoCuota::Pendiente,
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

    private function generarNumeroComprobante(Matricula $matricula, ConceptoPago $concepto): string
    {
        $prefijo = match ($concepto) {
            ConceptoPago::Matricula => 'MAT',
            ConceptoPago::Simulacro => 'SIM',
            ConceptoPago::Carnet => 'CAR',
            ConceptoPago::Extraordinario => 'EXT',
        };

        $count = ComprobantePago::query()
            ->where('id_matricula', $matricula->id_matricula)
            ->where('concepto', $concepto)
            ->count();

        return $prefijo.'-'.str_pad((string) $matricula->id_matricula, 4, '0', STR_PAD_LEFT)
            .'-'.str_pad((string) ($count + 1), 2, '0', STR_PAD_LEFT);
    }
}
