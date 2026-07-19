<?php

namespace App\Services\Bi;

use App\Enums\EstadoAlumno;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Carrera;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;

class AreaMetricsService
{
    /**
     * @return Collection<int, array{id_area: int, codigo: string, nombre: string, total_alumnos_activos: int}>
     */
    public function alumnosActivosPorArea(): Collection
    {
        $areaTable = (new Area)->getTable();
        $carreraTable = (new Carrera)->getTable();
        $alumnoTable = (new Alumno)->getTable();

        return Area::query()
            ->leftJoin($carreraTable, "{$areaTable}.id_area", '=', "{$carreraTable}.id_area")
            ->leftJoin($alumnoTable, function (JoinClause $join) use ($alumnoTable, $carreraTable): void {
                $join->on("{$carreraTable}.id_carrera", '=', "{$alumnoTable}.id_carrera")
                    ->whereIn("{$alumnoTable}.estado", [
                        EstadoAlumno::Activo->value,
                        EstadoAlumno::Matriculado->value,
                    ]);
            })
            ->select([
                "{$areaTable}.id_area",
                "{$areaTable}.codigo",
                "{$areaTable}.nombre",
            ])
            ->selectRaw("COUNT({$alumnoTable}.id_alumno) as total_alumnos_activos")
            ->groupBy("{$areaTable}.id_area", "{$areaTable}.codigo", "{$areaTable}.nombre")
            ->orderBy("{$areaTable}.codigo")
            ->get()
            ->map(fn (Area $area): array => [
                'id_area' => (int) $area->id_area,
                'codigo' => (string) $area->codigo,
                'nombre' => (string) $area->nombre,
                'total_alumnos_activos' => (int) $area->total_alumnos_activos,
            ]);
    }
}
