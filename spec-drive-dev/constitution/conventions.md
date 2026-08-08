# Convenciones de referencia

Este archivo es **detalle de consulta**, no router. `AGENTS.md` lo referencia
cuando la tarea toca diagramas, prototipos, o clasificar qué archivo puede
generar el agente solo — no se carga en cada sesión, solo cuando aplica.

## Automatizable vs. humano (tabla completa)

| Archivo | Se genera | Requiere revisión humana |
|---|---|---|
| `spect-drive-dev/features/NNN/tasks.md` | ✅ Agente marca `[x]` al completar | Al inicio (definir tareas) |
| `spect-drive-dev/constitution/PROGRESS.md` | ✅ Puede actualizarse al cerrar features | Ocasional |
| `docs/module/*.md`, `docs/flow/*.md` (destilación) | ✅ Agente actualiza o crea al cerrar feature o al tocar código | Ocasional, sobre todo si toca contratos entre módulos |
| `spect-drive-dev/features/NNN/spec.md` | Parcial (borrador IA) | ✅ Siempre |
| `spect-drive-dev/features/NNN/plan.md` | Parcial (borrador IA) | ✅ Siempre |
| `docs/spec/*.md` | borrador IA si se pide | ✅ Siempre |
| `spect-drive-dev/constitution/mission.md` | borrador IA si se pide al inicio del proyecto | ✅ |
| `spect-drive-dev/constitution/tech-stack.md` | borrador IA si se pide al inicio del proyecto | ✅ |
| `spect-drive-dev/constitution/roadmap.md` | borrador IA si se pide al inicio del proyecto | ✅ |

## Diagramas

Los diagramas van **inline en Mermaid**, dentro del `.md` correspondiente de `docs/`
— nunca en archivo aparte (`docs/diagrams/`) ni en herramienta externa (Figma,
draw.io, etc.), salvo contenido para audiencia no técnica (pitch, stakeholders).
Motivo: Mermaid es texto plano, el agente lo edita en el mismo diff que la prosa
de al lado y se mantiene tan verificable/actualizable como el resto del doc.

Criterio por carpeta — el diagrama debe aportar algo que la prosa no puede mostrar
bien, no ilustrar una regla que ya es simple en una frase:

| Carpeta | Tipo de diagrama | Cuándo se justifica |
|---|---|---|
| `docs/spec/` | `stateDiagram`, `flowchart` (decisión) | El diagrama **es** la regla de negocio (ciclo de vida de una entidad, lógica con 3+ condiciones combinadas) |
| `docs/module/` | `graph` / `flowchart` (dependencias) | Relaciones entre módulos — casi siempre vale la pena |
| `docs/flow/` | `sequenceDiagram` | Solo si hay múltiples actores async/paralelos. Si es una traza lineal archivo→función, el formato de flow ya alcanza — no duplicar |

## Prototipos

Para exploración técnica descartable (spikes, pruebas de concepto en otro stack),
usar `prototypes/` en la raíz del proyecto, hermana de `docs/` y `spect-drive-dev/`. No va
dentro de `spect-drive-dev/features/` ni de `docs/`: no es proceso versionado de una feature
ni documentación del sistema real. Cada subcarpeta de prototipo debe incluir un
README de una línea indicando a qué feature de `spect-drive-dev/` corresponde y que es
descartable, no fuente de verdad — para que el agente no lo confunda con código
de producción ni intente destilarlo a `docs/`.