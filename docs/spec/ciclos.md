# Ciclos — Spec

## Schema (`ciclo`)

| Campo | Tipo | Reglas |
|---|---|---|
| `id_ciclo` | PK, smallint unsigned | Autoincremental |
| `id_periodo` | FK → `periodo_academico`, smallint unsigned | Requerido |
| `nombre` | varchar(60) | Requerido. Ej: "Ciclo Anual 2026-I" |
| `tipo_ciclo` | varchar(40) | `Anual`, `Semestral`, `Intensivo` |
| `fecha_inicio` | date | Requerido |
| `fecha_fin` | date | Requerido |
| `costo_base` | decimal(8,2) | Precio base del ciclo para calcular matrícula |
| `estado` | enum(`ABIERTO`,`EN_CURSO`,`CERRADO`) | Default: `ABIERTO` |

## Tipos de ciclo

| Tipo | Duración típica | Uso |
|---|---|---|
| **Anual** | 12 meses | Ciclo principal del año académico |
| **Semestral** | 6 meses | Ciclo complementario o de verano |
| **Intensivo** | Variable (1-3 meses) | Repasos, preparación para exámenes específicos |

## Reglas de negocio

- Un ciclo pertenece a exactamente un `periodo_academico`.
- No pueden solaparse ciclos del mismo tipo dentro del mismo periodo (validación a nivel de aplicación).
- Si no hay un periodo abierto al crear un ciclo, se asigna automáticamente al último periodo registrado.
- `costo_base` se usa como referencia al matricular; puede tener descuentos o recargos según tipo de pago y concepto.
- Un ciclo con `estado = CERRADO` no permite nuevas matrículas ni modificaciones.

## Preguntas abiertas

- ¿"Semillero", "Semestral", "Mensual" son tipos de ciclo válidos o ejemplos? Actualmente solo `Anual`, `Semestral`, `Intensivo` están implementados.
