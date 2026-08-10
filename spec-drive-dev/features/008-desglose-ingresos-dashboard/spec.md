# Spec: Desglose de Ingresos por Concepto en Dashboard (BI)

## Objetivo
Permitir visualizar en la ruta `/dashboard` (Dashboard de Business Intelligence y Perfil 360) el consolidado de los ingresos recaudados desglosados por concepto: **Matrícula**, **Simulacros**, **Carnet** y **Otros** (Extraordinarios).

## Requerimientos Funcionales
1. **Cálculo Backend (`DashboardBiController`)**:
   - Calcular la suma de pagos recaudados (`estado != 'ANULADO'`) agrupados por el concepto del comprobante de pago asociado (`MATRICULA`, `SIMULACRO`, `CARNET`, `EXTRAORDINARIO`).
   - Filtrar opcionalmente por el ciclo activo seleccionado (`id_ciclo`).
   - Retornar estos datos estructurados en la respuesta Inertia bajo los KPIs o finanzas del dashboard.
2. **Visualización Frontend (`dashboard.tsx`)**:
   - Integrar un desglose visual (tarjeta expandida, acordeón o listado detallado con montos y porcentajes) dentro de la sección de "Recaudación Financiera" en el dashboard.
   - Mostrar claramente los conceptos: Matrícula, Simulacros, Carnet y Otros.

## Reglas de Negocio
- Los pagos con estado `ANULADO` son excluidos del cálculo de ingresos.
- El concepto `EXTRAORDINARIO` se mapea contablemente como "Otros".
