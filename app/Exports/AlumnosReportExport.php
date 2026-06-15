<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AlumnosReportExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    /**
     * @param  Collection  $collection
     */
    public function __construct(protected $collection) {}

    /**
     * @return Collection
     */
    public function collection()
    {
        return $this->collection;
    }

    public function headings(): array
    {
        return [
            'Código',
            'DNI',
            'Apellidos',
            'Nombres',
            'Carrera',
            'Área',
            'Turno',
            'Asistencias',
            'Tardanzas',
            'Faltas',
            'Tasa de Asistencia (%)',
            'Promedio de Notas',
        ];
    }

    /**
     * @param  mixed  $row
     */
    public function map($row): array
    {
        return [
            $row['codigo'],
            $row['dni'],
            $row['apellidos'],
            $row['nombres'],
            $row['carrera'],
            $row['area'],
            $row['turno'],
            $row['total_asistencias'],
            $row['total_tardanzas'],
            $row['total_faltas'],
            $row['tasa_asistencia'] !== null ? number_format($row['tasa_asistencia'], 2).'%' : 'N/A',
            $row['promedio_notas'] !== null ? number_format($row['promedio_notas'], 3) : 'N/A',
        ];
    }
}
