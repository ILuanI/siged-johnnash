## Módulo implementado: Matrículas (RI001 + RI002) (docs\module\MATRICULAS.md)

### Responsabilidad

1. Registrar estudiantes nuevos (validación DNI, código autogenerado).
2. Formalizar matrícula (periodo, ciclo, turno, aula → estado `MATRICULADO`).
3. Exponer **consolidado** del alumno para el perfil y futuros sprints (asistencia, notas, pagos).

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
├── matriculas.php                  # Web (auth)
├── api/matriculas.php              # API (incluido desde api.php)
└── demo-matriculas.php             # Vistas Blade de prueba (temporal)

database/
├── migrations/                     # Esquema alineado a gpti_siged + extensiones
├── factories/                      # Alumno, Matricula, Ciclo, …
└── seeders/MatriculasCatalogoSeeder.php

tests/Feature/Matriculas/         # Pest: API + páginas Inertia
```

### Rutas web (requieren `auth` + `verified`)

| Método | URI | Nombre | Acción |
|--------|-----|--------|--------|
| GET | `/matriculas/estudiantes` | `matriculas.estudiantes.index` | Directorio + modal perfil (`?alumno=`) |
| GET | `/matriculas/estudiantes/nuevo` | `matriculas.estudiantes.create` | Formulario registro |
| POST | `/matriculas/estudiantes` | `matriculas.estudiantes.store` | Guardar alumno |
| GET | `/matriculas/nueva` | `matriculas.nueva` | Formulario matrícula |
| POST | `/matriculas/nueva` | `matriculas.store` | Formalizar matrícula |
| GET | `/matriculas/catalogo` | `matriculas.catalogo` | Catálogo académico |

### Rutas API (sin auth por ahora — definir Sanctum en sprint de seguridad)

| Método | URI | Nombre |
|--------|-----|--------|
| POST | `/api/matriculas/estudiantes` | `matriculas.estudiantes.store` |
| POST | `/api/matriculas` | `matriculas.store` |
| GET | `/api/matriculas/estudiantes/{id}/consolidado` | `matriculas.estudiantes.consolidado` |

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

---