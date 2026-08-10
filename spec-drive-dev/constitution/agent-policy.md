# Política de agentes

> Reglas operativas de cuándo escalar revisión, y qué recaudos tomar según el
> modelo de IA en uso. A diferencia de `mission.md`, esto no describe el
> producto — describe cómo trabajan los agentes entre sí.

## Disparadores de reviewer obligatorio

Si la tarea, o los archivos que termina tocando `coder`, contienen cualquiera
de estos términos (en nombre de archivo, ruta, o descripción de la tarea),
`reviewer` es obligatorio sin excepción, aunque `orchestrator` no lo vea
riesgoso a primera vista:

- auth, login, password, token, session, jwt
- pago, payment, billing, cobro, tarjeta
- datos personales, PII, personal_data — [completar acá con los términos
  propios del dominio: ej. "alumno / student", "paciente / patient",
  "cliente / customer", según quién sea el usuario final del sistema]
- delete, drop, truncate, migrate

Este chequeo aplica tanto a la **descripción de la tarea** (para decidir antes
de delegar) como a los **archivos que `coder` terminó tocando** (revisión
post-hoc si no se anticipó antes) — no alcanza con mirar solo el enunciado
original de la tarea.

> Al instalar el framework en un proyecto nuevo: completar la línea de datos
> personales con los términos reales del dominio. Sin esto, el disparador de
> "datos personales" no dispara nada.

## Retención de datos por modelo de IA

> Relevante solo cuando el proyecto empieza a procesar datos reales de
> usuarios (no aplica mientras se trabaja con datos de prueba / sintéticos).

Antes de que cualquier rol (`coder` / `explorer` / `reviewer` / `orchestrator`)
procese datos reales de usuarios — especialmente datos sensibles o de
menores de edad — revisar la política de retención del modelo de IA que ese
rol usa en ese momento. No es solo responsabilidad de `reviewer`: cualquier
rol que vaya a leer ese dato debe pasar por este chequeo. Si el modelo retiene
contenido para entrenamiento durante su período gratis o de prueba, ese rol
pasa a un modelo con retención cero antes de tocar producción.
