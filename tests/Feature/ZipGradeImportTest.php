<?php

namespace Tests\Feature;

use App\Enums\EstadoMatricula;
use App\Http\Middleware\EnsureUserHasPermission;
use App\Models\Alumno;
use App\Models\Area;
use App\Models\Ciclo;
use App\Models\Examen;
use App\Models\ExamenPregunta;
use App\Models\ExamenRespuesta;
use App\Models\Matricula;
use App\Models\ResultadoExamen;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ZipGradeImportTest extends TestCase
{
    use RefreshDatabase;

    private function csvContent(): string
    {
        $header = [
            'Quiz Name', 'Quiz Class', 'First Name', 'Last Name', 'Student ID', 'Custom ID',
            'Earned Points', 'Possible Points', 'Percent Correct', 'Quiz Created', 'Data Exported',
            'Answer Key Version', 'Stu1', 'Stu2', 'Stu3', 'PriKey1', 'PriKey2', 'PriKey3',
            'Points1', 'Points2', 'Points3', 'Mark1', 'Mark2', 'Mark3',
        ];

        $rows = [
            ['Examen Prueba', 'A', 'Ana', 'Lopez', '11111111', 'C1', 6, 9, 66.67, '2026-08-01', '2026-08-10', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 3, 3, 0, 'C', 'C', 'I'],
            ['Examen Prueba', 'A', 'Beto', 'Rojas', '22222222', 'C2', 9, 9, 100.00, '2026-08-01', '2026-08-10', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 3, 3, 3, 'C', 'C', 'C'],
            ['Examen Prueba', 'A', 'Cami', 'Diaz', '33333333', 'C3', 3, 9, 33.33, '2026-08-01', '2026-08-10', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 0, 0, 3, 'X', 'I', 'C'],
            ['Examen Prueba', 'A', 'Desconocido', 'X', '99999999', 'C9', 5, 9, 55.55, '2026-08-01', '2026-08-10', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 2, 3, 0, 'I', 'C', 'I'],
            ['Examen Prueba', 'A', 'Ana', 'Lopez', '11111111', 'C1', 4, 9, 44.44, '2026-08-01', '2026-08-10', 'A', 'A', 'B', 'C', 'A', 'B', 'C', 1, 3, 0, 'I', 'C', 'I'],
        ];

        $lines = [implode(',', $header)];
        foreach ($rows as $r) {
            $lines[] = implode(',', $r);
        }

        return implode("\n", $lines);
    }

    private function setupData(): array
    {
        $ciclo = Ciclo::factory()->create();
        $area = Area::factory()->create();

        foreach (['11111111', '22222222', '33333333'] as $dni) {
            $alumno = Alumno::factory()->create(['dni' => $dni]);
            Matricula::factory()->create([
                'id_alumno' => $alumno->id_alumno,
                'id_ciclo' => $ciclo->id_ciclo,
                'estado' => EstadoMatricula::Vigente,
            ]);
        }

        return ['ciclo' => $ciclo, 'area' => $area];
    }

    private function fakeCsv()
    {
        return UploadedFile::fake()->createWithContent('zipgrade.csv', $this->csvContent(), 'text/csv');
    }

    private function auth()
    {
        $this->actingAs(User::factory()->create());
        $this->withoutMiddleware(EnsureUserHasPermission::class);
    }

    public function test_preview_detects_questions_and_matches_students(): void
    {
        $this->auth();
        $data = $this->setupData();

        $response = $this->postJson('/notas/preview-csv', [
            'id_ciclo' => $data['ciclo']->id_ciclo,
            'archivo' => $this->fakeCsv(),
        ]);

        $response->assertOk();
        $json = $response->json();

        $this->assertEquals(3, $json['examen']['num_preguntas']);
        $this->assertEquals(9, $json['examen']['possible_points']);
        $this->assertEquals(3, $json['resumen']['ok']);
        $this->assertEquals(2, $json['resumen']['warning']);
        $this->assertCount(5, $json['filas']);
        $this->assertCount(3, $json['preguntas']);
        $this->assertEquals('Estudiante duplicado en el CSV (StudentID: 11111111)', $json['filas'][4]['mensaje']);
        $this->assertEquals('WARNING', $json['filas'][4]['status']);
    }

    public function test_guardar_imports_exam_questions_and_results(): void
    {
        $this->auth();
        $data = $this->setupData();

        $this->post('/notas/guardar', [
            'id_ciclo' => $data['ciclo']->id_ciclo,
            'tipo' => 'SIMULACRO',
            'numero' => 1,
            'fecha' => '2026-08-10',
            'descripcion' => 'Examen Prueba',
            'id_area' => $data['area']->id_area,
            'archivo' => $this->fakeCsv(),
        ])->assertRedirect(route('notas.index'));

        $examen = Examen::where('descripcion', 'Examen Prueba')->first();
        $this->assertNotNull($examen);
        $this->assertSame(3, $examen->preguntas()->count());
        $this->assertSame(3, $examen->resultados()->count());
        $this->assertSame(9, ExamenRespuesta::whereIn('id_resultado', $examen->resultados()->pluck('id_resultado'))->count());
        $this->assertSame(1, $examen->metricas()->count());

        $beto = ResultadoExamen::whereHas('matricula.alumno', fn ($q) => $q->where('dni', '22222222'))->first();
        $ana = ResultadoExamen::whereHas('matricula.alumno', fn ($q) => $q->where('dni', '11111111'))->first();
        $cami = ResultadoExamen::whereHas('matricula.alumno', fn ($q) => $q->where('dni', '33333333'))->first();

        $this->assertEquals(1, $beto->puesto);
        $this->assertEquals(2, $ana->puesto);
        $this->assertEquals(3, $cami->puesto);
        $this->assertEquals(6.0, $ana->puntaje_total);
        $this->assertEquals(66.67, $ana->porcentaje);

        $p1 = ExamenPregunta::where('id_examen', $examen->id_examen)->where('numero', 1)->first();
        $this->assertEquals('A', $p1->clave_correcta);
        $this->assertEquals(3.0, $p1->puntos);

        $resp = ExamenRespuesta::where('id_resultado', $ana->id_resultado)->orderBy('numero')->get();
        $this->assertEquals('C', $resp[0]->marca);
        $this->assertEquals(3.0, $resp[0]->puntos_obtenidos);
        $this->assertEquals('I', $resp[2]->marca);
        $this->assertEquals(0.0, $resp[2]->puntos_obtenidos);

        $camiResp = ExamenRespuesta::where('id_resultado', $cami->id_resultado)->orderBy('numero')->get();
        $this->assertEquals('X', $camiResp[0]->marca);
        $this->assertEquals(0.0, $camiResp[0]->puntos_obtenidos);
    }

    public function test_guardar_prevents_duplicates(): void
    {
        $this->auth();
        $data = $this->setupData();

        $payload = [
            'id_ciclo' => $data['ciclo']->id_ciclo,
            'tipo' => 'SIMULACRO',
            'numero' => '',
            'fecha' => '2026-08-10',
            'descripcion' => 'Examen Prueba',
            'id_area' => '',
            'archivo' => $this->fakeCsv(),
        ];

        $this->post('/notas/guardar', $payload)->assertRedirect(route('notas.index'));
        $this->assertSame(1, Examen::where('descripcion', 'Examen Prueba')->count());

        $this->post('/notas/guardar', array_merge($payload, ['archivo' => $this->fakeCsv()]))
            ->assertSessionHasErrors('archivo');
        $this->assertSame(1, Examen::where('descripcion', 'Examen Prueba')->count());
    }

    public function test_invalid_csv_is_rejected(): void
    {
        $this->auth();
        $ciclo = Ciclo::factory()->create();
        $bad = UploadedFile::fake()->createWithContent('bad.csv', "foo,bar\n1,2\n", 'text/csv');

        $this->postJson('/notas/preview-csv', [
            'id_ciclo' => $ciclo->id_ciclo,
            'archivo' => $bad,
        ])->assertStatus(422);
    }

    public function test_show_and_resultado_render(): void
    {
        $this->auth();
        $data = $this->setupData();

        $this->post('/notas/guardar', [
            'id_ciclo' => $data['ciclo']->id_ciclo,
            'tipo' => 'SIMULACRO',
            'numero' => 1,
            'fecha' => '2026-08-10',
            'descripcion' => 'Examen Prueba',
            'id_area' => $data['area']->id_area,
            'archivo' => $this->fakeCsv(),
        ]);

        $examen = Examen::where('descripcion', 'Examen Prueba')->first();
        $resultado = $examen->resultados()->first();

        $this->get("/notas/{$examen->id_examen}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('notas/show')
                ->where('preguntas.0.numero', 1)
                ->where('preguntas.0.correctas', 2)
                ->where('preguntas.0.errores', 1)
            );
        $this->get("/notas/{$examen->id_examen}/resultado/{$resultado->id_resultado}")->assertOk();
    }
}
