# Flujo: Caja General y Tesorería (`tesoreria/caja`)

Mapa del recorrido real de `resources/js/pages/tesoreria/caja.tsx` y su
controlador `app/Http/Controllers/Tesoreria/EstadoCuentaController::caja`.

## Ruta y controlador

- Ruta nombrada: `tesoreria.caja.index` (Wayfinder: `caja` desde
  `App/Http/Controllers/Tesoreria/EstadoCuentaController`).
- Acción: `EstadoCuentaController::caja(Request $request)`.
- Policy: requiere `viewAny` sobre `Pago`.

## Filtros avanzados

El backend valida y acepta los siguientes parámetros (todos `nullable`):

- `fecha_inicio`, `fecha_fin` (`date`, con `after_or_equal` cuando ambos
  están presentes). Si no se envían, aplica por defecto el mes actual
  (`startOfMonth` / `endOfMonth`).
- `search` (`string`, máx. 255): busca por alumno (nombres/apellidos/dni),
  concepto o descripción del comprobante, y usuario que registró el movimiento.
- `metodo_pago` (`in:EFECTIVO,YAPE,PLIN,TRANSFERENCIA,TARJETA`).
- `categoria` (`string`, máx. 60): catálogo contable (unión de categorías de
  ingreso y egreso del mantenedor `categoria_financiera`).
- `concepto` (`in:MATRICULA,SIMULACRO,CARNET,EXTRAORDINARIO`).

Siempre devuelve `filters` con los valores efectivamente aplicados
(`fecha_inicio`, `fecha_fin`, `search`, `metodo_pago`, `categoria`,
`concepto`). Además expone `categorias` (listado del catálogo) y `conceptos`
(`ConceptoPago::cases()`) para poblar los selectores del frontend.

Estos filtros se aplican a **todas** las consultas: el consolidado
`ingresosPorConcepto` (vía `DB::table` con left joins a `matricula`,
`alumno` y `users`), `totalEgresos`, la lista de `egresos` y la lista de
`pagos`. Para egresos, `concepto` se mapea a `tipo_egreso` (coincidencia
exacta) y `categoria` a `egreso.categoria`; para pagos, `categoria` y
`concepto` se resuelven sobre `comprobante_pago`.

## Tarjeta de filtros (frontend)

Componente `Card` ubicado debajo del header. Filtros (fechas, ingresos y
egresos) y paginación se gestionan con **una única fuente de verdad**: un
`useForm` (`formFiltros`) cuyo estado se sincroniza con la prop `filters` del
servidor mediante un `useEffect` (`setData` funcional). Filtros expuestos:
`fecha_inicio`/`fecha_fin`, `search_ingreso`, `metodo_pago`,
`categoria_ingreso`, `concepto`, `usuario_ingreso` (tabla de ingresos) y
`search_egreso`, `categoria_egreso`, `usuario_egreso` (tabla de egresos).
Presets de acceso rápido: `hoy()`, `esteMes()`, `mesAnterior()`.
`aplicarFiltros(e)` y `limpiarFiltros()` construyen un objeto `nuevoData`
explícito (con `page` reiniciado en 1) y lo asignan con
`setFiltro(nuevoData)` para mantener la UI en sincronía, y luego envían la
petición con `router.get(cajaIndex.url(), limpiarDatos(nuevoData),
{ preserveState: true, replace: true, preserveScroll: true })`; `limpiarFiltros()`
reinicia además los filtros y la página. El payload se pasa de forma explícita
como segundo argumento de `router.get` (no se usa `formFiltros.get`, que en
Inertia v3 depende del ref interno transformado y no enviaba los filtros en la
primera pulsación). `limpiarDatos` omite los valores vacíos antes de enviarlos
como query params, garantizando que los filtros (fechas, búsquedas, métodos de
pago, categorías, conceptos, usuarios y `page: 1`) se envíen de forma síncrona e
inequívoca desde el primer clic. `hayFiltrosActivos` se activa si cualquiera de
los filtros tiene valor. La paginación de ingresos (`irAPaginaIngresos(page)`)
preserva todos los filtros construyendo también un `nuevoData` explícito que se
asigna con `setFiltro` y se envía vía `router.get`.

## Datos afectados por el filtro

Todos los siguientes se calculan en el backend dentro del rango y los demás
filtros aplicados:

1. Arqueo general: `totalIngresos`, `totalEgresos`, `saldoDisponible`.
2. Tarjetas de resumen por concepto: `ingresosPorConcepto`
   (`MATRICULA`, `SIMULACRO`, `CARNET`, `EXTRAORDINARIO`).
3. Tabla de egresos (`egresos`, paginada 15).
4. Tabla de ingresos del período (`pagos`, paginada 15). La paginación
   preserva los filtros vía `irAPaginaIngresos(page)`.

## Recorrido

```
Usuario selecciona rango / preset / search / metodo_pago / categoria / concepto
  -> aplicarFiltros() / limpiarFiltros()
  -> Inertia router.get(tesoreria.caja.index, { fecha_inicio, fecha_fin, search, metodo_pago, categoria, concepto })
  -> EstadoCuentaController::caja valida y aplica filtros
  -> recalcula arqueo, resumen, egresos y pagos
  -> re-render de caja.tsx con nuevos props (preserveState)
```
