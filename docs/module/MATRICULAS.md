## Módulo implementado: Matrículas (RI001 + RI002)

### Responsabilidad

1. Registrar estudiantes nuevos (validación DNI, código autogenerado).
2. Gestionar catálogo académico (áreas → carreras → cursos con CRUD completo).
3. Formalizar matrícula (periodo, ciclo, turno, aula → estado `MATRICULADO`).
4. Exponer **consolidado** del alumno para el perfil (asistencia, notas, pagos).

### Backend — ubicación de archivos

```text
app/
├── Enums/                          # EstadoAlumno, EstadoMatricula, EstadoCiclo, …
├── Exceptions/BusinessRuleException.php
├── Http/
│   ├── Controllers/
│   │   ├── Api/Matriculas/         # API JSON (consumo externo / móvil)
│   │   └── Matriculas/             # Web Inertia
│   ├── Requests/Matriculas/
│   ├── Resources/Matriculas/
│   └── Responses/ApiResponse.php
├── Models/                         # Alumno, Matricula, Ciclo, PeriodoAcademico, …
└── Services/Matriculas/
    ├── AlumnoRegistroService.php
    ├── MatriculaFormalizacionService.php
    └── ConsolidadoAlumnoService.php

routes/
├── matriculas.php                  # Web (auth + verified + permiso)
├── api.php                         # API (incluye rutas API de matrículas)
└── demo-matriculas.php             # Vistas Blade de prueba (temporal)

database/
├── migrations/                     # Esquema alineado a gpti_siged + extensiones
├── factories/                      # Alumno, Matricula, Ciclo, …
└── seeders/MatriculasCatalogoSeeder.php

tests/Feature/Matriculas/         # Pest: API + páginas Inertia
```

### Rutas web (requieren `auth` + `verified` + `permiso`)

| Método | URI | Nombre | Acción |
|---|---|---|---|
| GET | `/matriculas/estudiantes` | `matriculas.estudiantes.index` | Directorio + modal perfil (`?alumno=`) |
| GET | `/matriculas/estudiantes/nuevo` | `matriculas.estudiantes.create` | Formulario registro |
| POST | `/matriculas/estudiantes` | `matriculas.estudiantes.store` | Guardar alumno |
| PATCH | `/matriculas/estudiantes/{alumno}/carrera` | `matriculas.estudiantes.carrera.update` | Cambiar carrera del alumno |
| GET | `/matriculas/estudiantes/{alumno}/pdf` | `matriculas.estudiantes.pdf` | Descargar PDF del alumno |
| GET | `/matriculas/catalogo` | `matriculas.catalogo.index` | Catálogo académico |
| POST | `/matriculas/areas` | `matriculas.areas.store` | Crear área |
| PATCH | `/matriculas/areas/{area}` | `matriculas.areas.update` | Editar área |
| DELETE | `/matriculas/areas/{area}` | `matriculas.areas.destroy` | Eliminar área |
| POST | `/matriculas/carreras` | `matriculas.carreras.store` | Crear carrera |
| PATCH | `/matriculas/carreras/{carrera}` | `matriculas.carreras.update` | Editar carrera |
| DELETE | `/matriculas/carreras/{carrera}` | `matriculas.carreras.destroy` | Eliminar carrera |
| POST | `/matriculas/cursos` | `matriculas.cursos.store` | Crear curso en catálogo |
| PATCH | `/matriculas/cursos/{curso}` | `matriculas.cursos.update` | Editar curso |
| DELETE | `/matriculas/cursos/{curso}` | `matriculas.cursos.destroy` | Eliminar curso |
| GET | `/matriculas/nueva` | `matriculas.nueva` | Formulario matrícula |
| POST | `/matriculas/nueva` | `matriculas.store` | Formalizar matrícula |

### Rutas API (Sanctum)

| Método | URI | Nombre |
|---|---|---|
| POST | `/api/matriculas/estudiantes` | `api.matriculas.estudiantes.store` |
| POST | `/api/matriculas` | `api.matriculas.store` |
| GET | `/api/matriculas/estudiantes/{id}/consolidado` | `api.matriculas.estudiantes.consolidado` |

### Frontend — ubicación de archivos

```text
resources/js/
├── components/matriculas/
│   ├── matriculas-sidebar.tsx      # Sidebar estilo prototipo Job Nash
│   └── student-profile-modal.tsx   # Modal perfil (tabs Información / Pagos / Notas / Asistencia)
├── layouts/matriculas-layout.tsx   # Layout del módulo (registrado en app.tsx)
├── pages/matriculas/
│   ├── estudiantes/index.tsx       # Directorio de estudiantes
│   ├── estudiantes/create.tsx      # Registro
│   ├── nueva.tsx                   # Formalización
│   └── catalogo.tsx                # Catálogo académico
├── types/matriculas.ts             # Tipos TS del consolidado y listados
└── lib/matriculas.ts               # Helpers (edad, badges, fechas)
```
