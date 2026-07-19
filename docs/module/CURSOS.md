
## Módulo implementado: Cursos / Docentes / Horarios (RI003)

### Responsabilidad

1. Gestionar cursos (nombre, área de conocimiento, color).
2. Gestionar docentes (nombres, DNI, correo, teléfono).
3. Asignar docente + aula a un curso en un ciclo académico (evita duplicados por ciclo).
4. Definir horario semanal (día, hora inicio, hora fin) con validación de cruces (docente y aula).
5. Visualizar parrilla horaria con cuadrícula semanal y eventos solapables.

### Backend — ubicación de archivos

```text
app/
├── Enums/EstadoCiclo.php                 # ABIERTO / EN_CURSO / CERRADO
├── Http/
│   ├── Controllers/
│   │   ├── Cursos/CursoController.php    # CRUD cursos + asignación + horarios + ciclos + aulas
│   │   └── DocenteController.php         # CRUD docentes
│   └── Requests/Cursos/
│       ├── StoreCursoRequest.php         # Validación con detección de cruces
│       └── UpdateCursoRequest.php        # Ignora asignación actual en conflictos
├── Models/                               # Curso, Docente, AsignacionDocente, Horario, Aula, Ciclo
├── Services/                             # (Lógica en controlador + Form Requests)

routes/
├── cursos.php                            # Web (auth + verified + permiso)
└── web.php                               # Route::resource('docentes', ...)

database/
├── migrations/                           # 2026_06_02_170715 (curso), 170716 (asignacion_docente), 170717 (horario)
├── factories/                            # Curso, Docente, AsignacionDocente, Horario, Aula, Ciclo
└── seeders/
    ├── DocenteSeeder.php                 # 20 docentes de prueba
    └── CursosCatalogoSeeder.php          # 5 cursos con asignación + horarios

tests/Feature/
├── CursosPageTest.php                    # Vista, creación, edición, conflictos
├── Caso4_AsignacionDocenteTest.php       # Asignación con validaciones
└── Caso5_CiclosAcademicosTest.php        # Gestión de ciclos
```

### Rutas web (requieren `auth` + `verified`)

| Método | URI | Nombre | Acción |
|--------|-----|--------|--------|
| GET | `/cursos` | `cursos.index` | Parrilla horaria + listado |
| POST | `/cursos` | `cursos.store` | Crear curso + asignación + horarios |
| PUT/PATCH | `/cursos/{curso}` | `cursos.update` | Actualizar todo |
| DELETE | `/cursos/{curso}` | `cursos.destroy` | Eliminar (cascade a asignación/horarios) |
| POST | `/cursos/ciclos` | `cursos.ciclos.store` | Crear ciclo académico |
| POST | `/cursos/aulas` | `cursos.aulas.store` | Crear aula |
| GET | `/docentes` | `docentes.index` | Listado docentes |
| POST | `/docentes` | `docentes.store` | Crear docente |
| PUT/PATCH | `/docentes/{docente}` | `docentes.update` | Actualizar docente |
| DELETE | `/docentes/{docente}` | `docentes.destroy` | Eliminar (protegido si tiene asignaciones) |

### Frontend — ubicación de archivos

```text
resources/js/
├── pages/cursos/
│   └── index.tsx                          # Parrilla horaria + CRUD cursos/asignaciones
├── pages/docentes/
│   └── index.tsx                          # Directorio docentes con CRUD
├── components/app-sidebar.tsx             # Entradas "Docentes" y "Cursos" en navegación
```

### Modelo de datos (núcleo)

```
asignacion_docente (central)
  ├── id_curso   → curso
  ├── id_docente → docentes
  ├── id_ciclo   → ciclo
  ├── id_aula    → aula
  └── horarios[] → horario (dia_semana, hora_inicio, hora_fin)

Reglas de negocio:
  - Unique (id_curso, id_ciclo): un curso una vez por ciclo
  - Sin cruces de horario para un docente en un mismo ciclo
  - Sin cruces de horario para un aula en un mismo ciclo
```

---

## Módulos transversales (ya en el starter)

| Área | Backend | Frontend | Notas |
|------|---------|----------|-------|
| **Autenticación** | Fortify (`app/Actions/Fortify/`) | `resources/js/pages/auth/*` | Login, registro, 2FA, passkeys |
| **Ajustes de cuenta** | `Settings/*Controller` | `resources/js/pages/settings/*` | Perfil, seguridad, apariencia |
| **Shell general** | — | `dashboard`, `welcome`, `app-sidebar` | Dashboard con datos reales |

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