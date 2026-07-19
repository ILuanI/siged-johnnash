# Flujo: Catálogo académico (`matriculas/catalogo`)

## Backend — Controller → Resource → Inertia

`CatalogoAcademicoController@index` consulta áreas con sus carreras ordenadas por nombre más un conteo (`withCount`). Transforma cada área vía `AreaResource` que serializa `id_area`, `codigo`, `nombre`, `carreras_count` y el arreglo anidado `carreras`. También envía una lista plana de todas las carreras con su relación `area` para reusarse en otros formularios.

## Bug corregido — ResourceCollection anidado sin resolver

`AreaResource` retornaba `CarreraResource::collection(...)` sin llamar a `->resolve()`. Al serializarse a JSON, el `ResourceCollection` se envuelve en `{"data": [...]}`. El frontend espera un array plano `[...]` y al evaluar `area.carreras.length` sobre un objeto obtenía `undefined`, cayendo en el mensaje "Esta área todavía no tiene carreras".

**Fix:** `AreaResource@toArray` ahora llama a `->resolve()` sobre el `CarreraResource::collection(...)` dentro de `whenLoaded`, forzando array plano desde el servidor.

## Frontend — Página Inertia (catalogo.tsx)

El componente `CatalogoAcademico` recibe `areas: AreaCatalogo[]` desde el servidor. Renderiza un formulario de creación de área/carrera y luego itera las áreas. Cada `AreaBlock` muestra un encabezado editable y una tabla con `area.carreras.map(CarreraRow)`. Si `carreras` está vacío, muestra un mensaje de "sin carreras".

## Flujo de datos extremo a extremo

1. Usuario visita `GET /matriculas/catalogo` → middleware `auth`, `verified`, `permiso`.
2. Controller consulta `Area::with('carreras')->withCount('carreras')->orderBy('codigo')->get()`.
3. `AreaResource::collection(...)->resolve()` serializa cada área con `carreras` como array plano.
4. Inertia v3 envía la respuesta JSON (XHR) o embebe en `data-page` (HTML inicial).
5. React renderiza `AreaBlock` por cada área; cada bloque itera `area.carreras` en una tabla.
6. El CRUD (crear/editar área y carrera) usa `useForm` de Inertia y redirige con `redirect()->back()`.
