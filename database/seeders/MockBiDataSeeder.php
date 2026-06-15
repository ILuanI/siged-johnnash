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
                'faltas' => 5,
                'asistencias' => 20,
                'simulacros' => [150.2, 160.5, 170.8], // scores in 3 mocks
                'desercion' => ['probabilidad' => 0.85, 'factores' => ['Inasistencias', 'Bajo Rendimiento']],
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
                'asistencias' => 29,
                'simulacros' => [350.5, 360.1, 380.5],
                'desercion' => null,
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
                'tardanzas' => 2,
                'faltas' => 3,
                'asistencias' => 24,
                'simulacros' => [200.4, 210.8, 205.2],
                'desercion' => ['probabilidad' => 0.45, 'factores' => ['Deuda pendiente']],
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
                'faltas' => 8,
                'asistencias' => 19,
                'simulacros' => [120.5, 110.0, 90.2],
                'desercion' => ['probabilidad' => 0.90, 'factores' => ['Inasistencias continuas', 'Caída brusca en notas', 'Deuda vencida']],
            ],
            [
                'codigo' => 'ALU-2026-00005',
                'nombres' => 'Eduardo',
                'apellidos' => 'Mendoza Silva',
                'dni' => '75566778',
                'carrera' => $carrera2,
                'turno' => $turnoM,
                'aula' => $aula101,
                'tipo_pago' => 'CREDITO',
                'costo' => 1450.00,
                'pagado_completo' => true,
                'tardanzas' => 1,
                'faltas' => 1,
                'asistencias' => 27,
                'simulacros' => [300.0, 315.5, 320.0],
                'desercion' => null,
            ],
            [
                'codigo' => 'ALU-2026-00006',
                'nombres' => 'Luis Angel',
                'apellidos' => 'Campos Flores',
                'dni' => '71122338',
                'carrera' => $carrera3,
                'turno' => $turnoT,
                'aula' => $aula102,
                'tipo_pago' => 'CREDITO',
                'costo' => 1350.00,
                'pagado_completo' => false,
                'tardanzas' => 5,
                'faltas' => 4,
                'asistencias' => 20,
                'simulacros' => [80.0, 75.0, 60.5],
                'desercion' => ['probabilidad' => 0.88, 'factores' => ['Notas muy bajas', 'Tardanzas', 'Morosidad']],
            ],
            [
                'codigo' => 'ALU-2026-00007',
                'nombres' => 'Ana Lucia',
                'apellidos' => 'Torres Vargas',
                'dni' => '74455889',
                'carrera' => $carrera1,
                'turno' => $turnoM,
                'aula' => $aula101,
                'tipo_pago' => 'CONTADO',
                'costo' => 1250.00,
                'pagado_completo' => true,
                'tardanzas' => 0,
                'faltas' => 0,
                'asistencias' => 29,
                'simulacros' => [380.0, 390.5, 395.0],
                'desercion' => null,
            ],
            [
                'codigo' => 'ALU-2026-00008',
                'nombres' => 'Diego',
                'apellidos' => 'Castillo Rojas',
                'dni' => '72233445',
                'carrera' => $carrera2,
                'turno' => $turnoT,
                'aula' => $aula102,
                'tipo_pago' => 'CREDITO',
                'costo' => 1500.00,
                'pagado_completo' => false,
                'tardanzas' => 0,
                'faltas' => 0,
                'asistencias' => 29,
                'simulacros' => [250.0, 260.0, 255.5],
                'desercion' => ['probabilidad' => 0.20, 'factores' => ['Mensualidad próxima a vencer']],
                'matriculado' => true,
            ],
            [
                'codigo' => 'ALU-2026-00009',
                'nombres' => 'Valeria',
                'apellidos' => 'Gomez Paz',
                'dni' => '79988776',
                'carrera' => $carrera1,
                'turno' => $turnoM,
                'aula' => $aula101,
                'tipo_pago' => 'CONTADO',
                'costo' => 1200.00,
                'pagado_completo' => true,
                'tardanzas' => 1,
                'faltas' => 1,
                'asistencias' => 28,
                'simulacros' => [360.5, 375.0, 385.2],
                'desercion' => null,
                'matriculado' => true,
            ],
            [
                'codigo' => 'ALU-2026-00010',
                'nombres' => 'Martin',
                'apellidos' => 'Rios Cuadros',
                'dni' => '75554443',
                'carrera' => $carrera3,
                'turno' => $turnoT,
                'aula' => $aula102,
                'tipo_pago' => 'CREDITO_MOROSO', // Custom flag for seeder
                'costo' => 1350.00,
                'pagado_completo' => false,
                'tardanzas' => 0,
                'faltas' => 20,
                'asistencias' => 0,
                'simulacros' => [-10.0, 0.0, 5.0],
                'desercion' => null,
                'matriculado' => true,
            ],
            [
                'codigo' => 'ALU-2026-00011',
                'nombres' => 'Sofia',
                'apellidos' => 'Perez Alarcon',
                'dni' => '71112223',
                'carrera' => $carrera2,
                'turno' => null,
                'aula' => null,
                'tipo_pago' => null,
                'costo' => 0,
                'pagado_completo' => false,
                'tardanzas' => 0,
                'faltas' => 0,
                'asistencias' => 0,
                'simulacros' => [],
                'desercion' => null,
                'matriculado' => false,
            ],
            [
                'codigo' => 'ALU-2026-00012',
                'nombres' => 'Joaquin',
                'apellidos' => 'Salazar Loo',
                'dni' => '72223334',
                'carrera' => $carrera1,
                'turno' => null,
                'aula' => null,
                'tipo_pago' => null,
                'costo' => 0,
                'pagado_completo' => false,
                'tardanzas' => 0,
                'faltas' => 0,
                'asistencias' => 0,
                'simulacros' => [],
                'desercion' => null,
                'matriculado' => false,
            ],
            [
                'codigo' => 'ALU-2026-00013',
                'nombres' => 'Pedro',
                'apellidos' => 'Suarez Vertiz',
                'dni' => '74445556',
                'carrera' => $carrera1,
                'turno' => $turnoM,
                'aula' => $aula101,
                'tipo_pago' => 'CREDITO_MOROSO',
                'costo' => 1500.00,
                'pagado_completo' => false,
                'tardanzas' => 1,
                'faltas' => 19,
                'asistencias' => 1,
                'simulacros' => [10.0, 15.0, 12.0],
                'desercion' => null,
                'matriculado' => true,
            ],
        ];

        foreach ($studentsData as $idx => $s) {
            $apoderado = Apoderado::create([
                'nombres' => 'Apoderado de '.$s['nombres'],
                'telefono' => '99988877'.$idx,
            ]);

            $isMatriculado = $s['matriculado'] ?? true;

            $alumno = Alumno::create([
                'codigo' => $s['dni'],
                'nombres' => $s['nombres'],
                'apellidos' => $s['apellidos'],
                'dni' => $s['dni'],
                'fecha_nac' => '2008-04-12',
                'sexo' => 'M',
                'telefono' => '98765432'.$idx,
                'id_carrera' => $s['carrera']->id_carrera,
                'id_apoderado' => $apoderado->id_apoderado,
                'estado' => $isMatriculado ? 'MATRICULADO' : 'ACTIVO',
            ]);

            if (!$isMatriculado) {
                // If not enrolled, do not create Matricula, Pagos, Asistencias, or Simulacros.
                continue;
            }

            $isCreditoMoroso = $s['tipo_pago'] === 'CREDITO_MOROSO';
            $isCredito = $s['tipo_pago'] === 'CREDITO' || $isCreditoMoroso;

            $matricula = Matricula::create([
                'id_alumno' => $alumno->id_alumno,
                'id_ciclo' => $ciclo->id_ciclo,
                'id_periodo' => $periodo->id_periodo,
                'id_turno' => $s['turno']->id_turno,
                'id_aula' => $s['aula']->id_aula,
                'fecha_matricula' => Carbon::now()->subMonths(1)->toDateString(),
                'modalidad' => 'PRESENCIAL',
                'tipo_pago' => $isCreditoMoroso ? 'CREDITO' : $s['tipo_pago'],
                'costo_total' => $s['costo'],
                'estado' => 'VIGENTE',
            ]);

            $saldo = $s['pagado_completo'] ? 0.0 : ($isCredito ? $s['costo'] / 2 : $s['costo']);
            if ($isCreditoMoroso) {
                $saldo = $s['costo'];
            }

            $comprobante = ComprobantePago::create([
                'id_matricula' => $matricula->id_matricula,
                'numero' => 'B001-0000'.$idx,
                'tipo' => 'BOLETA',
                'fecha_emision' => Carbon::now()->toDateString(),
                'costo_total' => $s['costo'],
                'saldo_pendiente' => $saldo,
            ]);

            if ($isCreditoMoroso) {
                // 3 cuotas, all overdue and not paid!
                for ($cuotaIdx = 1; $cuotaIdx <= 3; $cuotaIdx++) {
                    Cuota::create([
                        'id_comprobante' => $comprobante->id_comprobante,
                        'numero_cuota' => $cuotaIdx,
                        'monto' => $s['costo'] / 3,
                        'fecha_vencimiento' => Carbon::now()->subWeeks(5 - $cuotaIdx)->toDateString(),
                        'estado' => \App\Enums\EstadoCuota::Pendiente,
                    ]);
                }
            } elseif ($isCredito) {
                // 2 cuotas
                $cuota1 = Cuota::create([
                    'id_comprobante' => $comprobante->id_comprobante,
                    'numero_cuota' => 1,
                    'monto' => $s['costo'] / 2,
                    'fecha_vencimiento' => Carbon::now()->subWeeks(2)->toDateString(),
                    'estado' => \App\Enums\EstadoCuota::Pagada,
                ]);
                Pago::create([
                    'id_cuota' => $cuota1->id_cuota,
                    'user_id' => 1,
                    'fecha_pago' => Carbon::now()->subWeeks(2)->toDateString(),
                    'monto' => $s['costo'] / 2,
                    'metodo_pago' => 'TRANSFERENCIA',
                ]);

                // Cuota 2
                $cuota2Estado = $s['pagado_completo'] ? \App\Enums\EstadoCuota::Pagada : \App\Enums\EstadoCuota::Pendiente;
                $cuota2 = Cuota::create([
                    'id_comprobante' => $comprobante->id_comprobante,
                    'numero_cuota' => 2,
                    'monto' => $s['costo'] / 2,
                    'fecha_vencimiento' => Carbon::now()->addWeeks(2)->toDateString(),
                    'estado' => $cuota2Estado,
                ]);
                if ($s['pagado_completo']) {
                    Pago::create([
                        'id_cuota' => $cuota2->id_cuota,
                        'user_id' => 1,
                        'fecha_pago' => Carbon::now()->subDays(2)->toDateString(),
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
                    'fecha_vencimiento' => Carbon::now()->subWeeks(3)->toDateString(),
                    'estado' => $s['pagado_completo'] ? \App\Enums\EstadoCuota::Pagada : \App\Enums\EstadoCuota::Pendiente,
                ]);

                if ($s['pagado_completo']) {
                    Pago::create([
                        'id_cuota' => $cuota->id_cuota,
                        'user_id' => 1,
                        'fecha_pago' => Carbon::now()->subWeeks(3)->toDateString(),
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

            // 9. Predict desertion if needed
            if (isset($s['desercion']) && $s['desercion'] !== null) {
                $riesgoPct = $s['desercion']['probabilidad'] * 100;
                $nivel = $riesgoPct > 75 ? 'ALTO' : ($riesgoPct > 40 ? 'MEDIO' : 'BAJO');
                \App\Models\PrediccionDesercion::create([
                    'id_matricula' => $matricula->id_matricula,
                    'fecha_calculo' => Carbon::now()->toDateString(),
                    'riesgo_pct' => $riesgoPct,
                    'nivel_riesgo' => $nivel,
                    'tasa_asistencia' => ($s['asistencias'] / max(1, $s['asistencias'] + $s['faltas'])) * 100,
                    'promedio_examenes' => array_sum($s['simulacros']) / max(1, count($s['simulacros'])),
                    'cuotas_vencidas' => $s['tipo_pago'] === 'CREDITO' && !$s['pagado_completo'] ? 1 : 0,
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
                'descripcion' => 'Simulacro General N°'.$examNum,
            ]);

            // Save results for all matriculas
            foreach ($studentsData as $idx => $s) {
                $matricula = Matricula::whereHas('alumno', function($q) use ($s) {
                    $q->where('dni', $s['dni']);
                })->first();

                if ($matricula) {
                    $totalScore = $s['simulacros'][$examNum - 1] ?? 0;
                    // Split roughly
                    $apt = $totalScore * 0.25;
                    $con = $totalScore * 0.75;

                    ResultadoExamen::create([
                        'id_examen' => $examen->id_examen,
                        'id_matricula' => $matricula->id_matricula,
                        'puntaje_aptitud' => $apt,
                        'puntaje_conocimiento' => $con,
                        'puntaje_total' => $totalScore,
                    ]);
                }
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
