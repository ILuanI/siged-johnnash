# Plan: Desglose de Ingresos por Concepto en Dashboard (BI)

## Pasos de Implementación

1. **Backend (`DashboardBiController.php`)**:
   - Añadir la consulta de recaudación agrupada por concepto en el método `index()` cuando `$selectedCycleId` está presente (y también manejando el caso sin ciclo o con ciclo).
   - Estructurar el array `recaudacion_por_concepto`:
     ```php
     [
         'matricula' => 0.0,
         'simulacros' => 0.0,
         'carnet' => 0.0,
         'otros' => 0.0,
     ]
     ```
   - Pasar `'recaudacion_por_concepto'` a la vista Inertia de `dashboard`.

2. **Frontend (`dashboard.tsx`)**:
   - Actualizar la interfaz de la tarjeta "Recaudación Financiera" para incluir una sección desplegable o un desglose limpio con los 4 conceptos (Matrícula, Simulacros, Carnet, Otros), mostrando su monto en Soles (PEN) y su proporción respecto al total recaudado.

3. **Pruebas y Verificación**:
   - Ejecutar pruebas con Pest para asegurar que el controlador de dashboard y los cálculos funcionan correctamente.
