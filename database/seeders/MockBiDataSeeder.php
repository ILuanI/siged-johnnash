<?php

namespace Database\Seeders;

use App\Models\Alumno;
use App\Models\Apoderado;
use App\Models\Area;
use App\Models\AsignacionDocente;
use App\Models\Asistencia;
use App\Models\Aula;
use App\Models\Carrera;
use App\Models\Ciclo;
use App\Models\ComprobantePago;
use App\Models\Cuota;
use App\Models\Curso;
use App\Models\Docente;
use App\Models\Examen;
use App\Models\ExamenMetrica;
use App\Models\Matricula;
use App\Models\Pago;
use App\Models\PeriodoAcademico;
use App\Models\ResultadoExamen;
use App\Models\Turno;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MockBiDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure areas exist
        $areaA = Area::firstOrCreate(['codigo' => 'A'], ['nombre' => 'Ciencias / Medicina']);
        $areaB = Area::firstOrCreate(['codigo' => 'B'], ['nombre' => 'Ingenierías / Ciencias Exactas']);
        $areaC = Area::firstOrCreate(['codigo' => 'C'], ['nombre' => 'Letras / Humanidades']);

        // 2. Ensure careers exist
        $carrera1 = Carrera::firstOrCreate(['nombre' => 'Medicina Humana'], ['id_area' => $areaA->id_area, 'puntaje_min' => 12.5, 'puntaje_max' => 19.8]);
        $carrera2 = Carrera::firstOrCreate(['nombre' => 'Ingeniería de Sistemas'], ['id_area' => $areaB->id_area, 'puntaje_min' => 11.2, 'puntaje_max' => 18.5]);
        $carrera3 = Carrera::firstOrCreate(['nombre' => 'Derecho y Ciencias Políticas'], ['id_area' => $areaC->id_area, 'puntaje_min' => 10.8, 'puntaje_max' => 17.9]);

        // 3. Ensure cycles exist
        $periodo = PeriodoAcademico::first() ?? PeriodoAcademico::create([
            'nombre' => 'Periodo Académico 2026-I',
            'anio' => 2026,
            'estado' => 'ABIERTO',
        ]);

        $ciclo = Ciclo::first() ?? Ciclo::create([
            'nombre' => 'Ciclo Regular 2026-I',
            'id_periodo' => $periodo->id_periodo,
            'tipo_ciclo' => 'Regular',
            'fecha_inicio' => Carbon::now()->subMonths(2)->toDateString(),
            'fecha_fin' => Carbon::now()->addMonths(2)->toDateString(),
            'costo_base' => 1500.00,
            'estado' => 'ABIERTO',
        ]);

        // 4. Ensure Turnos
        $turnoM = Turno::where('nombre', 'Mañana')->first() ?? Turno::create(['nombre' => 'Mañana']);
        $turnoT = Turno::where('nombre', 'Tarde')->first() ?? Turno::create(['nombre' => 'Tarde']);

        // 5. Ensure Aulas
        $aula101 = Aula::where('nombre', 'Aula 101')->first() ?? Aula::create(['nombre' => 'Aula 101', 'capacidad' => 35]);
        $aula102 = Aula::where('nombre', 'Aula 102')->first() ?? Aula::create(['nombre' => 'Aula 102', 'capacidad' => 30]);

        // 6. Ensure Docente & Curso & Asignación (for assistance logging)
        $docente = Docente::first() ?? Docente::create([
            'nombres' => 'John',
            'apellidos' => 'Nash',
            'dni' => '12345678',
            'correo' => 'john.nash@academia.edu',
            'estado' => 'ACTIVO',
        ]);

        $curso = Curso::first() ?? Curso::create([
            'nombre' => 'Razonamiento Matemático',
            'area_conoc' => 'Ciencias',
        ]);

        $asignacion = AsignacionDocente::first() ?? AsignacionDocente::create([
            'id_docente' => $docente->id_docente,
            'id_curso' => $curso->id_curso,
            'id_ciclo' => $ciclo->id_ciclo,
            'id_aula' => $aula101->id_aula,
        ]);

        // 7. Seed Alumnos & Apoderados & Matriculas & Cuotas & Pagos
        $studentsData = [
            [
                'codigo' => 'ALU-2026-00001',
                'nombres' => 'Joseph Luis',
                'apellidos' => 'Rodríguez Bermúdez',
                'dni' => '72717127',
                'carrera' => $carrera1,
                'turno' => $turnoM,
                'aula' => $aula101,
                'tipo_pago' => 'CREDITO',
                'costo' => 1400.00,
                'pagado_completo' => false,
                'tardanzas' => 4,
                'faltas' => 1,
                'asistencias' => 15,
                'simulacros' => [15.2, 16.5, 17.8], // scores in 3 mocks
            ],
            [
                'codigo' => 'ALU-2026-00002',
                'nombres' => 'María Fernanda',
                'apellidos' => 'Palacios Gonzales',
                'dni' => '71122334',
                'carrera' => $carrera1,
                'turno' => $turnoM,
                'aula' => $aula101,
                'tipo_pago' => 'CONTADO',
                'costo' => 1200.00,
                'pagado_completo' => true,
                'tardanzas' => 0,
                'faltas' => 0,
                'asistencias' => 20,
                'simulacros' => [18.5, 19.1, 19.5],
            ],
            [
                'codigo' => 'ALU-2026-00003',
                'nombres' => 'Carlos Alberto',
                'apellidos' => 'Soto Mayor',
                'dni' => '74455667',
                'carrera' => $carrera2,
                'turno' => $turnoT,
                'aula' => $aula102,
                'tipo_pago' => 'CREDITO',
                'costo' => 1500.00,
                'pagado_completo' => false,
                'tardanzas' => 1,
                'faltas' => 3,
                'asistencias' => 16,
                'simulacros' => [12.4, 13.8, 14.2],
            ],
            [
                'codigo' => 'ALU-2026-00004',
                'nombres' => 'Gabriela Sofía',
                'apellidos' => 'Quispe Vega',
                'dni' => '78899001',
                'carrera' => $carrera3,
                'turno' => $turnoT,
                'aula' => $aula102,
                'tipo_pago' => 'CONTADO',
                'costo' => 1300.00,
                'pagado_completo' => false, // unpaid contado
                'tardanzas' => 2,
                'faltas' => 2,
                'asistencias' => 16,
                'simulacros' => [14.5, 15.0, 16.2],
            ],
        ];

        foreach ($studentsData as $idx => $s) {
            $apoderado = Apoderado::create([
                'nombres' => "Apoderado de " . $s['nombres'],
                'dni' => '0887766' . $idx,
                'telefono' => '99988877' . $idx,
                'parentesco' => 'Padre/Madre',
                'correo' => 'apoderado' . $idx . '@example.com',
            ]);

            $alumno = Alumno::create([
                'codigo' => $s['codigo'],
                'nombres' => $s['nombres'],
                'apellidos' => $s['apellidos'],
                'dni' => $s['dni'],
                'fecha_nac' => '2008-04-12',
                'sexo' => 'M',
                'telefono' => '98765432' . $idx,
                'correo' => strtolower(str_replace(' ', '', $s['nombres'])) . '@example.com',
                'direccion' => 'Av. Universitaria 1234, Lima',
                'id_carrera' => $s['carrera']->id_carrera,
                'id_apoderado' => $apoderado->id_apoderado,
                'estado' => 'MATRICULADO',
            ]);

            $matricula = Matricula::create([
                'id_alumno' => $alumno->id_alumno,
                'id_ciclo' => $ciclo->id_ciclo,
                'id_periodo' => $periodo->id_periodo,
                'id_turno' => $s['turno']->id_turno,
                'id_aula' => $s['aula']->id_aula,
                'fecha_matricula' => Carbon::now()->subMonths(1)->toDateString(),
                'modalidad' => 'PRESENCIAL',
                'tipo_pago' => $s['tipo_pago'],
                'costo_total' => $s['costo'],
                'estado' => 'VIGENTE',
            ]);

            // Comprobante
            $saldo = $s['pagado_completo'] ? 0.0 : ($s['tipo_pago'] === 'CREDITO' ? $s['costo'] / 2 : $s['costo']);
            $comprobante = ComprobantePago::create([
                'id_matricula' => $matricula->id_matricula,
                'numero' => 'B001-0000' . $idx,
                'tipo' => 'BOLETA',
                'fecha_emision' => Carbon::now()->toDateString(),
                'costo_total' => $s['costo'],
                'saldo_pendiente' => $saldo,
            ]);

            if ($s['tipo_pago'] === 'CREDITO') {
                // 2 cuotas
                $cuota1 = Cuota::create([
                    'id_comprobante' => $comprobante->id_comprobante,
                    'numero_cuota' => 1,
                    'monto' => $s['costo'] / 2,
                    'fecha_venc' => Carbon::now()->subWeeks(2)->toDateString(),
                    'estado' => 'PAGADA',
                ]);
                Pago::create([
                    'id_cuota' => $cuota1->id_cuota,
                    'monto' => $s['costo'] / 2,
                    'metodo_pago' => 'TRANSFERENCIA',
                ]);

                // Cuota 2
                $cuota2Estado = $s['pagado_completo'] ? 'PAGADA' : 'PENDIENTE';
                $cuota2 = Cuota::create([
                    'id_comprobante' => $comprobante->id_comprobante,
                    'numero_cuota' => 2,
                    'monto' => $s['costo'] / 2,
                    'fecha_venc' => Carbon::now()->addWeeks(2)->toDateString(),
                    'estado' => $cuota2Estado,
                ]);
                if ($s['pagado_completo']) {
                    Pago::create([
                        'id_cuota' => $cuota2->id_cuota,
                        'monto' => $s['costo'] / 2,
                        'metodo_pago' => 'YAPE',
                    ]);
                }
            } else {
                // Contado
                $cuota = Cuota::create([
                    'id_comprobante' => $comprobante->id_comprobante,
                    'numero_cuota' => 1,
                    'monto' => $s['costo'],
                    'fecha_venc' => Carbon::now()->subWeeks(3)->toDateString(),
                    'estado' => $s['pagado_completo'] ? 'PAGADA' : 'PENDIENTE',
                ]);

                if ($s['pagado_completo']) {
                    Pago::create([
                        'id_cuota' => $cuota->id_cuota,
                        'monto' => $s['costo'],
                        'metodo_pago' => 'EFECTIVO',
                    ]);
                }
            }

            // Seed Attendance
            $fechaBase = Carbon::now()->subWeeks(3);
            for ($i = 0; $i < $s['asistencias']; $i++) {
                Asistencia::create([
                    'id_matricula' => $matricula->id_matricula,
                    'id_asignacion' => $asignacion->id_asignacion,
                    'fecha' => $fechaBase->copy()->addDays($i)->toDateString(),
                    'estado' => 'ASISTIO',
                ]);
            }
            for ($i = 0; $i < $s['tardanzas']; $i++) {
                Asistencia::create([
                    'id_matricula' => $matricula->id_matricula,
                    'id_asignacion' => $asignacion->id_asignacion,
                    'fecha' => $fechaBase->copy()->addDays($s['asistencias'] + $i)->toDateString(),
                    'estado' => 'TARDANZA',
                ]);
            }
            for ($i = 0; $i < $s['faltas']; $i++) {
                Asistencia::create([
                    'id_matricula' => $matricula->id_matricula,
                    'id_asignacion' => $asignacion->id_asignacion,
                    'fecha' => $fechaBase->copy()->addDays($s['asistencias'] + $s['tardanzas'] + $i)->toDateString(),
                    'estado' => 'FALTO',
                ]);
            }
        }

        // 8. Seed 3 Mock Exams
        for ($examNum = 1; $examNum <= 3; $examNum++) {
            $examen = Examen::create([
                'id_ciclo' => $ciclo->id_ciclo,
                'tipo' => 'SIMULACRO',
                'numero' => $examNum,
                'fecha' => Carbon::now()->subWeeks(4 - $examNum)->toDateString(),
                'descripcion' => 'Simulacro General N°' . $examNum,
            ]);

            // Save results for all 4 matriculas
            $matriculas = Matricula::all();
            foreach ($matriculas as $idx => $m) {
                // Aptitud: range 5 to 9, Conocimiento: range 6 to 10
                $apt = 5.0 + ($idx * 0.9) + ($examNum * 0.4);
                $con = 6.0 + ($idx * 1.1) + ($examNum * 0.5);
                ResultadoExamen::create([
                    'id_examen' => $examen->id_examen,
                    'id_matricula' => $m->id_matricula,
                    'puntaje_aptitud' => $apt,
                    'puntaje_conocimiento' => $con,
                    'puntaje_total' => $apt + $con,
                ]);
            }

            // Calculate Rankings (puestos) and metrics per Area for this exam
            $resultadosGuardados = ResultadoExamen::where('id_examen', $examen->id_examen)
                ->join('matricula', 'resultado_examen.id_matricula', '=', 'matricula.id_matricula')
                ->join('alumno', 'matricula.id_alumno', '=', 'alumno.id_alumno')
                ->join('carrera', 'alumno.id_carrera', '=', 'carrera.id_carrera')
                ->select('resultado_examen.*', 'carrera.id_area')
                ->get();

            $porArea = $resultadosGuardados->groupBy('id_area');

            foreach ($porArea as $idArea => $items) {
                $sorted = $items->sortByDesc('puntaje_total')->values();
                $max = 0.0;
                $min = 0.0;

                if ($sorted->count() > 0) {
                    $max = $sorted->first()->puntaje_total;
                    $min = $sorted->last()->puntaje_total;
                }

                foreach ($sorted as $pos => $item) {
                    ResultadoExamen::where('id_resultado', $item->id_resultado)
                        ->update(['puesto' => $pos + 1]);
                }

                if ($idArea) {
                    ExamenMetrica::create([
                        'id_examen' => $examen->id_examen,
                        'id_area' => $idArea,
                        'puntaje_max' => $max,
                        'puntaje_min' => $min,
                    ]);
                }
            }
        }
    }
}
