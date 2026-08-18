# Flujo: Importación de Notas ZipGrade (`notas`)

Mapa del recorrido real de `resources/js/pages/notas/*` y el controlador
`app/Http/Controllers/Academico/ExamenController`.

## Rutas y controlador

| Ruta | Nombre | Acción |
|---|---|---|
| `GET /notas` | `notas.index` | `ExamenController::index` |
| `GET /notas/cargar` | `notas.cargar` | `ExamenController::cargarForm` |
| `POST /notas/preview-csv` | `notas.preview` | `ExamenController::previewCsv` |
| `POST /notas/guardar` | `notas.guardar` | `ExamenController::guardar` |
| `GET /notas/{examen}` | `notas.show` | `ExamenController::show` |
| `GET /notas/{examen}/resultado/{resultado}` | `notas.resultado` | `ExamenController::showResultado` |

Todas requieren `auth`, `verified` y permiso (`routes/notas.php`).

## Formato CSV ZipGrade

Export de ZipGrade: cabeceras con espacios (`Student ID`, `Custom ID`,
`Earned Points`, `Possible Points`, `Percent Correct`, `Quiz Created`,
`Data Exported`, `Answer Key Version`) y columnas dinámicas por pregunta:
`StuN` (respuesta del alumno), `PriKeyN` (clave correcta, se repite en toda la
columna), `PointsN` (puntos, 3 decimales, puede ser negativo), `MarkN` (marca:
`C` correcto; cualquier otra, incl. `X`, es incorrecto).

## Parser (`app/Services/ZipGradeParser.php`)

`parse(path)` → `{ examen, preguntas, filas }`:

- Normaliza cada cabecera quitando caracteres no alfanuméricos
  (`Student ID` → `studentid`, `Answer Key Version` → `answerkeyversion`).
- Valida que existan `studentid`, `earnedpoints` y `possiblepoints`; si faltan,
  lanza excepción → el frontend muestra error 422.
- Detecta el número de preguntas por las columnas `StuN` y calcula
  `puntos` por pregunta: máximo `PointsN` de las filas donde `MarkN == 'C'`
  (si no hay correctas, máximo global; si es 0, usa 1).
- `examen`: `quiz_name`, `quiz_class`, `key_version`, `possible_points`,
  `num_preguntas`.
- `filas`: por estudiante, `student_id`, `custom_id`, nombres, `earned`,
  `possible`, `percent`, `respuestas[]` (`numero`, `respuesta`, `puntos`,
  `marca`).

## Preview (`POST /notas/preview-csv`)

1. Valida `id_ciclo` (existente) y archivo `csv/txt`.
2. Parsea; si el parse falla devuelve `422 { error }`.
3. Por cada fila: matchea `alumno.dni = student_id` (fallback `custom_id`) y
   matrícula VIGENTE del ciclo → `status: OK`; si no encuentra alumno o
   matrícula → `WARNING` ("Estudiante no encontrado" / "Sin matrícula vigente").
4. Fila cuyo `student_id` (o `custom_id`) ya apareció antes → `WARNING`
   "Estudiante duplicado en el CSV" y **no** entra en `no_encontrados`.
5. Responde `{ examen, preguntas, filas, resumen: { total, ok, warning,
   no_encontrados } }`.

## Guardar (`POST /notas/guardar`)

1. Valida formulario; `id_area` y `numero` vacíos se normalizan a `null`.
2. Re-parsea el archivo (no confía en el preview del cliente).
3. Anti-duplicado: si ya existe `examen` con (ciclo, tipo, numero, fecha,
   descripcion) → error "Evita importaciones duplicadas".
4. Transacción:
   - Crea `examen` + `examen_pregunta` (1 por pregunta).
   - Por cada fila: matchea alumno + matrícula vigente; **omite** si la
     matrícula ya se usó en este mismo import o si `resultado_examen` ya
     tiene una fila para ese `(id_examen, id_matricula)` (protege el único
     `uq_resultado`); cuenta las omitidas.
   - Crea `resultado_examen` (puntaje total = earned, posible, porcentaje) +
     `examen_respuesta` por pregunta.
   - Si no se creó ningún resultado → `ValidationException` "Ningún estudiante
     del CSV pudo asociarse…".
   - Asigna `puesto` (ranking por `puntaje_total` desc).
   - Si hay `id_area`, crea `ExamenMetrica` (puntaje máx/mín).
5. Redirige a `notas.index` con flash de éxito (+ aviso de filas omitidas).

## Vista show (`GET /notas/{examen}`)

- Carga examen con ciclo, área, métricas, preguntas (ordenadas), resultados
  (ordenados por puesto) con matrícula/alumno y respuestas.
- Resumen: alumnos, promedio, mejor, menor, % que aprobó (nota ≥ 11).
- Tabla por alumno: puesto, nombre, correctas, puntaje, porcentaje, nota
  vigesimal (`redondeo((correctas / total) * 100 / 5)`).
- Análisis por pregunta: `correctas` (marca `C`), `errores` (total −
  correctas, cubre `I/B/M/X`), % correctas.

## Vista resultado (`GET /notas/{examen}/resultado/{resultado}`)

Detalle por alumno: datos del examen, respuestas ordenadas por `numero` con
`respuesta`, `clave_correcta`, `marca`, `puntos_obtenidos` y `correcta`
(basado en marca == `C`), más puntaje/porcentaje/nota.

## Duplicados de estudiante

El índice único `uq_resultado (id_examen, id_matricula)` en `resultado_examen`
es la red de seguridad final: el preview avisa y `guardar` omite, por lo que un
CSV con un alumno repetido no rompe la importación.
