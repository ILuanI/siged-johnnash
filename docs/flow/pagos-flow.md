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
- `EstadoCuentaController::pagar(Cuota $cuota)`: registra un `Pago` contra la cuota, actualiza `saldo_pendiente` del comprobante.
- Valida: no pagar una cuota ya `PAGADA`.

### 4. Prórroga de cuota

**Frontend**
- Botón "Prorrogar" por cuota (extiende fecha de vencimiento).

**Backend**
- `EstadoCuentaController::prorrogar(Cuota $cuota)`: modifica `fecha_vencimiento`.

### 5. Pago extraordinario

**Frontend**
- `resources/js/pages/tesoreria/pago-extraordinario/`: formulario con concepto libre, descripción y monto.

**Backend**
- `app/Http/Controllers/Tesoreria/PagoExtraordinarioController.php`:
  - `create()`: muestra formulario.
  - `store()`: crea `ComprobantePago` con concepto `EXTRAORDINARIO` y sus cuotas.

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
- `resources/js/pages/tesoreria/movimientos.tsx`: tabla de movimientos con filtros (rango de fechas, método de pago, estado) y ordenamiento por fecha/monto.

**Backend**
- `EstadoCuentaController::movimientos()`:
  - GET `/tesoreria/movimientos` (autoriza vía `PagoPolicy::viewAny`, permiso `pagos.ver`).
  - Filtros: `fecha_inicio`, `fecha_fin`, `metodo_pago`, `estado` (`PAGADO`/`ANULADO`).
  - Ordenamiento por `fecha_pago` o `monto` (asc/desc), paginado (15) con `withQueryString`.
  - Carga `cuota.comprobantePago.matricula.alumno`, `user` y `auditorias.usuario`.

### 9. Egresos (Caja General)

**Frontend**
- `resources/js/pages/tesoreria/caja.tsx`: página de caja general con arqueo (ingresos por concepto, total egresos, saldo disponible), tabla de egresos y últimos ingresos.
- Modal "Registrar Egreso / Salida de Dinero": campos concepto, **categoría** (Select con `OPERATIVO`, `ADMINISTRATIVO`, `MANTENIMIENTO`, `SERVICIOS`, `ACADEMICO`, `OTROS`; default `OPERATIVO`), descripción, cantidad, precio, fecha.
- Tabla de egresos: columna **Categoría** con `<Badge>` coloreado por categoría (`categoriaBadgeClass`).

**Backend**
- `EstadoCuentaController::caja()`: GET `/tesoreria/caja` — totales de ingresos/egresos, saldo, egresos paginados (15) con `user`, pagos recientes.
- `EgresoController`:
  - `store()`: POST `/tesoreria/egresos` — valida `concepto`, `categoria` (`required` + catálogo `OPERATIVO`/`ADMINISTRATIVO`/`MANTENIMIENTO`/`SERVICIOS`/`ACADEMICO`/`OTROS` vía `CategoriaEgreso`), `descripcion`, `cantidad`, `precio`, `igv`, `fecha`; crea `Egreso` con `user_id = auth()->id()`.
  - `update()`: PUT `/tesoreria/egresos/{egreso}` — misma validación (incluye el catálogo estricto de `categoria`), actualiza el egreso.
  - `destroy()`: DELETE `/tesoreria/egresos/{egreso}`.

**Modelo involucrado:**
- `app/Models/Egreso.php` → tabla `egreso`, PK `id_egreso`, `$guarded = []`, `$appends = ['concepto']` (mapea `tipo_egreso`), relación `user()`.

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

Pago extraordinario
  → GET /tesoreria/pago-extraordinario/nuevo
  → POST /tesoreria/pago-extraordinario
  → Crea ComprobantePago (EXTRAORDINARIO)

Anulación de pago
  → POST /tesoreria/pagos/{pago}/anular { motivo }
  → Valida estado PAGADO y motivo obligatorio
  → Cambia estado a ANULADO, recalcula saldo_pendiente
  → Registra en auditoria_pagos

Reporte de movimientos
  → GET /tesoreria/movimientos
  → Libro diario con filtros y ordenamiento por fecha_pago

Egresos (caja general)
  → GET /tesoreria/caja
  → POST /tesoreria/egresos { concepto, categoria, descripcion, cantidad, precio, igv, fecha }
  → PUT /tesoreria/egresos/{egreso}
  → DELETE /tesoreria/egresos/{egreso}
```
