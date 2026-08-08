# Contratos de handoff entre agentes

Este archivo define la información mínima que debe viajar entre agentes. Los
subagentes trabajan en sesiones aisladas: una respuesta natural o un resumen
opcional no es un contrato suficiente.

## Paquete de tarea: `orchestrator -> subagent`

Toda delegación debe incluir, cuando aplique:

```text
Objetivo:
Tipo de trabajo: exploración | implementación | revisión | micro-decisión
Alcance:
Fuera de alcance:
Archivos o módulos relevantes:
Fuentes que deben consultarse:
Restricciones aplicables:
Criterios de aceptación:
Riesgo detectado:
Resultado de agentes anteriores:
```

`Resultado de agentes anteriores` es obligatorio cuando existe un handoff de
otro agente. No se debe sustituir por una interpretación resumida si el
resultado contiene discrepancias, riesgos o restricciones.

## Informe de exploración: `explorer -> orchestrator`

El `explorer` debe terminar con este formato:

```text
EXPLORATION REPORT

Área explorada:
Archivos confirmados:
Funciones, rutas o módulos relevantes:
Flujo actual:
Contratos y restricciones que no deben romperse:
Discrepancias entre documentación y código:
Riesgos o zonas no confirmadas:
Recomendación para coder:
```

Debe distinguir hechos verificados de inferencias. No debe editar la
documentación ni presentar como confirmado algo que no pudo comprobar.

## Informe de implementación: `coder -> orchestrator`

El `coder` debe terminar con este formato:

```text
IMPLEMENTATION REPORT

Objetivo atendido:
Archivos de código modificados:
Archivos de documentación modificados:
Decisiones técnicas relevantes:
Tests o validaciones ejecutados:
Resultado de cada validación:
Criterios de aceptación cubiertos:
Discrepancias previas encontradas y corregidas:
Riesgos, omisiones o trabajo pendiente:
```

Si una sección no aplica, debe indicarlo expresamente con `Ninguno`, no
omitirla. Una tarea no se considera terminada si faltan las validaciones o si
hay riesgos pendientes sin explicar.

## Informe de revisión: `reviewer -> orchestrator`

El `reviewer` debe responder con:

```text
REVIEW REPORT

Alcance revisado:
Hallazgos críticos:
Hallazgos importantes:
Hallazgos menores:
Documentación verificada:
Veredicto: aprobado | aprobado con observaciones | requiere cambios
```

El reviewer debe revisar el estado real del repositorio y las fuentes
normativas por su cuenta. El resumen del orchestrator no reemplaza esa lectura.

## Regla de transmisión

El `orchestrator` debe copiar el informe relevante al siguiente agente dentro
del paquete de tarea. El agente siguiente puede verificarlo contra el repo,
pero no debe tener que reconstruirlo desde cero ni depender del historial de
otra sesión.

El resumen final al usuario debe conservar las discrepancias, los riesgos y
las validaciones, aunque el resultado principal haya sido exitoso.
