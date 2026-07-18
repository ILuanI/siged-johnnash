# Alumno — Spec

## Schema (`alumno`)

| Campo | Tipo | Reglas |
|---|---|---|
| `id_alumno` | PK, int unsigned | Autoincremental |
| `nombres` | varchar(80) | Requerido |
| `apellidos` | varchar(80) | Requerido |
| `dni` | char(8) | Único, requerido, 8 dígitos |
| `fecha_nac` | date | Requerido |
| `sexo` | enum(`M`,`F`,`OTRO`) | Requerido |
| `telefono` | varchar(20) | Opcional |
| `colegio_procedencia_id` | FK → `colegio_procedencia`, smallint unsigned | Opcional |
| `id_carrera` | FK → `carrera`, smallint unsigned | Requerido |
| `id_apoderado` | FK → `apoderado`, int unsigned | Opcional (se crea automáticamente si se proporcionan datos del apoderado) |
| `estado` | enum(`ACTIVO`,`MATRICULADO`,`RETIRADO`,`EGRESADO`) | Default: `ACTIVO` |

## Reglas de negocio

- **DNI único**: no pueden existir dos alumnos con el mismo DNI.
- **Código autogenerado**: al crear un alumno, se genera un código interno (formato: `AÑO` + correlativo).
- **Carrera obligatoria**: todo alumno debe tener una carrera asignada.
- **Consolidado**: el perfil del alumno expone: datos personales, matrícula actual, pagos (cuotas vencidas/pagadas), notas (promedio, últimos exámenes), asistencias (tasas).
- **Contactos**: el alumno puede tener un apoderado asociado con nombre y teléfono.
- **Edad**: se calcula desde `fecha_nac`; no se almacena como campo.
