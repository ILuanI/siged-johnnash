# Docs Index — SIGED JohnNash

Este archivo es el indice de la documentacion del proyecto instalado. Sirve
para que una persona o un agente encuentre rapidamente la fuente relevante.
No reemplaza las reglas operativas de `AGENTS.md`.

## requirements/ — Qué debe hacer el sistema (reglas de negocio)

| Archivo | Cubre |
|---|---|
| `requirements/modelo-academico.md` | Modelo de datos completo: tablas, columnas, relaciones |
| `requirements/alumno.md` | Schema del alumno, consolidado, contactos |
| `requirements/ciclos.md` | Tipos de ciclo, comportamiento |
| `requirements/pagos.md` | Conceptos de pago, estructura comprobante/cuota/pago |
| `requirements/seminarios.md` | Ingresos por seminarios |

Usa un archivo por area. Estas specs describen el comportamiento vigente del
producto y requieren revision humana cuando cambian reglas de negocio.

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
| `flow/dashboard-bi-flow.md` | Flujo del dashboard BI (KPIs, recaudación por concepto, ficha 360°) |

Usa `sequenceDiagram` solo cuando haya actores asincronos o paralelos. Para
un recorrido lineal archivo -> funcion, basta con la descripcion del flujo.

## meta/ — Info del proyecto

| Archivo | Cubre |
|---|---|
| `meta/declaraciones.md` | Notas del proyecto (no tocar sin preguntar) |

## Convenciones del indice

- Mantener una entrada por documento relevante.
- Describir el alcance real del archivo, no copiar su contenido.
- Actualizar este indice al crear, dividir, renombrar o eliminar documentos.
- Si un documento no existe o esta incompleto, indicarlo claramente y
  verificar el codigo antes de confiar en el mapa.