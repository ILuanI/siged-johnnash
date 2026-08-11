# Seminarios — Spec

Los seminarios son eventos o cursos cortos que genera **ingresos adicionales** por fuera de la matrícula regular.

## Reglas de negocio

- Cada seminario tiene un costo que el alumno paga como concepto `EXTRAORDINARIO` en tesorería.
- El pago se registra manualmente como pago extraordinario.
- No hay una tabla `seminario` en la base de datos actual — el registro es puramente contable.

## Preguntas abiertas

- ¿Los seminarios deben tener su propio CRUD (nombre, fecha, costo, cupo)?
- ¿Se necesita reporte de ingresos por seminario?
