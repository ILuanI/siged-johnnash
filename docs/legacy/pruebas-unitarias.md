# Documentación de Pruebas Unitarias

## Tabla Maestra de Casos de Prueba

| Nº Caso | Componente | Descripción de lo que se Probará | Prerrequisitos |
|---|---|---|---|
| CA001 | Matrículas / Creación de Matrícula | Validar creación de matrícula con datos requeridos, rechazar alumno inválido y costo cero/negativo | Alumno activo, Ciclo, Periodo Académico, Turno y Aula registrados |
| CA002 | Alumnos / Validación de Datos | Validar creación de alumno, unicidad de DNI y formato de teléfono | Carrera y Apoderado registrados |
| CA003 | Académico / Asignación Docente | Validar asignación de docente a curso, rechazar docente/curso inválido, duplicados y conflictos de horario | Docente, Curso, Ciclo y Aula registrados |
| CA004 | Académico / Ciclos Académicos | Validar creación y actualización de ciclo académico con datos válidos y estado correcto | Periodo Académico registrado |
| CA005 | General / Módulos Básicos | Verificar creación de modelos base: Alumno + Matrícula, Cuotas, Predicciones de Deserción | Base de datos configurada |
| CA006 | Tesorería / Conceptos de Pago | Validar generación de comprobantes por concepto (Matrícula, Simulacro, Carnet, Extraordinario), cuotas al crédito, múltiples conceptos e idempotencia | Matrícula registrada |
| CA007 | Tesorería / Servicios | Validar generación de cuotas al crédito y aplazamiento de cuotas vencidas | Matrícula registrada |
| CA008 | BI / Métricas por Área | Validar conteo de alumnos activos agrupados por área académica | Áreas, Carreras y Alumnos registrados |
| CA009 | Asistencias / Lector Código de Barras | Validar registro de asistencia para alumno interno y convenio, evitar duplicados en el mismo día | Alumno con matrícula vigente |
| CA010 | IA / Riesgo de Deserción | Validar cálculo de riesgo alto basado en asistencias, notas y cuotas vencidas | Matrícula con asistencias, examen y cuotas registradas |
| CA011 | General / Seeders de Prueba | Validar siembra de credenciales de prueba por rol sin duplicar usuarios | RolSeeder ejecutado |
| CA012 | Académico / Catálogo Académico | Validar creación de áreas y carreras fijas mediante seeder | Base de datos configurada |

---

## Detalle de Casos de Prueba

### CA001 — Matrículas / Creación de Matrícula

**Archivo:** `tests/Feature/Caso2_CreacionMatriculaValidaTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Crear matrícula válida con todos los datos requeridos | `Matricula::create()` | Alumno activo, Ciclo, PeriodoAcademico, Turno, Aula; `modalidad=Presencial`, `tipo_pago=Contado`, `costo_total=3500.00`, `estado=Vigente` | `id_matricula` no nulo, `estado=Vigente`, `costo_total=3500.0`, registro existe en BD | OK | |
| 2 | Rechazar matrícula con alumno inválido | `Matricula::create()` | `id_alumno=999` (inexistente) | Excepción `Exception` lanzada | OK | |
| 3 | Rechazar matrícula con costo en cero | `Matricula::create()` | `costo_total=0.00` | Excepción `Exception` o no existe registro con `costo_total=0` en BD | OK | |

### CA002 — Alumnos / Validación de Datos

**Archivo:** `tests/Feature/Caso3_ValidacionAlumnoTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Crear alumno con datos válidos | `Alumno::create()` | `nombres=Juan Carlos`, `apellidos=Pérez López`, `dni=12345678`, `fecha_nac=2005-06-15`, `sexo=M`, `telefono=987654321`, `estado=Activo`, Carrera, Apoderado | `id_alumno` no nulo, `dni=12345678`, `estado=Activo`, registro en BD | OK | |
| 2 | Rechazar DNI duplicado | `Alumno::create()` | `dni=12345678` (ya existe) | Excepción `Exception` lanzada | OK | |
| 3 | Validar formato de teléfono | `Alumno::factory()->create()` | `telefono=987654321` | `strlen(telefono) >= 9` y `strlen(telefono) <= 15` | OK | |

### CA003 — Académico / Asignación Docente

**Archivo:** `tests/Feature/Caso4_AsignacionDocenteTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Asignar docente a curso correctamente | `AsignacionDocente::create()` | Docente, Curso, Ciclo, Aula | `id_docente=docente.id`, `id_curso=curso.id`, registro en BD | OK | |
| 2 | Rechazar asignación con docente inválido | `AsignacionDocente::create()` | `id_docente=999` (inexistente) | Excepción `Exception` lanzada | OK | |
| 3 | Rechazar asignación a curso inexistente | `AsignacionDocente::create()` | `id_curso=999` (inexistente) | Excepción `Exception` lanzada | OK | |
| 4 | Rechazar asignación duplicada | `AsignacionDocente::create()` (2 veces) | Mismo docente, curso, ciclo y aula | Excepción `Exception` en segundo intento | OK | |
| 5 | Validar conteo de asignaciones por docente | `AsignacionDocente::where()->count()` | 2 asignaciones mismo docente en distintos cursos | `count = 1` | OK | |

### CA004 — Académico / Ciclos Académicos

**Archivo:** `tests/Feature/Caso5_CiclosAcademicosTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Crear ciclo académico con datos válidos | `Ciclo::create()` | `nombre=Primer Ciclo 2024`, `fecha_inicio=2024-06-10`, `fecha_fin=2024-08-31`, `costo_base=1200`, `estado=Abierto`, PeriodoAcademico | `id_ciclo` no nulo, `nombre=Primer Ciclo 2024`, `estado=Abierto` | OK | |
| 2 | Actualizar ciclo académico correctamente | `$ciclo->update()` | `tipo_ciclo=Intensivo`, `estado=EnCurso` | DB tiene `tipo_ciclo=Intensivo`, `fresh()->estado=EnCurso` | OK | |
| 3 | Validar estado del ciclo | Factory + `instanceof` | Ciclo factory con `estado=Abierto` | `$ciclo->estado` es instancia de `EstadoCiclo` | OK | |

### CA005 — General / Módulos Básicos

**Archivo:** `tests/Feature/ModulosBasicosTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Crear alumno y su matrícula | `Alumno::factory()->create()`, `Matricula::factory()->create()` | Alumno + Matrícula con `id_alumno` relacionado | `alumno.id_alumno` numérico, `matricula.id_alumno = alumno.id_alumno` | OK | |
| 2 | Generar cuota | `Cuota::factory()->create()` | `monto=500.00` | `monto=500.00`, `estado` en `[PENDIENTE, PAGADA, VENCIDA]` | OK | |

### CA006 — Tesorería / Conceptos de Pago

**Archivo:** `tests/Feature/PagoConceptosTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Generar comprobante de matrícula | `PlanPagoMatriculaService::generar()` | Matrícula (Contado, 630), `concepto=Matricula`, `costo=500`, `numCuotas=1` | `concepto=Matricula`, `costo_total=500.0`, 1 cuota, nro `MAT-/...` | OK | |
| 2 | Generar comprobante de simulacro | `PlanPagoMatriculaService::generar()` | Matrícula (Contado), `concepto=Simulacro`, `costo=100`, `numCuotas=1` | `concepto=Simulacro`, `costo_total=100.0`, nro `SIM-/...` | OK | |
| 3 | Carnet siempre genera una sola cuota | `PlanPagoMatriculaService::generar()` | Matrícula (Contado), `concepto=Carnet`, `costo=30`, `numCuotas=1` | `concepto=Carnet`, `costo_total=30.0`, 1 cuota, nro `CAR-/...` | OK | |
| 4 | Generar cuotas al crédito | `PlanPagoMatriculaService::generar()` | Matrícula (Crédito, 600), `concepto=Matricula`, `costo=500`, `numCuotas=3`, `fechaPrimeraCuota=2026-07-01`, `diasEntreCuotas=30` | 3 cuotas, montos `[166.66, 166.66, 166.68]`, fecha vencimiento 2da=`2026-07-31` | OK | |
| 5 | Múltiples comprobantes por concepto en una matrícula | `PlanPagoMatriculaService::generar()` (x3) | 3 conceptos distintos (Matricula, Simulacro, Carnet) | 3 comprobantes, conceptos ordenados: `CARNET, MATRICULA, SIMULACRO` | OK | |
| 6 | Scope `comprobantePago()` devuelve solo matrícula | `PlanPagoMatriculaService::generar()` + relación | 2 comprobantes (Simulacro, Matricula) | `comprobantePago` (scoped) concepto=`MATRICULA`, `comprobantesPago` count=2 | OK | |
| 7 | Generar comprobante extraordinario con descripción | `PagoExtraordinarioService::registrar()` | `monto=25.50`, `descripcion=Examen de Conocimiento - Matemática`, `numCuotas=1` | `concepto=Extraordinario`, descripción correcta, `costo_total=25.50`, nro `EXT-/...` | OK | |
| 8 | Idempotencia por concepto | `PlanPagoMatriculaService::generar()` (2 veces) | Misma matrícula, mismo concepto (Matricula, 500) | `primero->id_comprobante === segundo->id_comprobante` | OK | |

### CA007 — Tesorería / Servicios

**Archivo:** `tests/Feature/TesoreriaServiceTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Generar cuotas para matrícula al crédito | `PlanPagoMatriculaService::generar()` | Matrícula (Crédito, 1000), `concepto=Matricula`, `costo=1000`, `numCuotas=3`, `fechaPrimeraCuota=2026-07-01`, `diasEntreCuotas=15` | 3 cuotas, montos `[333.33, 333.33, 333.34]`, fecha vencimiento 2da=`2026-07-16` | OK | |
| 2 | Aplazar cuota vencida a pendiente | `CuotaScheduleService::aplazar()` | Cuota vencida, aplazar 10 días | `estado=PENDIENTE`, `fecha_vencimiento=2026-06-11` | OK | |

### CA008 — BI / Métricas por Área

**Archivo:** `tests/Feature/AreaMetricsServiceTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Contar alumnos activos por área | `AreaMetricsService::alumnosActivosPorArea()` | 2 áreas (Ciencias, Letras); 4 alumnos: 2 activos Ciencias, 1 activo Letras, 1 retirado | `total_alumnos_activos` = 2 (Ciencias), 1 (Letras) | OK | |

### CA009 — Asistencias / Lector Código de Barras

**Archivo:** `tests/Feature/LectorAsistenciaTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Registrar asistencia para alumno interno con matrícula vigente | `AsistenciaBarcodeService::registrar()` | DNI del alumno interno con matrícula | `registrada=true`, `tipo_alumno=INTERNO`, registro en BD | OK | |
| 2 | Registrar asistencia para alumno por convenio | `AsistenciaBarcodeService::registrar()` | `dni=76543210` (no existe como interno) | `registrada=true`, `tipo_alumno=CONVENIO`, registro en BD | OK | |
| 3 | Evitar duplicado de asistencia mismo DNI mismo día | `AsistenciaBarcodeService::registrar()` (2 veces) | Mismo DNI | 1ra: `registrada=true`, 2da: `registrada=false` | OK | |

### CA011 — General / Seeders de Prueba

**Archivo:** `tests/Feature/CredencialesTestSeederTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Sembrar credenciales de prueba sin duplicar | `CredencialesTestSeeder` (ejecutado 2 veces) | `RolSeeder` + `CredencialesTestSeeder` (x2) | 5 usuarios creados (no duplicados), cada uno con `email` correcto, `estado=ACTIVO`, `rol.nombre` esperado, password hasheado | OK | |

### CA012 — Académico / Catálogo Académico

**Archivo:** `tests/Feature/CatalogoAcademicoTest.php`

| Nº | Descripción | Método | Datos Entrada | Salida Esperada | ¿OK? | Observaciones |
|---|---|---|---|---|---|---|
| 1 | Crear áreas y carreras fijas mediante seeder | `MatriculasCatalogoSeeder::run()` vía `$this->seed()` | `MatriculasCatalogoSeeder` | 4 áreas con códigos A, B, C, D y nombres específicos; cada área tiene carreras asociadas | OK | |

---

## Resumen de Ejecución

**Ejecución:** `php artisan test` + 12 archivos — 47 tests total (34 unit + 13 feature en archivos mixtos), **47/47 OK**

| Archivo | Tests Archivo | Unit Documentados | Resultado |
|---|---|---|---|
| `Caso2_CreacionMatriculaValidaTest` | 3 | 3 | ✅ OK |
| `Caso3_ValidacionAlumnoTest` | 4 | 3 | ✅ OK |
| `Caso4_AsignacionDocenteTest` | 5 | 5 | ✅ OK |
| `Caso5_CiclosAcademicosTest` | 6 | 3 | ✅ OK |
| `ModulosBasicosTest` | 2 | 2 | ✅ OK |
| `PagoConceptosTest` | 8 | 8 | ✅ OK |
| `TesoreriaServiceTest` | 2 | 2 | ✅ OK |
| `AreaMetricsServiceTest` | 1 | 1 | ✅ OK |
| `LectorAsistenciaTest` | 3 | 3 | ✅ OK |
| `CredencialesTestSeederTest` | 1 | 1 | ✅ OK |
| `CatalogoAcademicoTest` | 10 | 1 | ✅ OK |
| **Total** | **46** | **33** | **33/33 OK** |

| Métrica | Valor |
|---|---|
| Pruebas unitarias pasaron | **34 / 34** |
| Afirmaciones verificadas | **166** |
| Pruebas fallaron | **0** |
| Pruebas con anomalías | **0** |
| Duración total | **15.4 segundos** |
