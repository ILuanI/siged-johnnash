# Flujo: Movimientos de Tesorería (`tesoreria/movimientos`)

Mapa del recorrido real de `resources/js/pages/tesoreria/movimientos.tsx` y su
controlador `app/Http/Controllers/Tesoreria/EstadoCuentaController::movimientos`.

## Ruta y controlador

- Ruta nombrada: `tesoreria.movimientos.index` (Wayfinder: `movimientos` desde
  `App/Http/Controllers/Tesoreria/EstadoCuentaController`).
- Acción: `EstadoCuentaController::movimientos(Request $request)`.
- Policy: requiere `viewAny` sobre `Pago`.

## Filtros avanzados (contrato unificado con Caja General)

El backend valida y acepta los siguientes parámetros (todos `nullable`):

- `fecha_inicio`, `fecha_fin` (`date`, con `after_or_equal` cuando ambos
  están presentes).
- `search` (`string`, máx. 255): en **pagos** busca por alumno
  (nombres/apellidos/dni), concepto del comprobante, descripción del comprobante
  (incluye pagos generales sin alumno/matrícula) y usuario que registró el pago;
  en **egresos** busca por tipo de egreso, descripción y usuario que registró el
  egreso.
- `metodo_pago` (`in:EFECTIVO,YAPE,PLIN,TRANSFERENCIA,TARJETA`): aplica a
  **pagos y egresos** (ambos tienen columna `metodo_pago`).
- `categoria` (`string`, máx. 60): catálogo contable. En pagos se resuelve
  sobre `comprobante_pago.categoria`; en egresos sobre `egreso.categoria`.
- `concepto` (`string`, máx. 60): en pagos se resuelve sobre
  `comprobante_pago.concepto`; en egresos sobre `tipo_egreso`. El catálogo
  `$conceptos` combina los `ConceptoPago` (MATRICULA, SIMULACRO, CARNET,
  EXTRAORDINARIO) con los `tipo_egreso` distintos existentes en `egreso`.
- `estado` (`in:PAGADO,REGISTRADO,ANULADO`): `ANULADO` se aplica tal cual a
  ambas colecciones; los estados activos se mapean según la tabla — pagos usan
  `PAGADO` y egresos usan `REGISTRADO` —, por lo que filtrar por `PAGADO` o
  `REGISTRADO` devuelve los movimientos vigentes de ambos tipos. `tipo`
  (`in:todos,ingresos,egresos`), `sort` (`in:fecha,monto`),
  `direction` (`in:asc,desc`).

`filters` devuelve los valores aplicados y el backend también expone
`categorias` y `conceptos` para los selectores.

## Tarjeta de filtros (frontend)

Componente `Card` bajo el header. Filtros, paginación y ordenamiento se
gestionan con **una única fuente de verdad**: un `useForm` (`form`) cuyo estado
se sincroniza con la prop `filters` del servidor mediante un `useEffect`
(`setData` funcional que conserva `page`). Presets `hoy()`, `esteMes()`,
`mesAnterior()` actualizan el formulario vía `setData`. `aplicarFiltros(e)`,
`limpiarFiltros()`, `irAPagina(page)` y `cambiarOrden(columna)` construyen un
objeto `nuevoData` explícito (con `page` reiniciado en 1 al filtrar/ordenar) y lo
asignan con `setData(nuevoData)` para mantener la UI en sincronía, y luego
envían la petición con `router.get(movimientosIndex.url(), limpiarDatos(nuevoData),
{ preserveState: true, replace: true, preserveScroll: true })`. El payload se
pasa de forma explícita como segundo argumento de `router.get` (no se usa
`form.get`, que en Inertia v3 depende del ref interno transformado y no enviaba
los filtros en la primera pulsación). `limpiarDatos` omite los valores vacíos
antes de enviarlos como query params, garantizando que los filtros (incluida la
búsqueda, fechas, métodos de pago, estado, tipo, orden y `page: 1`) se envíen de
forma síncrona e inequívoca desde el primer clic. Se preservan todos los
filtros, la paginación, el orden y la posición del scroll (no salta al inicio al
filtrar/buscar ni al ordenar).

## Datos afectados

- `pagos` (ingresos) y `egresos` (salidas), cada uno paginado 15, filtrados por
  fecha, search, metodo_pago, categoria, concepto, estado y tipo. El frontend
  construye un libro diario unificado a partir de ambas colecciones.

## Recorrido

```
Usuario selecciona filtros (fecha, search, metodo_pago, categoria, concepto, estado, tipo)
  -> aplicarFiltros() / limpiarFiltros()
  -> Inertia router.get(tesoreria.movimientos.index, {...})
  -> EstadoCuentaController::movimientos valida y aplica filtros
  -> re-render de movimientos.tsx con nuevos props (preserveState)
```
