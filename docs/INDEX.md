# Docs Index — SIGED JohnNash

> Punto de entrada para la IA. Entendiendo la lógica de la doc, consultá los archivos que consideres necesarios.

---

## spec/ — Qué debe hacer el sistema (reglas de negocio)

| Archivo | Cubre |
|---|---|
| `spec/modelo-academico.md` | Modelo de datos completo: tablas, columnas, relaciones |
| `spec/alumno.md` | Schema del alumno, consolidado, contactos |
| `spec/ciclos.md` | Tipos de ciclo, comportamiento |
| `spec/pagos.md` | Conceptos de pago, estructura comprobante/cuota/pago |
| `spec/seminarios.md` | Ingresos por seminarios |

## module/ — Cómo se organiza cada módulo (arquitectura)

| Archivo | Cubre |
|---|---|
| `module/router.md` | Mapa de rutas, middleware, convenciones de naming |
| `module/MODULOS.md` | Matriz RI vs módulos, estado, dependencias |
| `module/MATRICULAS.md` | Alumnos y matrículas (RI001+RI002) |
| `module/CURSOS.md` | Cursos, docentes, horarios (RI003) |

## flow/ — Trazabilidad paso a paso (frontend → backend)

| Archivo | Cubre |
|---|---|
| `flow/catalogo-flujo.md` | Flujo del catálogo académico |
| `flow/pagos-flow.md` | Flujo de pagos |

## meta/ — Info del proyecto

| Archivo | Cubre |
|---|---|
| `meta/declaraciones.md` | Notas del proyecto (no tocar sin preguntar) |

---
## Cómo usar este índice

Antes de tocar código, discriminá según tu tarea. Si tienes el contexto necesario puedes omitir ver la doc. Aunque te doy una guía, tu tienes la decisión de que consultar:

| Tarea | Leer |
|---|---|
| Implementar algo nuevo | spec/ + module/ del módulo |
| Debuggear un bug | flow/ + module/ |
| Refactorizar | module/ (dependencias) |
| Cambiar DB / migraciones | spec/modelo-academico.md + module/ |
| Cambiar rutas | module/router.md |
| Cambiar regla de negocio | spec/ + module/ |
| Panorama general | module/MODULOS.md + module/router.md |

Si la tarea cruza módulos, leé ambos module/ y las specs involucradas.
Si un doc relevante no existe o está incompleto, revisá el código primero y actualizalo.
Si algo no cuadra entre código y doc, las specs son fuente de verdad — sospechar que el doc está desactualizado.

## Cuándo actualizar docs (post-cambio)

Después de hacer cambios en el código, actualizar los docs afectados:

| Disparador | Actualizar |
|---|---|
| Ruta nueva o modificada en `routes/*.php` | `module/router.md` |
| Tabla/columna nueva en migraciones | `spec/modelo-academico.md` |
| Funcionalidad de módulo existente | `module/<modulo>.md` |
| Módulo nuevo | `module/MODULOS.md` + nuevo `<modulo>.md` |
| Regla de negocio nueva o corregida | spec correspondiente |
| Bug corregido o flujo nuevo | `flow/<flujo>.md` (sin línea exacta, solo archivo + función) |

 Las **spec/** son la fuente de verdad — si el código y la spec se contradicen, sospechar que la spec está desactualizada o el código está mal.
