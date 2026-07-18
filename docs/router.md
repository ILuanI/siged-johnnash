# Router — SIGED JohnNash

## Archivos de rutas

```
routes/
├── web.php          # Entry point. Core: dashboard, docentes, usuarios, roles
├── api.php          # REST API (Sanctum)
├── console.php      # Artisan commands
├── ajustes.php      # School config: aulas, turnos, periodos, colegios
├── asistencias.php  # Attendance + barcode/QR lector
├── cursos.php       # Course management + ciclo/aula assignment
├── ia.php           # ML dropout prediction
├── matriculas.php   # Enrollment, students, academic catalog (areas, careers, courses)
├── notas.php        # Grades, CSV import, parent portal
├── reportes.php     # BI reports (Excel, PDF)
├── settings.php     # Profile, password, appearance, account deletion
└── tesoreria.php    # Treasury, account statements, fees, extraordinary payments, WhatsApp
```

`web.php` requires all module files — each is self-contained with its own prefix, middleware, and naming.

---

## Middleware stack

| Middleware | Where | Purpose |
|---|---|---|
| `auth` | All protected routes | Must be logged in |
| `verified` | Most protected routes | Email verified |
| `permiso` (custom) | CRUD modules | Permission check |
| `auth:sanctum` | `api.php` | API token auth |
| `RequirePassword` | `settings/security` | Re-prompt password |
| `throttle:6,1` | Password update | Rate limit |

### `EnsureUserHasPermission` (alias `permiso`)

```php
// Resolves module from route name prefix
// Maps HTTP method: GET/HEAD → 'ver', DELETE → 'eliminar', else → 'editar'
// Calls $user->tienePermiso($modulo, $accion)
// Bypassed for: profile.*, password.*, passkeys.*, two-factor.*, appearance.*
```

---

## Permission modules

```
dashboard, docentes, estudiantes, cursos, asistencias,
usuarios, roles, academico, pagos, pagos_extraordinarios,
reportes, ia, ajustes
```

`matriculas.estudiantes.*` and `matriculas.*` → both map to `estudiantes`.

---

## Route conventions

**Standard pattern:**
```php
Route::middleware(['auth', 'verified', 'permiso'])
    ->prefix('resource')
    ->name('resource.')
    ->group(function () { ... });
```

**Naming:** `module.resource.action` (dot notation), snake_case.

**Controllers:** organized by module under `app/Http/Controllers/` subdirectories: `Ajustes/`, `Bi/`, `Academico/`, `Tesoreria/`, `Ia/`, `Public/`, `Api/Matriculas/`.

**Public routes (no auth):** `/portal-padres`, `/consulta-notas`, `api/*`.

---

## Fortify auth routes

Auto-registered by `FortifyServiceProvider`. Rate limits: login 5/min, 2FA 5/min, passkeys 10/min. Validates user is `estado = 'ACTIVO'`.

```
/login, /logout, /register, /forgot-password, /reset-password,
/verify-email, /two-factor-challenge, /confirm-password, /passkeys/*
```

---

## Module summaries

### Core web.php
- `GET /` → home
- `GET /dashboard` → `DashboardBiController` (KPIs, autocomplete, 360° student view, area breakdown)
- CRUD: `docentes`, `usuarios`, `roles`

### Ajustes
- Full CRUD for: aulas, turnos, periodos, colegios de procedencia

### Matriculas
- **Estudiantes**: create, list, assign career, download PDF
- **Catálogo académico**: areas → careers → courses hierarchy (full CRUD each)
- **Nueva matrícula**: create + store

### Cursos
- Course CRUD + ciclo/aula assignment (POST only for sub-resources)

### Asistencias
- List, lector view, lector store (barcode/QR). Statuses: ASISTIO, TARDANZA, FALTO

### Notas
- Index, CSV upload, preview CSV, save grades
- Public parent portal: `/portal-padres` + `/consulta-notas` (by DNI, no auth)

### Tesorería
- Account statements (index + per-student), fee payment/deferral, extraordinary payments, WhatsApp templates

### Reportes
- Filters: text, turno, area, course, date range, tardanzas, ausencias, min/max grade
- Exports: Excel (`Maatwebsite\Excel`), PDF (`DomPDF`, landscape A4)

### IA
- `GET /ia/desercion` → dropout risk analysis panel

### Settings
- Profile edit/update/delete, security (RequirePassword), password change (throttle:6,1), appearance toggle

### API
- `auth:sanctum` — student create, enrollment create, consolidated student data
