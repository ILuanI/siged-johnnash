# Flujo: Pagos y Estado de Cuenta

## Ciclo de vida de un pago (desde la matrícula)

### 0. Visualización en el perfil del alumno (solo lectura)

**Frontend**
- `resources/js/components/matriculas/student-profile-modal.tsx` → tab `pagos`: renderiza `consolidado.finanzas` (producido por `ConsolidadoAlumnoService`) con resumen Costo Total / Pagado / Saldo Pendiente, semáforo `SemaforoPagos`, tabla de cuotas con badges por estado y tabla de pagos realizados.
- Reutiliza el mismo diseño que `resources/js/pages/dashboard.tsx` (sección "Estado Financiero").

### 1. Formalización de matrícula → creación de comprobantes

**Backend**
- `app/Http/Controllers/Matriculas/MatriculaWebController.php` → `store()`: al guardar la matrícula, llama a los servicios de pago para generar comprobantes.
- `app/Services/Matriculas/MatriculaFormalizacionService.php`: crea un `ComprobantePago` por cada concepto (MATRICULA, SIMULACRO, CARNET) con sus cuotas correspondientes.
- Regla: CARNET siempre 1 cuota. MATRICULA y SIMULACRO usan `cuotas_matricula` y `cuotas_simulacro` de la matrícula.

### 1.5. Pago de primera cuota desde la formalización

**Frontend**
- `resources/js/pages/matriculas/nueva.tsx`: botón "Guardar y Pagar 1ra Cuota" + selector de método de pago en el comprobante preview.
- `handleSaveAndPay()`: usa `transform()` para enviar `pagar_ahora: true` junto con los datos de la matrícula.

**Backend**
- `MatriculaWebController::store()`: si `pagar_ahora = true`, después de formalizar itera los comprobantes y paga la 1ra cuota de MATRICULA + SIMULACRO, y todas las cuotas de CARNET.
- Redirige a `tesoreria.estado-cuenta.show` en lugar de la lista de estudiantes.

### 2. Consulta de estado de cuenta

**Frontend**
- `resources/js/pages/tesoreria/estado-cuenta.tsx`: lista de alumnos con selector, tabla de cuotas agrupadas por comprobante.

**Backend**
- `app/Http/Controllers/Tesoreria/EstadoCuentaController.php`:
  - `index()`: lista todos los alumnos con su estado de cuenta resumido.
  - `show(Alumno $alumno)`: detalle de cuotas del alumno, con badge de concepto (MATRICULA, SIMULACRO, CARNET, EXTRAORDINARIO).

**Modelos involucrados:**
- `app/Models/ComprobantePago.php` → relación con `cuotas()`
- `app/Models/Cuota.php` → relación con `pagos()`
- `app/Models/Pago.php`

### 3. Pago de cuota

**Frontend**
- Botón "Pagar" por cuota en la tabla de estado de cuenta.

**Backend**
- `EstadoCuentaController::pagar(Cuota $cuota)`: registra un `Pago` contra la cuota con `fecha_pago = now()->toDateTimeString()` (fecha y hora exactas), actualiza `saldo_pendiente` del comprobante.
- Valida: no pagar una cuota ya `PAGADA`.

### 4. Prórroga de cuota

**Frontend**
- Botón "Prorrogar" por cuota (extiende fecha de vencimiento).

**Backend**
- `EstadoCuentaController::prorrogar(Cuota $cuota)`: modifica `fecha_vencimiento`.

### 5. Pago extraordinario / ingreso general

**Frontend**
- `resources/js/pages/tesoreria/pago-extraordinario.tsx`: formulario con:
  - Checkbox **"¿Este ingreso pertenece a un estudiante?"** (por defecto SÍ; desactivado = ingreso general de caja sin alumno).
  - Si está activo: `Combobox` de alumno con filtrado en tiempo real por DNI / nombres / apellidos.
  - **Concepto / Tipo de Cobro**: selector con conceptos comunes (Examen, Simulacro, Certificado, Material educativo, Donación, Alquiler) o la opción "Otro / Personalizado" que muestra un input libre (máx. 60 caracteres).
  - **Categoría Contable** (`ACADEMICO` / `SERVICIOS` / `EVENTOS` / `ADMINISTRATIVO` / `OTROS`, default `ACADEMICO`).

**Backend**
- `app/Http/Controllers/Tesoreria/PagoExtraordinarioController.php`:
  - `create()`: muestra formulario.
  - `store()`: valida `id_alumno` (`nullable`, `exists:alumno,id_alumno`), `descripcion` (requerida, max 60), `categoria` con `Rule::enum(CategoriaIngreso::class)` (opcional).
    - Si `id_alumno` viene y el alumno tiene matrícula vigente → comprobante vinculado a esa matrícula y redirige a `estado-cuenta.show`.
    - Si `id_alumno` viene pero no hay matrícula vigente, o no viene → **ingreso general** (`id_matricula = null`) y redirige a `tesoreria.caja.index`.
- `app/Services/Tesoreria/PagoExtraordinarioService.php`: `registrar()` acepta `?Matricula $matricula` (null = ingreso general) y `?CategoriaIngreso $categoria`, delega a `PlanPagoMatriculaService::generar()`.
- `app/Services/Tesoreria/PlanPagoMatriculaService.php`: `generar()` acepta `?Matricula $matricula`; con `null` crea el comprobante con `id_matricula = null`, sin idempotencia y numeración `EXT-GEN-####`; si es `null` asigna por defecto según concepto (`MATRICULA` → `ACADEMICO`, `SIMULACRO` → `EVENTOS`, `CARNET` → `SERVICIOS`, `EXTRAORDINARIO` → `ADMINISTRATIVO`).

### 6. Plantillas WhatsApp

**Backend**
- `EstadoCuentaController::updateWhatsappTemplates()`: actualiza plantillas de notificación para cobranza.
- Almacenadas como `configuracion` (pares clave-valor en tabla `configuracion`).

### 7. Anulación de pago

**Frontend**
- Botón "Anular" por pago en el estado de cuenta, con modal que exige el `motivo`.

**Backend**
- `EstadoCuentaController::anularPago(Pago $pago)`:
  - Autoriza vía `PagoPolicy::delete` (permiso `pagos.eliminar`).
  - Requiere `motivo` (obligatorio, max 500).
  - Rechaza pagos ya `ANULADO`.
  - Dentro de una transacción: bloquea la cuota con `lockForUpdate()`, cambia el `estado` del pago a `ANULADO`, registra en `auditoria_pagos` (`accion = ANULACION`), recalcula el estado de la cuota y el `saldo_pendiente` del comprobante (excluyendo pagos `ANULADO`).

### 8. Reporte de movimientos (libro diario)

**Frontend**
- `resources/js/pages/tesoreria/movimientos.tsx`: libro diario consolidado de **pagos (ingresos)** y **egresos (salidas)**, con filtros (rango de fechas, tipo, método de pago, estado) y ordenamiento por fecha/monto.
- Un pago o egreso anulado se descompone en dos líneas: el movimiento original (positivo para pagos, negativo para egresos) y su **reverso de anulación** (signo opuesto), con tooltip de auditoría (`AuditoriaAnulacionTooltip`) que muestra quién anuló, cuándo y el motivo.
- Filtro **Tipo**: `Todos` / `Ingresos` / `Egresos`.

**Backend**
- `EstadoCuentaController::movimientos()`:
  - GET `/tesoreria/movimientos` (autoriza vía `PagoPolicy::viewAny`, permiso `pagos.ver`).
  - Consulta dos colecciones paginadas (15 c/u): `pagos` (con `cuota.comprobantePago.matricula.alumno`, `user`, `auditorias.usuario`) y `egresos` (con `user`, `auditorias.usuario`).
  - Filtros: `fecha_inicio`, `fecha_fin`, `metodo_pago` (solo pagos), `estado` (`PAGADO`/`REGISTRADO`/`ANULADO`), `tipo` (`todos`/`ingresos`/`egresos`).
  - Ordenamiento por `fecha_pago`/`fecha` o `monto`/`total` (asc/desc), paginado con `withQueryString`.

### 9. Egresos (Caja General)

**Frontend**
- `resources/js/pages/tesoreria/caja.tsx`: página de caja general con arqueo (ingresos por concepto, total egresos, saldo disponible), tabla de egresos y últimos ingresos.
- Modal "Registrar Egreso / Salida de Dinero": campos concepto, **categoría** (Select con `OPERATIVO`, `ADMINISTRATIVO`, `MANTENIMIENTO`, `SERVICIOS`, `ACADEMICO`, `OTROS`; default `OPERATIVO`), descripción, cantidad, precio, fecha.
- Tabla de egresos: columna **Categoría** con `<Badge>` coloreado por categoría (`categoriaBadgeClass`), badge `ANULADO` para egresos anulados y botón **Anular** (`AnularEgresoDialog`) con modal que exige motivo obligatorio; los anulados muestran tooltip de auditoría.

**Backend**
- `EstadoCuentaController::caja()`: GET `/tesoreria/caja` — totales de ingresos/egresos, saldo, egresos paginados (15) con `user` y `auditorias.usuario`, pagos recientes. El total de egresos **excluye los anulados**.
- `EgresoController`:
  - `store()`: POST `/tesoreria/egresos` — valida `concepto`, `categoria` (`required` + catálogo `OPERATIVO`/`ADMINISTRATIVO`/`MANTENIMIENTO`/`SERVICIOS`/`ACADEMICO`/`OTROS` vía `CategoriaEgreso`), `descripcion`, `cantidad`, `precio`, `igv`, `fecha`; crea `Egreso` con `user_id = auth()->id()`, `estado = REGISTRADO` (default) y `fecha` = fecha seleccionada por el usuario combinada con la hora actual del registro (`Carbon::parse($validated['fecha'])->setTimeFromTimeString(now()->toTimeString())`); el día elegido en el formulario se respeta y solo se sobreescribe la hora con la del momento del guardado.
  - `update()`: PUT `/tesoreria/egresos/{egreso}` — misma validación (incluye el catálogo estricto de `categoria`), actualiza el egreso con `fecha` = fecha seleccionada por el usuario combinada con la hora actual del registro (mismo criterio que `store`).
  - `anular()`: POST `/tesoreria/egresos/{egreso}/anular` — autoriza vía `EgresoPolicy::delete` (permiso `pagos.eliminar`), exige `motivo` (obligatorio, max 500), rechaza egresos ya `ANULADO`; en transacción cambia `estado` a `ANULADO` y registra en `auditoria_egreso` (`accion = ANULACION`). Sustituye al antiguo hard delete.

**Modelos involucrados:**
- `app/Models/Egreso.php` → tabla `egreso`, PK `id_egreso`, `$guarded = []`, `$appends = ['concepto']` (mapea `tipo_egreso`), cast `fecha` → `datetime`, `estado` (`REGISTRADO`/`ANULADO`), relaciones `user()` y `auditorias()`.
- `app/Models/AuditoriaEgreso.php` → tabla `auditoria_egreso` (solo `created_at`), relaciones `egreso()` y `usuario()`.

### 10. Mantenedor de categorías financieras

**Frontend**
- `resources/js/pages/tesoreria/categorias.tsx`: página con dos tablas (Ingresos / Egresos), modal de crear/editar (nombre, tipo, descripción) y botones por fila: **Establecer por defecto**, **Editar**, **Eliminar** (con confirmación). Respeta permisos: editar requiere `pagos.editar`, eliminar `pagos.eliminar`. Debajo del header muestra un banner informativo (`Alert`) que explica que la categoría **Por defecto** (⭐) se preselecciona automáticamente en el modal de registrar egreso y en el formulario de pago extraordinario/ingreso, y que solo puede existir una por tipo. Al establecer una categoría por defecto se muestra `toast.success('Categoría establecida como por defecto correctamente.')`.
- Accesible desde el sidebar ("Categorías Financieras") y desde el header de `caja.tsx`.
- `caja.tsx` y `pago-extraordinario.tsx` consumen las categorías dinámicas (`categoriasEgreso` / `categoriasIngreso` recibidas como props desde el backend) con fallback a los catálogos fijos `CATEGORIAS_EGRESO` / `CATEGORIAS_INGRESO`. El valor preseleccionado es el marcado `es_por_defecto`.

**Backend**
- `app/Http/Controllers/Tesoreria/CategoriaFinancieraController.php`:
  - `index()`: `GET /tesoreria/categorias` → renderiza `tesoreria/categorias` con todas las categorías (ordenadas por tipo, default primero).
  - `store()`: `POST /tesoreria/categorias` — valida `nombre` (requerido, max 60, único por `tipo`), `tipo` (`Rule::enum(TipoCategoriaFinanciera)`), `descripcion` (nullable, max 160).
  - `update()`: `PUT /tesoreria/categorias/{categoria}` — misma validación ignorando el propio id.
  - `destroy()`: `DELETE /tesoreria/categorias/{categoria}` — rechaza la categoría por defecto y las que estén en uso por `egreso.categoria` o `comprobante_pago.categoria`.
  - `setDefault()`: `POST /tesoreria/categorias/{categoria}/default` — en transacción desmarca las demás del mismo `tipo` y marca la indicada.
- `app/Models/CategoriaFinanciera.php` → tabla `categoria_financiera` (PK `id`), cast `tipo` → `TipoCategoriaFinanciera`, `es_por_defecto` → boolean.
- `app/Enums/TipoCategoriaFinanciera.php` → `INGRESO` / `EGRESO`.
- `database/seeders/CategoriaFinancieraSeeder.php`: valores iniciales (5 ingreso, 6 egreso; default `ACADEMICO` y `OPERATIVO`).
- Validación de `categoria` en `EgresoController` y `PagoExtraordinarioController`: `Rule::in(categorias del mantenedor ∪ valores del enum)` — acepta categorías personalizadas con fallback a los enums.
- `ComprobantePago::categoria` dejó de castear al enum `CategoriaIngreso` y se almacena como string libre.

---

## Diagrama de flujo

```
Matrícula formalizada
  → ComprobantePago (MATRICULA) + cuotas
  → ComprobantePago (SIMULACRO) + cuotas
  → ComprobantePago (CARNET) + 1 cuota

[Opcional] Pago desde matrícula nueva
  → POST /matriculas/nueva { pagar_ahora: true, metodo_pago }
  → Paga 1ra cuota MATRICULA + 1ra cuota SIMULACRO + CARNET completo
  → Redirige a estado de cuenta del alumno

Usuario ve estado de cuenta
  → GET /tesoreria/estado-cuenta
  → GET /tesoreria/estado-cuenta/{alumno}

Usuario paga cuota
  → POST /tesoreria/cuotas/{cuota}/pagar
  → Crea Pago, actualiza saldo_pendiente

Usuario prorroga cuota
  → POST /tesoreria/cuotas/{cuota}/prorrogar
  → Actualiza fecha_vencimiento

Pago extraordinario / ingreso general
  → GET /tesoreria/pago-extraordinario/nuevo
  → POST /tesoreria/pago-extraordinario { id_alumno?, descripcion, monto, categoria }
  → Con alumno y matrícula vigente: ComprobantePago (EXTRAORDINARIO) vinculado → redirige a estado-cuenta
  → Sin alumno o sin matrícula vigente: ComprobantePago (EXTRAORDINARIO) con id_matricula = null (EXT-GEN-####) → redirige a caja

Anulación de pago
  → POST /tesoreria/pagos/{pago}/anular { motivo }
  → Valida estado PAGADO y motivo obligatorio
  → Cambia estado a ANULADO, recalcula saldo_pendiente
  → Registra en auditoria_pagos

Reporte de movimientos
  → GET /tesoreria/movimientos
  → Libro diario consolidado: pagos (ingresos) + egresos (salidas)
  → Filtro por tipo (todos/ingresos/egresos), fechas, método, estado
  → Anulados se descomponen en movimiento original + reverso con auditoría

Egresos (caja general)
  → GET /tesoreria/caja
  → POST /tesoreria/egresos { concepto, categoria, descripcion, cantidad, precio, igv, fecha }
  → PUT /tesoreria/egresos/{egreso}
  → POST /tesoreria/egresos/{egreso}/anular { motivo }  (estado → ANULADO + auditoria_egreso)

Mantenedor de categorías financieras
  → GET /tesoreria/categorias (lista Ingresos / Egresos)
  → POST /tesoreria/categorias { nombre, tipo, descripcion? }
  → PUT /tesoreria/categorias/{categoria}
  → POST /tesoreria/categorias/{categoria}/default  (única por tipo)
  → DELETE /tesoreria/categorias/{categoria}  (rechaza por defecto o en uso)
  → caja.tsx / pago-extraordinario.tsx consumen categoriasEgreso / categoriasIngreso con fallback a enums
```
