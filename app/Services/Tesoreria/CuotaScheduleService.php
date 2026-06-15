<?php

namespace App\Services\Tesoreria;

use App\Models\ComprobantePago;
use App\Models\Cuota;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class CuotaScheduleService
{
    public function aplazar(Cuota $cuota, int $dias): Cuota
    {
        return DB::transaction(function () use ($cuota, $dias): Cuota {
            $nuevaFecha = CarbonImmutable::parse($cuota->fecha_vencimiento)->addDays(max(1, $dias));

            $cuota->update([
                'fecha_vencimiento' => $nuevaFecha->toDateString(),
                'estado' => $cuota->estado === \App\Enums\EstadoCuota::Vencida ? \App\Enums\EstadoCuota::Pendiente : $cuota->estado,
            ]);

            return $cuota->refresh();
        });
    }

    public function recalcular(ComprobantePago $comprobante, CarbonInterface|string $fechaPrimeraCuota, int $diasEntreCuotas = 30): ComprobantePago
    {
        return DB::transaction(function () use ($comprobante, $fechaPrimeraCuota, $diasEntreCuotas): ComprobantePago {
            $fechaBase = CarbonImmutable::parse($fechaPrimeraCuota);
            $dias = max(1, $diasEntreCuotas);
            $cuotasPendientes = $comprobante->cuotas()
                ->where('estado', '!=', \App\Enums\EstadoCuota::Pagada)
                ->orderBy('numero_cuota')
                ->get();

            foreach ($cuotasPendientes as $indice => $cuota) {
                $cuota->update([
                    'fecha_vencimiento' => $fechaBase->addDays($dias * $indice)->toDateString(),
                    'estado' => \App\Enums\EstadoCuota::Pendiente,
                ]);
            }

            return $comprobante->refresh()->load('cuotas');
        });
    }

    public function sincronizarVencidas(?ComprobantePago $comprobante = null): int
    {
        $query = Cuota::query()
            ->where('estado', \App\Enums\EstadoCuota::Pendiente)
            ->whereDate('fecha_vencimiento', '<', now()->toDateString());

        if ($comprobante) {
            $query->where('id_comprobante', $comprobante->id_comprobante);
        }

        return $query->update(['estado' => \App\Enums\EstadoCuota::Vencida]);
    }
}
