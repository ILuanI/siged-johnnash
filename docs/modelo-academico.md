# Modelo Académico — SIGED John Nash

## Visión general

El sistema maneja 4 grandes entidades que estructuran toda la información académica:

1. **Periodo Académico** → **Ciclos**
2. **Áreas** → **Carreras**
3. **Cursos**
4. **Exámenes**

Estas entidades son independientes entre sí pero se cruzan en varios puntos del sistema (matrículas, horarios, notas).

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

**Relaciones importantes:**
- Un ciclo pertenece a un **PeriodoAcademico**
- Un ciclo tiene **Matriculas** (alumnos matriculados en ese ciclo)
- Un ciclo tiene **AsignacionDocente** (cursos asignados a docentes en ese ciclo)
- Un ciclo tiene **Examenes** (evaluaciones en ese ciclo)

**¿Dónde se gestionan?** En la página "Gestión de Cursos" → Botón "Nuevo Ciclo Académico" en el header. Ruta: `POST /cursos/ciclos`.

---

## 2. Áreas y Carreras

```
area 1 ── * carrera 1 ── * alumno
```

### Área (`area`)
Representa una gran área de conocimiento o facultad. Se usa en dos contextos distintos:

1. **Postulación/Carreras** — Clasifica las carreras por área (ej. "A" → Ciencias, "B" → Letras).
2. **Exámenes** — Un examen pertenece a un área (SIMULACRO/parcial de un área específica). Además, las **métricas** de un examen se guardan por área para calcular rankings y puntajes máx/mín.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_area` | PK | |
| `codigo` | char(1) | "A", "B", "C" |
| `nombre` | varchar(80) | "Ciencias", "Letras" |

### Carrera (`carrera`)
Es la carrera profesional o programa al que un alumno postula o pertenece. Cada carrera pertenece a un área.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_carrera` | PK | |
| `id_area` | FK → `area` | |
| `nombre` | varchar(120) | "Medicina Humana", "Derecho" |
| `puntaje_min` / `puntaje_max` | decimal(7,3) | Rango de puntajes de admisión |

**Relaciones importantes:**
- Una carrera pertenece a un **Área**
- Una carrera tiene **Alumnos** (cada alumno tiene una carrera asignada)
- La carrera del alumno determina su **Área**, que se usa al calcular rankings de exámenes

**¿Dónde se gestionan?** En la página "Catálogo Académico" (`/matriculas/catalogo`). Rutas:
- Áreas: `POST /matriculas/areas`, `PATCH /matriculas/areas/{area}`, `DELETE /matriculas/areas/{area}`
- Carreras: `POST /matriculas/carreras`, `PATCH /matriculas/carreras/{carrera}`, `DELETE /matriculas/carreras/{carrera}`

---

## 3. Cursos

```
curso 1 ── * asignacion_docente (por ciclo)
```

### Curso (`curso`)
Es la materia o asignatura que se dicta. Los cursos son **globales** (existen independientemente del ciclo). La relación con un ciclo específico se da a través de `asignacion_docente`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_curso` | PK | |
| `nombre` | varchar(80) | "Álgebra", "Razonamiento Verbal" |
| `area_conoc` | varchar(40) | "Matemáticas", "Comunicación" |
| `color` | varchar(7) | Hex color para el horario |

**Importante:** `area_conoc` es solo una etiqueta textual del curso (ej. "Matemáticas", "Letras"). **NO se relaciona** con la tabla `area` (son conceptos independientes).

### AsignacionDocente (`asignacion_docente`)
Es el **puente** que conecta un curso con un docente, un ciclo y un aula. Una misma instancia del curso puede tener asignaciones distintas en cada ciclo.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_asignacion` | PK | |
| `id_docente` | FK → `docentes` | |
| `id_curso` | FK → `curso` | |
| `id_ciclo` | FK → `ciclo` | |
| `id_aula` | FK → `aula` | |

Cada asignación tiene **Horarios** (días de la semana y horas).

**¿Dónde se gestionan?** En la página "Gestión de Cursos" (`/cursos`). Rutas:
- CRUD de cursos + asignaciones: `Route::resource('cursos', CursoController)`
- Incluye asignación de docente, aula, ciclo y horarios

---

## 4. Exámenes

```
area 1 ── * examen 1 ── * resultado_examen
                1 ── * examen_metrica (por área)
```

### Examen (`examen`)
Evaluación que se realiza dentro de un ciclo específico.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_examen` | PK | |
| `id_ciclo` | FK → `ciclo` | |
| `tipo` | enum | `SIMULACRO`, `CONOCIMIENTO`, `SEMANAL` |
| `id_area` | FK → `area` | Área a la que pertenece el examen |
| `fecha` | date | |
| `numero` | smallint | Número de examen |

### ExamenMetrica (`examen_metrica`)
Guarda, por cada área, el puntaje máximo y mínimo de un examen. Se calcula automáticamente al guardar resultados.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_metrica` | PK | |
| `id_examen` | FK → `examen` | |
| `id_area` | FK → `area` | |
| `puntaje_max` / `puntaje_min` | decimal(7,3) | |

### ResultadoExamen (`resultado_examen`)
Nota individual de un alumno en un examen.

| Campo | Tipo | Descripción |
|---|---|---|
| `id_resultado` | PK | |
| `id_examen` | FK → `examen` | |
| `id_matricula` | FK → `matricula` | |
| `puntaje_aptitud` | decimal | |
| `puntaje_conocimiento` | decimal | |
| `puntaje_total` | decimal | aptitud + conocimiento |
| `puesto` | smallint | Ranking dentro del área |

**¿Dónde se gestionan?** En la página "Notas" → "Cargar Notas" (`/notas/cargar`). Se sube un CSV, se vinculan alumnos por DNI y se guardan los resultados. Los rankings por área se calculan automáticamente.

---

## 5. Conexiones entre entidades

### Área como punto de unión

La tabla `area` es la entidad más versátil porque se usa en **dos contextos distintos**:

```
Contexto Carreras:         área → carrera → alumno → matrícula
Contexto Exámenes:         área → examen (el examen pertenece a un área)
                           área → examen_metrica (métricas por área)
```

En los exámenes, el **área** de un alumno se determina a través de:
`alumno → carrera → area`. Así se agrupan los resultados por área para calcular rankings.

### Flujo completo de matrícula

```
periodo_academico ──→ ciclo (seleccionas el ciclo a matricular)
area ──→ carrera ──→ alumno (el alumno elige su carrera al registrarse)
matricula = alumno + ciclo + turno + aula
```

### Flujo de horarios

```
ciclo ──→ asignacion_docente ──→ curso
                                ──→ docente
                                ──→ aula
                                ──→ horarios (días + horas)
```

La página "Gestión de Cursos" muestra un horario semanal filtrando por ciclo.

---

## 6. Resumen de dónde se gestiona cada cosa

| Entidad | Página (ruta) | Controlador |
|---|---|---|
| Áreas | Catálogo Académico (`/matriculas/catalogo` — pestaña "Áreas") | `CatalogoAcademicoController` |
| Carreras | Catálogo Académico (`/matriculas/catalogo` — pestaña "Carreras") | `CatalogoAcademicoController` |
| Cursos (catálogo) | Catálogo Académico (`/matriculas/catalogo` — pestaña "Cursos") | `CatalogoAcademicoController` |
| Cursos + horarios | Gestión de Cursos (`/cursos`) | `CursoController` |
| Ciclos | Gestión de Cursos (header + botón "Nuevo Ciclo") | `CursoController::storeCiclo` |
| Aulas | Gestión de Cursos (modal "Nueva Aula") | `CursoController::storeAula` |
| Exámenes | Notas → Listado (`/notas`), Cargar (`/notas/cargar`) | `ExamenController` |

---

## 7. Notas importantes

- **`area` y `area_conoc` NO son lo mismo.** `area` es una tabla con código y nombre, usada para clasificar carreras y exámenes. `area_conoc` en `curso` es un texto libre que solo etiqueta la materia.
- **Un curso se crea una sola vez** (es global). La asignación de docente, aula, ciclo y horarios se hace por separado en `asignacion_docente`.
- **Los ciclos pertenecen a un periodo académico**, pero se pueden crear directamente desde la página de cursos. Si no hay un periodo abierto, se asigna automáticamente al último periodo registrado.
- **Los rankings de exámenes** se calculan agrupando a los alumnos por el área de su carrera (alumno → carrera → área), no por un campo directo del alumno.
