# Modelo Académico — SIGED John Nash

## Visión general

El sistema maneja estas entidades principales:

1. **Periodo Académico** → **Ciclos**
2. **Áreas** → **Carreras**
3. **Alumnos** + **Apoderados** + **Colegios de Procedencia**
4. **Cursos** + **Asignación Docente** + **Horarios**
5. **Matrículas** + **Turnos** + **Aulas**
6. **Exámenes** + **Resultados**
7. **Asistencias**
8. **Pagos**: Comprobantes → Cuotas → Pagos
9. **Predicción de Deserción**
10. **Egresos** + **Configuración**

---

## 1. Periodo Académico y Ciclos

```
periodo_academico 1 ── * ciclo
```

### PeriodoAcademico (`periodo_academico`)
Agrupa uno o más ciclos en un año académico. Ejemplo: "Periodo 2025", "Periodo 2026-I".

| Campo | Tipo | Descripción |
|---|---|---|
| `id_periodo` | PK | |
| `nombre` | varchar(80) | "Periodo 2025-I" |
| `anio` | smallint | Año |
| `descripcion` | varchar(160) | |
| `estado` | enum | `ABIERTO` / `CERRADO` |

### Ciclo (`ciclo`)
Es la unidad operativa de clases. Un periodo puede tener múltiples ciclos (Anual, Semestral, Intensivo, etc.). Los ciclos tienen fechas de inicio/fin y un costo base que se usa al matricular.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_ciclo` | PK | |
| `id_periodo` | FK → `periodo_academico` | |
| `nombre` | varchar(60) | "Ciclo Anual 2026-I", "Repaso Nash Marzo" |
| `tipo_ciclo` | varchar(40) | "Anual", "Semestral", "Intensivo" |
| `fecha_inicio` / `fecha_fin` | date | |
| `costo_base` | decimal(8,2) | Precio base del ciclo para matrícula |
| `estado` | enum | `ABIERTO` / `EN_CURSO` / `CERRADO` |

**Relaciones:** ciclo → PeriodoAcademico, Matriculas, AsignacionDocente, Examenes.

**¿Dónde se gestionan?** `POST /cursos/ciclos`.

---

## 2. Áreas y Carreras

```
area 1 ── * carrera 1 ── * alumno
```

### Área (`area`)
Se usa en dos contextos: clasificar carreras (postulación) y clasificar exámenes (métricas por área).

| Campo | Tipo | Descripción |
|---|---|---|
| `id_area` | PK | |
| `codigo` | char(1) | "A", "B", "C" |
| `nombre` | varchar(80) | "Ciencias", "Letras" |

### Carrera (`carrera`)
Carrera profesional o programa al que un alumno postula.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_carrera` | PK | |
| `id_area` | FK → `area` | |
| `nombre` | varchar(120) | "Medicina Humana", "Derecho" |
| `puntaje_min` / `puntaje_max` | decimal(7,3) | Rango de puntajes de admisión |

---

## 3. Alumnos, Apoderados y Colegios

```
alumno * ── 1 apoderado
alumno * ── 1 colegio_procedencia
alumno * ── 1 carrera
```

### Alumno (`alumno`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_alumno` | PK | |
| `nombres` | varchar(80) | |
| `apellidos` | varchar(80) | |
| `dni` | char(8) | Único |
| `fecha_nac` | date | |
| `sexo` | enum | `M` / `F` / `OTRO` |
| `telefono` | varchar(20) | |
| `colegio_procedencia_id` | FK → `colegio_procedencia` | |
| `id_carrera` | FK → `carrera` | |
| `id_apoderado` | FK → `apoderado` | |
| `estado` | enum | `ACTIVO` / `MATRICULADO` / `RETIRADO` / `EGRESADO` |

### Apoderado (`apoderado`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_apoderado` | PK | |
| `nombres` | varchar(120) | |
| `telefono` | varchar(20) | |

### ColegioProcedencia (`colegio_procedencia`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_colegio_procedencia` | PK | |
| `nombre` | varchar(120) | |

---

## 4. Cursos

```
curso 1 ── * asignacion_docente (por ciclo)
```

### Curso (`curso`)
Global, independiente del ciclo. La relación con un ciclo se da vía `asignacion_docente`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_curso` | PK | |
| `nombre` | varchar(80) | "Álgebra", "Razonamiento Verbal" |
| `area_conoc` | varchar(40) | Etiqueta textual ("Matemáticas", "Comunicación") |
| `color` | varchar(7) | Hex color para el horario |

**`area_conoc` NO se relaciona con la tabla `area`** — son conceptos independientes.

### AsignacionDocente (`asignacion_docente`)
Puente entre curso, docente, ciclo y aula.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_asignacion` | PK | |
| `id_docente` | FK → `docentes` | |
| `id_curso` | FK → `curso` | |
| `id_ciclo` | FK → `ciclo` | |
| `id_aula` | FK → `aula` | |

Unique `(id_curso, id_ciclo)`: un curso una vez por ciclo.

### Horario (`horario`)
Días y horas de una asignación.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_horario` | PK | |
| `id_asignacion` | FK → `asignacion_docente` | |
| `dia_semana` | enum | `LUN`–`DOM` |
| `hora_inicio` / `hora_fin` | time | |

Reglas: sin cruces de horario para un docente en un mismo ciclo, ni para un aula en un mismo ciclo.

### Aula (`aula`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_aula` | PK | |
| `nombre` | varchar(40) | |
| `capacidad` | smallint | |

### Docente (`docentes`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | PK | |
| `nombres` / `apellidos` | varchar(255) | |
| `dni` | varchar(15) | |
| `correo` / `telefono` | varchar(255) | |

---

## 5. Matrículas

```
matricula ──→ alumno
          ──→ ciclo
          ──→ periodo_academico
          ──→ turno
          ──→ aula
```

### Matricula (`matricula`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_matricula` | PK | |
| `id_alumno` | FK → `alumno` | |
| `id_ciclo` | FK → `ciclo` | |
| `id_periodo` | FK → `periodo_academico` | |
| `id_turno` | FK → `turno` | |
| `id_aula` | FK → `aula` | nullable; ya no se asigna en matrículas nuevas |
| `fecha_matricula` | date | |
| `modalidad` | enum | `PRESENCIAL` / `VIRTUAL` |
| `tipo_pago` | enum | `CONTADO` / `CREDITO` |
| `costo_total` | decimal(8,2) | |
| `costo_matricula` | decimal(8,2) | |
| `costo_simulacro` | decimal(8,2) | |
| `costo_carnet` | decimal(8,2) | |
| `cuotas_matricula` | tinyint | N° cuotas para matrícula |
| `cuotas_simulacro` | tinyint | N° cuotas para simulacro |
| `estado` | enum | `VIGENTE` / `ANULADA` / `FINALIZADA` |

**Reglas:** Cada concepto genera su propio `ComprobantePago`. Carnet siempre 1 cuota.

### Turno (`turno`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_turno` | PK | |
| `nombre` | varchar(40) | "Mañana", "Tarde", "Noche" |
| `hora_inicio` / `hora_fin` | time | |

---

## 6. Exámenes

```
area 1 ── * examen 1 ── * resultado_examen
                1 ── * examen_pregunta 1 ── * examen_respuesta
                1 ── * examen_metrica (por área)
```

Las preguntas (`examen_pregunta`) y respuestas (`examen_respuesta`) se crean al
importar un CSV de ZipGrade desde `/notas/cargar` (ver
`docs/flow/notas-zipgrade-flow.md`).

### Examen (`examen`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_examen` | PK | |
| `id_ciclo` | FK → `ciclo` | |
| `tipo` | enum | `SIMULACRO` / `CONOCIMIENTO` / `SEMANAL` |
| `numero` | smallint | Número de examen |
| `id_area` | FK → `area` | |
| `fecha` | date | |
| `descripcion` | varchar(120) | Opcional |
| `costo` | decimal(8,2) | Costo del examen (si aplica) |

### ExamenMetrica (`examen_metrica`)
Puntaje máximo y mínimo por área en un examen.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_metrica` | PK | |
| `id_examen` | FK → `examen` | |
| `id_area` | FK → `area` | |
| `puntaje_max` / `puntaje_min` | decimal(7,3) | |

### ResultadoExamen (`resultado_examen`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_resultado` | PK | |
| `id_examen` | FK → `examen` | |
| `id_matricula` | FK → `matricula` | |
| `puntaje_aptitud` | decimal(7,3) | |
| `puntaje_conocimiento` | decimal(7,3) | |
| `puntaje_total` | decimal(7,3) | aptitud + conocimiento (con ZipGrade: `Earned Points`) |
| `puntaje_posible` | decimal(7,3) | `Possible Points` del CSV (nullable; agregado por ZipGrade) |
| `porcentaje` | decimal(5,2) | `Percent Correct` del CSV (nullable; agregado por ZipGrade) |
| `puesto` | smallint | Ranking dentro del área |
| — | unique `uq_resultado` | `(id_examen, id_matricula)` — un resultado por alumno/examen |

### ExamenPregunta (`examen_pregunta`) — creada por import ZipGrade

| Campo | Tipo | Descripción |
|---|---|---|
| `id_pregunta` | PK | |
| `id_examen` | FK → `examen` | |
| `numero` | smallint | Número de pregunta |
| `clave_correcta` | varchar | `PriKeyN` (A–E) |
| `puntos` | decimal(7,3) | Máximo `PointsN` de las respuestas correctas |
| — | unique | `(id_examen, numero)` |

### ExamenRespuesta (`examen_respuesta`) — creada por import ZipGrade

| Campo | Tipo | Descripción |
|---|---|---|
| `id_respuesta` | PK | |
| `id_resultado` | FK → `resultado_examen` | |
| `id_pregunta` | FK → `examen_pregunta` | |
| `numero` | smallint | |
| `respuesta` | varchar(10) | `StuN` (A–E o en blanco) |
| `puntos_obtenidos` | decimal(7,3) | `PointsN` |
| `marca` | varchar(5) | `C` = correcto; `I`/`B`/`M`/`X` = incorrecto |
| — | unique | `(id_resultado, id_pregunta)` |

---

## 7. Asistencias

### Asistencia (`asistencia`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_asistencia` | PK | |
| `tipo_alumno` | enum | `INTERNO` / `CONVENIO` |
| `dni` | char(8) | |
| `nombres_convenio` | varchar(160) | Solo si `tipo_alumno = CONVENIO` |
| `id_matricula` | FK → `matricula` | |
| `id_asignacion` | FK → `asignacion_docente` | |
| `fecha` | date | |
| `estado` | enum | `ASISTIO` / `FALTO` / `TARDANZA` / `JUSTIFICADO` |

---

## 8. Pagos

```
comprobante_pago 1 ── * cuota 1 ── * pago 1 ── * auditoria_pago
```

### ComprobantePago (`comprobante_pago`)
Cada concepto de una matrícula genera su propio comprobante. Los ingresos
generales de caja (sin alumno) generan comprobantes con `id_matricula = null`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_comprobante` | PK | |
| `id_matricula` | FK → `matricula`, **nullable** | `null` = ingreso general (sin alumno) |
| `numero` | varchar(20) | N° de comprobante (`EXT-GEN-####` en ingresos generales) |
| `tipo` | enum | `BOLETA` / `FACTURA` / `RECIBO` / `NINGUNO` |
| `concepto` | varchar(30) | `MATRICULA`, `SIMULACRO`, `CARNET`, `EXTRAORDINARIO` |
| `categoria` | varchar(60) | Categoría contable: valores del mantenedor `categoria_financiera` (tipo `INGRESO`) o del enum `CategoriaIngreso` (default `ACADEMICO`) |
| `descripcion` | varchar(255) | Concepto libre del cobro (máx. 60 en extraordinarios) |
| `fecha_emision` | date | |
| `costo_total` | decimal(8,2) | |
| `saldo_pendiente` | decimal(8,2) | |

### Cuota (`cuota`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id_cuota` | PK | |
| `id_comprobante` | FK → `comprobante_pago` | |
| `numero_cuota` | tinyint | |
| `monto` | decimal(8,2) | |
| `fecha_vencimiento` | date | |
| `estado` | enum | `PENDIENTE` / `PAGADA` / `VENCIDA` |

### Pago (`pago`)
Registro de un pago contra una cuota.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_pago` | PK | |
| `id_cuota` | FK → `cuota` | |
| `user_id` | FK → `users` | Quien registró el pago |
| `fecha_pago` | datetime | |
| `monto` | decimal(8,2) | |
| `metodo_pago` | enum | `EFECTIVO` / `YAPE` / `PLIN` / `TRANSFERENCIA` / `TARJETA` |
| `estado` | enum | `PAGADO` / `ANULADO` (default `PAGADO`) |

### AuditoriaPago (`auditoria_pago`)
Registro de auditoría de acciones sobre un pago (creación y anulación).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | PK | |
| `pago_id` | FK → `pago` | Pago auditado |
| `usuario_id` | FK → `users` | Quien ejecutó la acción |
| `accion` | varchar(50) | `CREAR` / `ANULACION` |
| `motivo` | text | Obligatorio al anular |
| `created_at` | timestamp | Momento del registro |

**Reglas:** la anulación de un pago (`estado` → `ANULADO`) es irreversible, recalcula `saldo_pendiente` del comprobante y el estado de la cuota (excluyendo pagos `ANULADO`), y registra una entrada en `auditoria_pago` con `accion = ANULACION` y `motivo` obligatorio.

---

## 10. Egresos

```
egreso 1 ── * auditoria_egreso
```

### Egreso (`egreso`)
Registro contable de gastos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_egreso` | PK | |
| `fecha` | date | |
| `tipo_egreso` | varchar(60) | |
| `categoria` | varchar(60) | Categoría contable: valores del mantenedor `categoria_financiera` (tipo `EGRESO`) o del enum `CategoriaEgreso` (default `OPERATIVO`) |
| `descripcion` | varchar(160) | |
| `cantidad` | decimal(8,2) | |
| `precio` | decimal(8,2) | |
| `igv` | decimal(8,2) | |
| `total` | decimal(10,2) | Columna generada: `cantidad * precio + igv` |
| `metodo_pago` | enum | `EFECTIVO` / `TRANSFERENCIA` / `TARJETA` / `YAPE` / `PLIN` |
| `tipo_comprobante` | enum | `FACTURA` / `BOLETA` / `RECIBO` / `NINGUNO` |
| `personal` | varchar(120) | |
| `user_id` | FK → `users` | |
| `estado` | enum | `REGISTRADO` / `ANULADO` (default `REGISTRADO`) |

### AuditoriaEgreso (`auditoria_egreso`)
Registro de auditoría de anulaciones de egresos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | PK | |
| `egreso_id` | FK → `egreso` | Egreso auditado |
| `usuario_id` | FK → `users` | Quien ejecutó la acción |
| `accion` | varchar(50) | `ANULACION` |
| `motivo` | text | Obligatorio al anular |
| `created_at` | timestamp | Momento del registro |

**Reglas:** la anulación de un egreso (`estado` → `ANULADO`) es irreversible, requiere `motivo` obligatorio y permiso `pagos.eliminar`, y registra una entrada en `auditoria_egreso` con `accion = ANULACION`. Los egresos anulados no cuentan en el total de egresos de la caja.

### CategoriaFinanciera (`categoria_financiera`)
Catálogo gestionable de categorías contables para ingresos y egresos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | PK | |
| `nombre` | varchar(60) | Único por `tipo` |
| `tipo` | enum | `INGRESO` / `EGRESO` |
| `descripcion` | varchar(160) | Nullable |
| `es_por_defecto` | boolean | Única por `tipo` |
| `created_at` / `updated_at` | timestamp | |

**Reglas:** la categoría por defecto es única por `tipo` (`setDefault` desmarca las demás del mismo tipo). No se elimina la categoría por defecto ni una en uso por `egreso.categoria` o `comprobante_pago.categoria`. `comprobante_pago.categoria` y `egreso.categoria` se almacenan como string libre (valores del mantenedor o de los enums `CategoriaIngreso` / `CategoriaEgreso` como fallback).

---

## 11. Configuración

### Configuracion (`configuracion`)
Pares clave-valor para settings del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | PK | |
| `clave` | varchar(100) | |
| `valor` | text | |

---

## Conexiones entre entidades

### Área como punto de unión

```
Contexto Carreras:  área → carrera → alumno → matrícula
Contexto Exámenes:  área → examen
                    área → examen_metrica (métricas por área)
                    examen → examen_pregunta → examen_respuesta
```

En exámenes, el área del alumno se determina vía: `alumno → carrera → area`.

### Flujo completo de matrícula

```
periodo_academico → ciclo (seleccionas el ciclo)
area → carrera → alumno (elige carrera al registrarse)
matricula = alumno + ciclo + turno
(el aula ya no se asigna en la matrícula; queda nullable en `matricula.id_aula`)
cada costo (matrícula, simulacro, carnet) → comprobante_pago → cuotas → pagos
```

### Flujo de horarios

```
ciclo → asignacion_docente → curso
                            → docente
                            → aula
                            → horarios (día semana + hora)
```

---

## Resumen de dónde se gestiona cada cosa

| Entidad | Página (ruta) | Controlador |
|---|---|---|
| Áreas | Catálogo Académico (`/matriculas/catalogo`) | `CatalogoAcademicoController` |
| Carreras | Catálogo Académico (`/matriculas/catalogo`) | `CatalogoAcademicoController` |
| Cursos (catálogo) | Catálogo Académico (`/matriculas/catalogo`) | `CatalogoAcademicoController` |
| Cursos + horarios | Gestión de Cursos (`/cursos`) | `CursoController` |
| Ciclos | Gestión de Cursos | `CursoController::storeCiclo` |
| Aulas | Gestión de Cursos / Ajustes | `CursoController` / `ConfiguracionController` |
| Exámenes | Notas (`/notas`, `/notas/cargar`) | `ExamenController` (import ZipGrade vía `ZipGradeParser`) |
| Alumnos | Matrículas → Estudiantes (`/matriculas/estudiantes`) | `EstudianteWebController` |
| Matrículas | Matrículas → Nueva (`/matriculas/nueva`) | `MatriculaWebController` |
| Asistencias | Asistencias (`/asistencias`) | `AsistenciaController` / `LectorAsistenciaController` |
| Pagos / Cuotas | Tesorería (`/tesoreria/estado-cuenta`) | `EstadoCuentaController` |
| Movimientos (libro diario) | Tesorería (`/tesoreria/movimientos`) | `EstadoCuentaController::movimientos` |
| Egresos | Tesorería Caja (`/tesoreria/caja`) | `EgresoController` |
| Categorías financieras | Tesorería (`/tesoreria/categorias`) | `CategoriaFinancieraController` |
| Reportes | Reportes (`/reportes`) | `ReportesController` |
| Ajustes (turnos, periodos, colegios) | Ajustes (`/ajustes`) | `ConfiguracionController` |

---

## Notas importantes

- **`area` y `area_conoc` NO son lo mismo.** `area` es una tabla FK real; `area_conoc` en `curso` es texto libre.
- **Un curso es global.** La asignación de docente, aula, ciclo y horarios va en `asignacion_docente`.
- **Un curso solo una vez por ciclo** (unique `id_curso, id_ciclo`).
- **Los rankings de exámenes** se agrupan por área de la carrera del alumno.
- **Cada concepto de matrícula** (matrícula, simulacro, carnet) genera su propio `ComprobantePago` con cuotas independientes.
- **Carnet siempre 1 cuota.**
- **El módulo de egresos** se gestiona desde Tesorería → Caja General (`/tesoreria/caja`): registro, listado y **anulación** de egresos con categoría del catálogo `categoria_financiera` (tipo `EGRESO`) o del enum `CategoriaEgreso` como fallback.
- **Las categorías contables** (ingresos y egresos) se gestionan desde Tesorería → Categorías Financieras (`/tesoreria/categorias`); los formularios de caja y pagos extraordinarios consumen el catálogo dinámico con fallback a los enums.
- **Justificado** es un estado válido de asistencia además de ASISTIO, FALTO y TARDANZA.
