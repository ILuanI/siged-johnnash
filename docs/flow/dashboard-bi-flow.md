# Flujo: Dashboard BI (Consolidado & Perfil 360°)

## Ruta

- `GET /dashboard` → `DashboardBiController::index()` (middleware `auth`, `verified`, `permiso`).

## Frontend

- `resources/js/pages/dashboard.tsx`: página `dashboard` con selector de ciclo, KPIs globales, buscador de alumnos y ficha 360°.

## Backend

- `app/Http/Controllers/Bi/DashboardBiController.php` → `index()`:
  - Lista de ciclos (`Ciclo` ordenado por `fecha_inicio` desc).
  - Ciclo seleccionado vía `?id_ciclo=`; si no viene, usa el `ABIERTO` o el más reciente.
  - KPIs del ciclo (solo matrículas `VIGENTE`):
    - `total_matriculados`: count de `Matricula`.
    - `tasa_asistencia`: % de asistencias `ASISTIO`/`TARDANZA` sobre el total.
    - `promedio_notas`: avg de `puntaje_total` en `ResultadoExamen`.
    - `tasa_recaudacion`: `SUM(pago.monto)` (excluye `ANULADO`) / `SUM(matricula.costo_total)`.
    - `recaudacion_por_concepto`: ingresos recaudados (`Pago` con `estado != 'ANULADO'`) del ciclo
      agrupados por `comprobante_pago.concepto`, mapeados a `matricula` (`MATRICULA`),
      `simulacros` (`SIMULACRO`), `carnet` (`CARNET`) y `otros` (`EXTRAORDINARIO`).
      Los conceptos sin pagos quedan en `0.0`. Se calcula con un `join` directo
      `pago → cuota → comprobante_pago → matricula` filtrado por `id_ciclo` y `estado VIGENTE`.
  - Buscador de alumnos (`?q=`) para autocompletado (límite 8).
  - Ficha 360° (`?alumno=`) vía `ConsolidadoAlumnoService::obtener()`.
  - `alumnosPorArea` vía `AreaMetricsService::alumnosActivosPorArea()`.

## Respuesta Inertia

```php
Inertia::render('dashboard', [
    'kpis' => [
        'total_matriculados' => ...,
        'tasa_asistencia' => ...,
        'promedio_notas' => ...,
        'tasa_recaudacion' => ...,
        'recaudacion_por_concepto' => [
            'matricula' => float,
            'simulacros' => float,
            'carnet' => float,
            'otros' => float,
        ],
    ],
    'studentList' => ...,
    'consolidado' => ...,
    'ciclos' => ...,
    'alumnosPorArea' => ...,
    'selectedCycleId' => ...,
    'filters' => ['q' => ..., 'alumno' => ...],
]);
```

## Tarjeta "Recaudación Financiera" (frontend)

- Muestra `tasa_recaudacion` (%) con barra de progreso.
- Debajo, desglose "Recaudado por concepto": total en S/ y fila por concepto
  (Matrícula, Simulacros, Carnet, Otros) con monto en S/ y % del total recaudado.
- El total del desglose suma los 4 conceptos; los porcentajes se calculan sobre ese total
  (0% si no hay recaudación).

## Notas

- Los pagos `ANULADO` se excluyen tanto de `tasa_recaudacion` como del desglose
  (alineado con `docs/spec/pagos.md`: el saldo pendiente excluye anulados).
- Los montos llegan como números (PHP serializa floats enteros como int en JSON);
  el frontend usa `.toFixed(2)` para formatear en S/.