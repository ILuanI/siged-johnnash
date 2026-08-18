<?php

namespace App\Services;

use Exception;

class ZipGradeParser
{
    private const STATIC_COLUMNS = [
        'quizname' => 'quiz_name',
        'quizclass' => 'quiz_class',
        'firstname' => 'first_name',
        'lastname' => 'last_name',
        'studentid' => 'student_id',
        'customid' => 'custom_id',
        'earnedpoints' => 'earned',
        'possiblepoints' => 'possible',
        'percentcorrect' => 'percent',
        'quizcreated' => 'quiz_created',
        'dataexported' => 'data_exported',
        'answerkeyversion' => 'key_version',
    ];

    /**
     * Parsea un CSV de ZipGrade y devuelve la estructura normalizada.
     *
     * @return array{examen:array,preguntas:array<int,array>,filas:array<int,array>}
     */
    public function parse(string $path): array
    {
        $separator = $this->detectSeparator($path);
        $handle = fopen($path, 'r');

        if ($handle === false) {
            throw new Exception('No se pudo abrir el archivo CSV.');
        }

        $header = fgetcsv($handle, 0, $separator);

        if ($header === false || ! is_array($header)) {
            fclose($handle);
            throw new Exception('El archivo CSV está vacío o no tiene cabecera.');
        }

        $header = array_map('trim', $header);
        $this->validateHeader($header);

        $map = $this->buildStaticMap($header);
        $questionCols = $this->detectQuestionColumns($header);
        $numPreguntas = $questionCols['count'];

        if ($numPreguntas === 0) {
            fclose($handle);
            throw new Exception('No se detectaron columnas de preguntas (StuN, PriKeyN, PointsN, MarkN).');
        }

        $possiblePoints = null;
        $firstRow = null;
        $filas = [];
        $allAnswers = [];

        while (($row = fgetcsv($handle, 0, $separator)) !== false) {
            if (empty(array_filter($row))) {
                continue;
            }

            $data = [];
            foreach ($map as $index => $key) {
                $data[$key] = trim($row[$index] ?? '');
            }

            $respuestas = [];
            for ($n = 1; $n <= $numPreguntas; $n++) {
                $cols = $questionCols['by_question'][$n];
                $respuestas[$n] = [
                    'numero' => $n,
                    'respuesta' => isset($cols['stu']) ? trim($row[$cols['stu']] ?? '') : '',
                    'clave' => isset($cols['prikey']) ? trim($row[$cols['prikey']] ?? '') : '',
                    'puntos' => isset($cols['points']) ? $this->toFloat($row[$cols['points']] ?? 0) : 0,
                    'marca' => isset($cols['mark']) ? trim($row[$cols['mark']] ?? '') : '',
                ];
            }

            if ($firstRow === null) {
                $firstRow = $respuestas;
            }

            if ($possiblePoints === null && $data['possible'] !== '') {
                $possiblePoints = $this->toFloat($data['possible']);
            }

            $allAnswers[] = $respuestas;
            $filas[] = $data + ['respuestas' => $respuestas];
        }

        fclose($handle);

        $preguntas = $this->buildPreguntas($numPreguntas, $firstRow, $allAnswers);

        $examen = [
            'quiz_name' => $filas[0]['quiz_name'] ?? '',
            'quiz_class' => $filas[0]['quiz_class'] ?? '',
            'quiz_created' => $filas[0]['quiz_created'] ?? '',
            'data_exported' => $filas[0]['data_exported'] ?? '',
            'key_version' => $filas[0]['key_version'] ?? '',
            'possible_points' => $possiblePoints ?? 0,
            'num_preguntas' => $numPreguntas,
        ];

        return [
            'examen' => $examen,
            'preguntas' => $preguntas,
            'filas' => $filas,
        ];
    }

    private function detectSeparator(string $path): string
    {
        $content = (string) file_get_contents($path);
        if (strpos($content, ';') !== false && strpos($content, ',') === false) {
            return ';';
        }

        return ',';
    }

    private function normalizeColumn(string $col): string
    {
        return preg_replace('/[^a-z0-9]/', '', strtolower(trim($col)));
    }

    private function validateHeader(array $header): void
    {
        $normalized = array_map(fn ($h) => $this->normalizeColumn($h), $header);
        $required = ['studentid', 'earnedpoints', 'possiblepoints'];

        foreach ($required as $col) {
            if (! in_array($col, $normalized, true)) {
                throw new Exception("El CSV no tiene el formato de ZipGrade. Falta la columna: {$col}");
            }
        }
    }

    private function buildStaticMap(array $header): array
    {
        $map = [];
        foreach ($header as $index => $col) {
            $key = $this->normalizeColumn($col);
            if (array_key_exists($key, self::STATIC_COLUMNS)) {
                $map[$index] = self::STATIC_COLUMNS[$key];
            }
        }

        return $map;
    }

    private function detectQuestionColumns(array $header): array
    {
        $byQuestion = [];
        $max = 0;

        foreach ($header as $index => $col) {
            $norm = $this->normalizeColumn($col);
            if (preg_match('/^(stu|prikey|points|mark)(\d+)$/i', $norm, $m)) {
                $kind = strtolower($m[1]);
                $n = (int) $m[2];
                $byQuestion[$n] ??= [];
                $byQuestion[$n][$kind] = $index;
                $max = max($max, $n);
            }
        }

        ksort($byQuestion);

        return ['count' => $max, 'by_question' => $byQuestion];
    }

    private function buildPreguntas(int $numPreguntas, ?array $firstRow, array $allAnswers): array
    {
        $preguntas = [];

        for ($n = 1; $n <= $numPreguntas; $n++) {
            $clave = $firstRow[$n]['clave'] ?? '';

            $puntos = 0;
            foreach ($allAnswers as $respuestas) {
                $r = $respuestas[$n] ?? null;
                if (! $r) {
                    continue;
                }
                if (strtoupper($r['marca']) === 'C') {
                    $puntos = max($puntos, (float) $r['puntos']);
                }
            }

            if ($puntos === 0.0) {
                foreach ($allAnswers as $respuestas) {
                    $r = $respuestas[$n] ?? null;
                    if ($r) {
                        $puntos = max($puntos, (float) $r['puntos']);
                    }
                }
            }

            $preguntas[$n] = [
                'numero' => $n,
                'clave_correcta' => $clave,
                'puntos' => $puntos > 0 ? $puntos : 1,
            ];
        }

        return $preguntas;
    }

    private function toFloat($value): float
    {
        return (float) str_replace(',', '.', (string) $value);
    }
}
