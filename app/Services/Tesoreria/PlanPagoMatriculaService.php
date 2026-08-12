<?php

namespace App\Services\Tesoreria;

use App\Enums\CategoriaIngreso;
use App\Enums\ConceptoPago;
use App\Enums\EstadoCuota;
use App\Models\ComprobantePago;
use App\Models\Matricula;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class PlanPagoMatriculaService
{
    /**
     * Genera un comprobante con sus cuotas. Cuando $matricula es null se
     * genera un ingreso general (sin alumno), con $id_matricula = null.
     *
     * $categoria puede ser un valor del enum CategoriaIngreso o una categoría
     * dinámica creada en el mantenedor `categoria_financiera`.
     */
    public function generar(?Matricula $matricula, ConceptoPago $concepto, float $costo, int $numCuotas, ?string $fechaPrimeraCuota = null, ?int $diasEntreCuotas = null, ?string $descripcion = null, ?string $categoria = null): ComprobantePago
    {
        return DB::transaction(function () use ($matricula, $concepto, $costo, $numCuotas, $fechaPrimeraCuota, $diasEntreCuotas, $descripcion, $categoria): ComprobantePago {
            // La idempotencia solo aplica a comprobantes vinculados a una
            // matrícula; cada ingreso general es un comprobante nuevo.
            $existing = null;

            if ($matricula) {
                $existing = ComprobantePago::query()
                    ->where('id_matricula', $matricula->id_matricula)
                    ->where('concepto', $concepto)
                    ->first();
            }

            if ($existing) {
                return $existing;
            }

            $costoTotal = $this->normalizarMonto($costo);
            $fechaMatricula = CarbonImmutable::parse($matricula?->fecha_matricula ?? now());

            $comprobante = ComprobantePago::query()->create([
                'id_matricula' => $matricula?->id_matricula,
                'numero' => $this->generarNumeroComprobante($matricula, $concepto),
                'tipo' => 'RECIBO',
                'concepto' => $concepto,
                'categoria' => $categoria ?? $this->categoriaPorDefecto($concepto),
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

    private function categoriaPorDefecto(ConceptoPago $concepto): string
    {
        return match ($concepto) {
            ConceptoPago::Matricula => CategoriaIngreso::Academico->value,
            ConceptoPago::Simulacro => CategoriaIngreso::Eventos->value,
            ConceptoPago::Carnet => CategoriaIngreso::Servicios->value,
            ConceptoPago::Extraordinario => CategoriaIngreso::Administrativo->value,
        };
    }

    private function generarNumeroComprobante(?Matricula $matricula, ConceptoPago $concepto): string
    {
        $prefijo = match ($concepto) {
            ConceptoPago::Matricula => 'MAT',
            ConceptoPago::Simulacro => 'SIM',
            ConceptoPago::Carnet => 'CAR',
            ConceptoPago::Extraordinario => 'EXT',
        };

        if (! $matricula) {
            $count = ComprobantePago::query()
                ->whereNull('id_matricula')
                ->where('concepto', $concepto)
                ->count();

            return $prefijo.'-GEN-'.str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
        }

        $count = ComprobantePago::query()
            ->where('id_matricula', $matricula->id_matricula)
            ->where('concepto', $concepto)
            ->count();

        return $prefijo.'-'.str_pad((string) $matricula->id_matricula, 4, '0', STR_PAD_LEFT)
            .'-'.str_pad((string) ($count + 1), 2, '0', STR_PAD_LEFT);
    }
}
