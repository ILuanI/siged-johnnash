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
| `id_aula` | FK → `aula` | |
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
                1 ── * examen_metrica (por área)
```

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
| `puntaje_total` | decimal(7,3) | aptitud + conocimiento |
| `puesto` | smallint | Ranking dentro del área |

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
comprobante_pago 1 ── * cuota 1 ── * pago
```

### ComprobantePago (`comprobante_pago`)
Cada concepto de una matrícula genera su propio comprobante.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_comprobante` | PK | |
| `id_matricula` | FK → `matricula` | |
| `numero` | varchar(20) | N° de comprobante |
| `tipo` | enum | `BOLETA` / `FACTURA` / `RECIBO` / `NINGUNO` |
| `concepto` | varchar(30) | `MATRICULA`, `SIMULACRO`, `CARNET`, `EXTRAORDINARIO` |
| `descripcion` | varchar(255) | |
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

---

## 9. Predicción de Deserción

### PrediccionDesercion (`prediccion_desercion`)
Generada por el módulo de IA.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_prediccion` | PK | |
| `id_matricula` | FK → `matricula` | |
| `fecha_calculo` | datetime | |
| `riesgo_pct` | decimal(5,2) | % de riesgo |
| `nivel_riesgo` | enum | `BAJO` / `MEDIO` / `ALTO` |
| `prioritario` | tinyint(1) | Flag de alerta |
| `tasa_asistencia` | decimal(5,2) | Feature de entrada |
| `promedio_examenes` | decimal(7,3) | Feature de entrada |
| `cuotas_vencidas` | tinyint | Feature de entrada |

---

## 10. Egresos

### Egreso (`egreso`)
Registro contable de gastos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_egreso` | PK | |
| `fecha` | date | |
| `tipo_egreso` | varchar(60) | |
| `descripcion` | varchar(160) | |
| `cantidad` | decimal(8,2) | |
| `precio` | decimal(8,2) | |
| `igv` | decimal(8,2) | |
| `total` | decimal(10,2) | |
| `metodo_pago` | enum | `EFECTIVO` / `TRANSFERENCIA` / `TARJETA` / `YAPE` / `PLIN` |
| `tipo_comprobante` | enum | `FACTURA` / `BOLETA` / `RECIBO` / `NINGUNO` |
| `personal` | varchar(120) | |
| `user_id` | FK → `users` | |

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
```

En exámenes, el área del alumno se determina vía: `alumno → carrera → area`.

### Flujo completo de matrícula

```
periodo_academico → ciclo (seleccionas el ciclo)
area → carrera → alumno (elige carrera al registrarse)
matricula = alumno + ciclo + turno + aula
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
| Exámenes | Notas (`/notas`, `/notas/cargar`) | `ExamenController` |
| Alumnos | Matrículas → Estudiantes (`/matriculas/estudiantes`) | `EstudianteWebController` |
| Matrículas | Matrículas → Nueva (`/matriculas/nueva`) | `MatriculaWebController` |
| Asistencias | Asistencias (`/asistencias`) | `AsistenciaController` / `LectorAsistenciaController` |
| Pagos / Cuotas | Tesorería (`/tesoreria/estado-cuenta`) | `EstadoCuentaController` |
| Reportes | Reportes (`/reportes`) | `ReportesController` |
| IA Deserción | IA (`/ia/desercion`) | `DesercionController` |
| Ajustes (turnos, periodos, colegios) | Ajustes (`/ajustes`) | `ConfiguracionController` |

---

## Notas importantes

- **`area` y `area_conoc` NO son lo mismo.** `area` es una tabla FK real; `area_conoc` en `curso` es texto libre.
- **Un curso es global.** La asignación de docente, aula, ciclo y horarios va en `asignacion_docente`.
- **Un curso solo una vez por ciclo** (unique `id_curso, id_ciclo`).
- **Los rankings de exámenes** se agrupan por área de la carrera del alumno.
- **Cada concepto de matrícula** (matrícula, simulacro, carnet) genera su propio `ComprobantePago` con cuotas independientes.
- **Carnet siempre 1 cuota.**
- **El módulo de egresos** existe en BD pero no tiene UI implementada.
- **Justificado** es un estado válido de asistencia además de ASISTIO, FALTO y TARDANZA.
