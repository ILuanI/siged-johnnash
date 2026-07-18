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
| `id_matricula` | FK, no null |
| `numero` | N° único de comprobante |
| `tipo` | `BOLETA` / `FACTURA` / `RECIBO` / `NINGUNO` |
| `concepto` | `MATRICULA` / `SIMULACRO` / `CARNET` / `EXTRAORDINARIO` |
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

## Reglas de negocio

- **Carnet siempre 1 cuota** — no aplica fraccionamiento.
- **Saldo pendiente** se calcula como `costo_total - SUM(pagos.monto)` de todas las cuotas del comprobante.
- **Pago extraordinario**: el usuario ingresa concepto, descripción y monto manualmente; se genera un comprobante con tipo `EXTRAORDINARIO`.
- **Prórroga**: se puede extender la `fecha_vencimiento` de una cuota.
- Un comprobante con `saldo_pendiente = 0` se considera cancelado.
