# Estructura de módulos — SIGED John Nash

Este documento define cómo se organizan los **módulos funcionales** del sistema dentro del monolito Laravel + React (Inertia). Es la referencia para que backend, frontend y QA hablen el mismo idioma.

## Enfoque arquitectónico

- **Monolito modular por dominio**: un solo repositorio, un solo despliegue, pero código agrupado por área de negocio.
- **Backend**: controladores delgados + **Services** con la lógica de negocio + **Form Requests** para validación + **Models/Enums**.
- **Frontend**: páginas Inertia en `resources/js/pages/{modulo}/` + componentes en `resources/js/components/{modulo}/`.
- **Rutas**: un archivo por módulo en `routes/{modulo}.php` (web) y, si aplica, `routes/api/{modulo}.php`.
- **Trazabilidad**: cada módulo se alinea a un requerimiento **RI00x** de la matriz del proyecto (ver `gpti_siged.sql` / diseño de BD).

---

## Matriz de módulos (RI → dominio → estado)

| RI | Módulo | Tablas principales (BD) | Estado | Web (Inertia) | API REST |
|----|--------|-------------------------|--------|---------------|----------|
| **RI001** | Registro de alumnos | `alumno`, `apoderado`, `carrera`, `area` | ✅ Implementado (dentro de Matrículas) | `/matriculas/estudiantes/nuevo` | `POST /api/matriculas/estudiantes` |
| **RI002** | Matrícula y ciclos | `matricula`, `ciclo`, `periodo_academico`, `turno`, `aula` | ✅ Implementado | `/matriculas/nueva` | `POST /api/matriculas` |
| — | Consolidado del alumno | Agrega perfil + matrícula + placeholders | ✅ Implementado | Modal en `/matriculas/estudiantes?alumno={id}` | `GET /api/matriculas/estudiantes/{id}/consolidado` |
| **RI003** | Cursos / docentes / horarios | `curso`, `docente`, `asignacion_docente`, `horario` | ⏳ Pendiente | — | — |
| **RI004** | Asistencia | `asistencia` | ⏳ Pendiente (estructura preparada en consolidado) | — | — |
| **RI005** | Pagos y cuotas | `comprobante_pago`, `cuota`, `pago` | ⏳ Pendiente (estructura preparada en consolidado) | — | — |
| **RI006** | Notas / rendimiento | `examen`, `resultado_examen` | ⏳ Pendiente (estructura preparada en consolidado) | — | — |
| **RI007** | Usuarios y roles | `usuario`, `rol` | 🔶 Parcial (Laravel `users` + Fortify; tabla `usuario`/`rol` del dominio aún no integrada) | Auth + Settings | — |
| **RI008** | Dashboard / BI | Vistas `vw_bi_*` | ⏳ Pendiente | `/dashboard` (placeholder) | — |
| **RI009** | IA deserción | `prediccion_desercion`, `vw_features_ia` | ⏳ Pendiente | — | — |
| **RI010+** | Egresos, auditoría, etc. | `egreso`, … | ⏳ Pendiente | — | — |

**Leyenda:** ✅ listo · 🔶 parcial · ⏳ no iniciado en código

---

## Módulo implementado: Matrículas (RI001 + RI002)

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
│   │   └── Matriculas/             # Web Inertia + demo Blade temporal
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
│   └── nueva.tsx                   # Formalización
├── types/matriculas.ts             # Tipos TS del consolidado y listados
└── lib/matriculas.ts               # Helpers (edad, badges, fechas)
```

---

## Módulos transversales (ya en el starter)

| Área | Backend | Frontend | Notas |
|------|---------|----------|-------|
| **Autenticación** | Fortify (`app/Actions/Fortify/`) | `resources/js/pages/auth/*` | Login, registro, 2FA, passkeys |
| **Ajustes de cuenta** | `Settings/*Controller` | `resources/js/pages/settings/*` | Perfil, seguridad, apariencia |
| **Shell general** | — | `dashboard`, `welcome`, `app-sidebar` | Dashboard aún placeholder |

Estos **no** siguen la carpeta `Matriculas/` porque vienen del Laravel React Starter Kit.

---

## Convención para un módulo nuevo (plantilla)

Al iniciar, por ejemplo, **Pagos (RI005)**:

### 1. Rutas

```text
routes/pagos.php              → require en web.php (middleware auth)
routes/api/pagos.php          → require en api.php
```

### 2. Backend

```text
app/Http/Controllers/Pagos/           # Web (Inertia)
app/Http/Controllers/Api/Pagos/       # API JSON
app/Services/Pagos/                   # Lógica de negocio
app/Http/Requests/Pagos/              # Validación
app/Http/Resources/Pagos/             # Respuestas API
app/Models/                           # Solo modelos del dominio (Cuota, Pago, …)
app/Enums/                            # Enums del dominio
```

### 3. Frontend

```text
resources/js/pages/pagos/
resources/js/components/pagos/
resources/js/types/pagos.ts
resources/js/layouts/pagos-layout.tsx   # Opcional si el módulo tiene shell propio
```

### 4. Tests

```text
tests/Feature/Pagos/
```

### 5. Registro en `app.tsx`

```typescript
case name.startsWith('pagos/'):
    return PagosLayout; // o AppLayout
```

### 6. Sidebar

Actualizar `matriculas-sidebar.tsx` o crear un sidebar global cuando exista shell único del SIGED.

---

## Integración entre módulos

| Desde | Hacia | Patrón recomendado |
|-------|-------|-------------------|
| Matrículas | Pagos | El consolidado ya expone `finanzas._meta`; Pagos completará `finanzas` vía `ConsolidadoAlumnoService` |
| Matrículas | Asistencia | Misma idea con `asistencia` en consolidado |
| Matrículas | Notas | Misma idea con `notas` en consolidado |
| Cualquier módulo | Usuario/rol | Policies + gates cuando RI007 integre `usuario`/`rol` del dominio |

**Regla:** un módulo no debe importar controladores de otro; compartir **Services** o **DTOs/array shapes** documentados (como el consolidado).

---

## Base de datos

- Fuente de verdad del diseño: **`gpti_siged.sql`** (dump) y migraciones Laravel en `database/migrations/`.
- Migración de extensión del módulo matrículas: `2026_05_26_070000_add_matriculas_module_extensions.php` (periodo, turno, columnas en `matricula`).
- Datos de prueba del catálogo académico: `php artisan db:seed --class=MatriculasCatalogoSeeder`.

---

## Próximos módulos sugeridos (orden de sprint)

1. **RI007** — Integrar roles del dominio (`rol`, `usuario`) con auth y policies.
2. **RI003** — Cursos, docentes, horarios (desbloquea asistencia y notas por asignación).
3. **RI005** — Pagos (completa pestaña del consolidado).
4. **RI004** — Asistencia.
5. **RI006** — Notas / simulacros.
6. **RI008 / RI009** — BI e IA deserción.

---

## Mantenimiento de este documento

Actualizar esta tabla cuando:

- Se cree un nuevo archivo en `routes/{modulo}.php`.
- Un módulo pase de ⏳ a 🔶 o ✅.
- Se agreguen endpoints o se muevan carpetas.

**Última actualización:** módulo Matrículas (RI001 + RI002 + consolidado) — Mayo 2026.
