# PROGRESS

## 2026-08-12 — Feature 009: Anulación de Egresos y Libro Diario Consolidado

**Estado**: implementada y validada (pendiente revisión humana de spec/plan).

- Migraciones aplicadas: `estado` ENUM en `egreso` + tabla `auditoria_egreso`.
- `EgresoController::anular()` con motivo obligatorio y auditoría; ruta
  `POST tesoreria/egresos/{egreso}/anular` (reemplaza `DELETE`).
- `EstadoCuentaController::movimientos()` consolida pagos y egresos con filtro
  `tipo`; `caja()` excluye egresos anulados del total.
- Frontend: libro diario consolidado en `movimientos.tsx`, modal
  `AnularEgresoDialog` en `caja.tsx`.
- Tests: `AnularEgresoTest` (5), `MovimientosConsolidadosTest` (5),
  `MejorasModuloTest` actualizado. Suite: **187 passed, 2 skipped**.
- Validaciones: pint, eslint (sin errores nuevos), typecheck (solo 2
  preexistentes en `roles/index.tsx`), `npm run build` OK.
- Docs actualizados: `docs/flow/pagos-flow.md`, `docs/requirements/pagos.md`,
  `docs/requirements/modelo-academico.md`, `docs/module/router.md`,
  `docs/INDEX.md`.

**Pendientes / riesgos**:
- Revisión humana de `spec.md` y `plan.md` de la feature 009.
- `pagosRecientes` de la caja sigue mostrando pagos anulados (preexistente).
- Paginación del libro diario aproximada (pagos y egresos paginados por
  separado).
- 88 errores de lint y 2 de typecheck preexistentes en archivos no tocados.