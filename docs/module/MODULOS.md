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
| **RI003** | Cursos / docentes / horarios | `curso`, `docente` (`docentes`), `asignacion_docente`, `horario`, `aula`, `ciclo` | ✅ Implementado | `/cursos` (horario visual con cuadrícula semanal), `/docentes` | — |
| **RI004** | Asistencia | `asistencia` | 🔶 Parcial (Lector implementado) | `/asistencias/lector` | — |
| **RI005** | Pagos y cuotas | `comprobante_pago`, `cuota`, `pago` | 🔶 Parcial (Estado de cuenta implementado) | `/tesoreria/estado-cuenta` | — |
| **RI006** | Notas / rendimiento | `examen`, `resultado_examen` | 🔶 Parcial (Cargar/consultar notas implementado) | `/notas`, `/notas/cargar`, `/notas/consulta` | — |
| **RI007** | Usuarios y roles | `usuario`, `rol` | 🔶 Parcial (Laravel `users` + Fortify; tabla `usuario`/`rol` del dominio integrada parcialmente) | `/usuarios`, `/roles`, Auth + Settings | — |
| **RI008** | Dashboard / BI | Vistas `vw_bi_*` | 🔶 Parcial (Dashboard + Reportes + BI) | `/dashboard`, `/reportes`, `/bi` | — |
| **RI009** | IA deserción | `prediccion_desercion`, `vw_features_ia` | 🔶 Parcial (Página IA implementada) | `/ia/desercion` | — |
| **RI010+** | Egresos, auditoría, etc. | `egreso`, … | ⏳ Pendiente | — | — |
| — | Portal Padres (público) | — | ✅ Implementado | `/portal-padres`, `/consulta-notas` | — |
| — | Ajustes / Configuración | — | ✅ Implementado | `/ajustes` | — |

**Leyenda:** ✅ listo · 🔶 parcial · ⏳ no iniciado en código

---

## Controladores Laravel por módulo (`app/Http/Controllers/`)

```
app/Http/Controllers/
├── Controller.php                           # Base controller
├── UserController.php                       # Usuarios (admin)
├── RolController.php                        # Roles (admin)
├── DocenteController.php                    # Docentes (listado)
├── Ajustes/
│   └── ConfiguracionController.php          # Configuración general
├── Matriculas/
│   ├── MatriculaWebController.php           # Web: formalizar matrícula
│   ├── EstudianteWebController.php          # Web: CRUD estudiantes
│   └── CatalogoAcademicoController.php      # Web: catálogo (carreras, ciclos, áreas)
├── Api/Matriculas/
│   ├── MatriculaController.php              # API: matrículas
│   └── AlumnoController.php                 # API: alumnos
├── Academico/
│   └── ExamenController.php                 # Exámenes (backend notas)
├── Cursos/
│   └── CursoController.php                  # CRUD cursos + asignación docente + horarios + ciclos + aulas
├── Asistencias/
│   └── LectorAsistenciaController.php       # Lector QR/Manual asistencia
├── Tesoreria/
│   └── EstadoCuentaController.php           # Estado de cuenta alumno
├── Bi/
│   ├── DashboardBiController.php            # Dashboard BI
│   └── ReportesController.php               # Reportes varios
├── Ia/
│   └── DesercionController.php              # IA deserción
├── Public/
│   ├── PortalPadresController.php           # Portal público padres
│   └── ConsultaNotasController.php          # Consulta notas pública
├── Settings/
│   ├── ProfileController.php                # Perfil usuario (Fortify)
│   └── SecurityController.php               # Seguridad 2FA (Fortify)
```

---

## Páginas Inertia por módulo (`resources/js/pages/`)

```
resources/js/pages/
├── welcome.tsx                              # Landing
├── dashboard.tsx                            # Dashboard principal
├── auth/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── verify-email.tsx
│   ├── confirm-password.tsx
│   └── two-factor-challenge.tsx
├── settings/
│   ├── profile.tsx
│   ├── appearance.tsx
```text
│   └── security.tsx
├── matriculas/
│   ├── nueva.tsx                            # Formalizar matrícula
│   ├── catalogo.tsx                         # Catálogo académico
│   └── estudiantes/
│       ├── index.tsx                        # Directorio + modal perfil
│       └── create.tsx                       # Registro estudiante
├── usuarios/
│   └── index.tsx                            # Admin usuarios
├── roles/
│   └── index.tsx                            # Admin roles
├── docentes/
│   └── index.tsx                            # Listado docentes
├── cursos/
│   └── index.tsx                            # Listado/gestión cursos
├── asistencias/
│   └── lector.tsx                           # Lector asistencia
├── tesoreria/
│   ├── index.tsx                            # Home tesorería
│   └── estado-cuenta.tsx                    # Estado de cuenta alumno
├── notas/
│   ├── index.tsx                            # Home notas
│   ├── cargar.tsx                           # Cargar notas
│   └── consulta.tsx                         # Consultar notas
├── ia/
│   └── desercion.tsx                        # IA deserción
├── reportes/
│   └── index.tsx                            # Reportes BI
├── ajustes/
│   └── index.tsx                            # Configuración general
└── PortalPadres.tsx                         # Portal público padres
    └── (consulta-notas.tsx vía Public/ConsultaNotasController)
```

---

## Modulos Implementados

Puedes navegar al archivo del modulo si quieres obtener más detalle. Cuando quieras documentar un nuevo avance en el modulo crea otro markdown en la misma carpeta.
- Matrículas (RI001 + RI002) (docs\module\MATRICULAS.md)
- Cursos / Docentes / Horarios (RI003) (docs\module\CURSOS.md)

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
2. **RI005** — Completar Pagos (completa pestaña del consolidado y tesorería).
3. **RI004** — Completar Asistencia (reportes, justificativos, alertas).
4. **RI006** — Completar Notas / simulacros (promedios, actas, reportes).
5. **RI008 / RI009** — BI e IA deserción (dashboards, predicciones, alertas tempranas).

---

## Mantenimiento de este documento

Actualizar esta tabla cuando:

- Se cree un nuevo archivo en `routes/{modulo}.php`.
- Un módulo pase de ⏳ a 🔶 o ✅.
- Se agreguen endpoints o se muevan carpetas.
- Cambie la estructura de controladores o páginas Inertia.

**Última actualización:** julio 2026 — Refleja estructura real de controladores y páginas Inertia.