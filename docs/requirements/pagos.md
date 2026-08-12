# Pagos — Spec

## Conceptos de pago

Cada matrícula puede generar comprobantes para estos conceptos:

| Concepto | Descripción | Generado automáticamente | Cuotas |
|---|---|---|---|
| `MATRICULA` | Costo de inscripción al ciclo | Sí, al formalizar matrícula | Según `cuotas_matricula` |
| `SIMULACRO` | Costo de exámenes simulacro | Sí, al formalizar matrícula | Según `cuotas_simulacro` |
| `CARNET` | Costo del carnet estudiantil | Sí, al formalizar matrícula | Siempre 1 cuota |
| `EXTRAORDINARIO` | Pagos ad-hoc (exámenes, certificados, materiales) | No, registro manual | Las que se definan |

## Estructura

```
comprobante_pago 1 ── * cuota 1 ── * pago
```

### ComprobantePago

| Campo | Reglas |
|---|---|
| `id_matricula` | FK, nullable (`null` = ingreso general / sin alumno) |
| `numero` | N° único de comprobante |
| `tipo` | `BOLETA` / `FACTURA` / `RECIBO` / `NINGUNO` |
| `concepto` | `MATRICULA` / `SIMULACRO` / `CARNET` / `EXTRAORDINARIO` |
| `categoria` | `ACADEMICO` / `SERVICIOS` / `EVENTOS` / `ADMINISTRATIVO` / `OTROS` (default `ACADEMICO`) |
| `costo_total` | Monto total del concepto |
| `saldo_pendiente` | Se actualiza al registrar pagos |

### Cuota

| Campo | Reglas |
|---|---|
| `monto` | Monto de la cuota individual |
| `fecha_vencimiento` | Fecha límite de pago |
| `estado` | `PENDIENTE` → `PAGADA` / `VENCIDA` |

### Pago

| Campo | Reglas |
|---|---|
| `id_cuota` | FK, contra qué cuota se paga |
| `user_id` | Quién registró el pago (FK → `users`) |
| `fecha_pago` | datetime, momento exacto |
| `monto` | Puede ser parcial o total de la cuota |
| `metodo_pago` | `EFECTIVO` / `YAPE` / `PLIN` / `TRANSFERENCIA` / `TARJETA` |
| `estado` | `PAGADO` / `ANULADO` |

### AuditoriaPago

| Campo | Reglas |
|---|---|
| `pago_id` | FK → `pagos`, no null |
| `usuario_id` | FK → `users`, quién ejecutó la acción |
| `accion` | `CREAR` / `ANULACION` |
| `motivo` | Texto obligatorio al anular |
| `created_at` | datetime, momento del registro |

## Egresos (salidas de caja)

```
egreso 1 ── * auditoria_egreso
```

### Egreso

| Campo | Reglas |
|---|---|
| `id_egreso` | PK |
| `fecha` | Fecha del egreso |
| `tipo_egreso` | Concepto (mapeado como `concepto` en el modelo) |
| `categoria` | `OPERATIVO` / `ADMINISTRATIVO` / `MANTENIMIENTO` / `SERVICIOS` / `ACADEMICO` / `OTROS` (o cualquier categoría del mantenedor `categoria_financiera` tipo `EGRESO`) |
| `cantidad`, `precio`, `igv` | Componentes del total |
| `total` | Columna generada: `cantidad * precio + igv` |
| `metodo_pago` | `EFECTIVO` / `TRANSFERENCIA` / `TARJETA` / `YAPE` / `PLIN` |
| `user_id` | FK → `users`, quién registró el egreso |
| `estado` | `REGISTRADO` / `ANULADO` (default `REGISTRADO`) |

### AuditoriaEgreso

| Campo | Reglas |
|---|---|
| `egreso_id` | FK → `egreso`, no null |
| `usuario_id` | FK → `users`, quién ejecutó la acción |
| `accion` | `ANULACION` |
| `motivo` | Texto obligatorio al anular |
| `created_at` | datetime, momento del registro |

## Categorías financieras (catálogo gestionable)

Las categorías contables de ingresos y egresos viven en la tabla
`categoria_financiera` y se administran desde el mantenedor
`/tesoreria/categorias` (permiso `pagos`).

| Campo | Reglas |
|---|---|
| `id` | PK |
| `nombre` | varchar 60, único por `tipo` |
| `tipo` | `INGRESO` / `EGRESO` |
| `es_por_defecto` | boolean, una sola por `tipo` |
| `descripcion` | varchar 160, nullable |

Valores iniciales (seeder `CategoriaFinancieraSeeder`):

- **Ingreso**: `ACADEMICO` (por defecto), `SERVICIOS`, `EVENTOS`, `ADMINISTRATIVO`, `OTROS`.
- **Egreso**: `OPERATIVO` (por defecto), `ADMINISTRATIVO`, `MANTENIMIENTO`, `SERVICIOS`, `ACADEMICO`, `OTROS`.

Reglas del mantenedor:

- **Unicidad**: `nombre` único dentro del mismo `tipo` (puede repetirse entre tipos).
- **Por defecto**: `setDefault` marca una categoría y desmarca las demás del mismo `tipo`. La categoría por defecto no puede eliminarse.
- **Eliminación**: solo se elimina si no está en uso por `egreso.categoria` ni `comprobante_pago.categoria` y no es la por defecto.
- **Consumo**: los formularios de egresos (caja) y pagos extraordinarios consumen las categorías activas de la tabla; si el catálogo está vacío, se usan los enums `CategoriaEgreso` / `CategoriaIngreso` como fallback. La validación de backend acepta la unión de ambos catálogos (`Rule::in`).
- `comprobante_pago.categoria` y `egreso.categoria` se almacenan como string libre (ya no se limitan al enum), lo que permite categorías personalizadas.

## Reglas de negocio

- **Carnet siempre 1 cuota** — no aplica fraccionamiento.
- **Categoría contable por defecto** — cada comprobante se clasifica con una `categoria` independiente del `concepto`. `PlanPagoMatriculaService` asigna por defecto: `MATRICULA` → `ACADEMICO`, `SIMULACRO` → `EVENTOS`, `CARNET` → `SERVICIOS`, `EXTRAORDINARIO` → `ADMINISTRATIVO`. La categoría puede sobreescribirse al generar el comprobante (p. ej. un pago extraordinario clasificado como `SERVICIOS`). El catálogo de categorías es gestionable en `categoria_financiera` (ver sección anterior).
- **Saldo pendiente** se calcula como `costo_total - SUM(pagos.monto)` de todas las cuotas del comprobante, **excluyendo los pagos con `estado = ANULADO`**.
- **Pago extraordinario**: el usuario indica si el ingreso pertenece a un estudiante o es un **ingreso general de caja** (donaciones, alquileres, etc.). Si pertenece a un estudiante, el comprobante se vincula a su matrícula vigente; si el alumno no tiene matrícula vigente (o no se indica alumno), se registra con `id_matricula = null` y numeración `EXT-GEN-####`. El usuario ingresa **concepto libre** (`descripcion`, máx. 60 caracteres), monto y **categoría contable** manualmente; se genera un comprobante con concepto `EXTRAORDINARIO`. La categoría se valida contra el catálogo de `categoria_financiera` (tipo `INGRESO`) más los valores del enum `CategoriaIngreso` como fallback (`Rule::in`). Cada ingreso general genera un comprobante nuevo (la idempotencia por concepto solo aplica a comprobantes vinculados a matrícula).
- **Prórroga**: se puede extender la `fecha_vencimiento` de una cuota.
- **Anulación**: un pago `PAGADO` puede pasar a `ANULADO`. Dispara el recálculo de `saldo_pendiente` del comprobante y de la cuota asociada, y registra una entrada en `auditoria_pagos` con `accion = ANULACION` y el `motivo` obligatorio. Un pago `ANULADO` no puede volver a `PAGADO`.
- **Anulación de egreso**: un egreso `REGISTRADO` puede pasar a `ANULADO` (sustituye al hard delete). Requiere `motivo` obligatorio y permiso `pagos.eliminar`; registra una entrada en `auditoria_egreso` con `accion = ANULACION`. Un egreso `ANULADO` no puede volver a `REGISTRADO` ni anularse de nuevo. Los egresos anulados **no cuentan** en el total de egresos de la caja.
- Un comprobante con `saldo_pendiente = 0` se considera cancelado.
