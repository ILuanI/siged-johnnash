<?php

namespace Database\Seeders;

use App\Enums\TipoCategoriaFinanciera;
use App\Models\CategoriaFinanciera;
use Illuminate\Database\Seeder;

class CategoriaFinancieraSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            TipoCategoriaFinanciera::Ingreso->value => [
                'ACADEMICO' => ['es_por_defecto' => true, 'descripcion' => 'Matrículas y actividades académicas'],
                'SERVICIOS' => ['es_por_defecto' => false, 'descripcion' => 'Venta de servicios (carnets, certificados)'],
                'EVENTOS' => ['es_por_defecto' => false, 'descripcion' => 'Simulacros y eventos'],
                'ADMINISTRATIVO' => ['es_por_defecto' => false, 'descripcion' => 'Trámites y cobros extraordinarios'],
                'OTROS' => ['es_por_defecto' => false, 'descripcion' => 'Otros ingresos no clasificados'],
            ],
            TipoCategoriaFinanciera::Egreso->value => [
                'OPERATIVO' => ['es_por_defecto' => true, 'descripcion' => 'Gastos operativos del día a día'],
                'ADMINISTRATIVO' => ['es_por_defecto' => false, 'descripcion' => 'Gastos administrativos'],
                'MANTENIMIENTO' => ['es_por_defecto' => false, 'descripcion' => 'Mantenimiento del local e instalaciones'],
                'SERVICIOS' => ['es_por_defecto' => false, 'descripcion' => 'Pago de servicios y terceros'],
                'ACADEMICO' => ['es_por_defecto' => false, 'descripcion' => 'Gastos académicos'],
                'OTROS' => ['es_por_defecto' => false, 'descripcion' => 'Otros egresos no clasificados'],
            ],
        ];

        foreach ($categorias as $tipo => $items) {
            foreach ($items as $nombre => $datos) {
                CategoriaFinanciera::query()->updateOrCreate(
                    ['nombre' => $nombre, 'tipo' => $tipo],
                    [
                        'es_por_defecto' => $datos['es_por_defecto'],
                        'descripcion' => $datos['descripcion'],
                    ],
                );
            }
        }
    }
}
