<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Perfil 360° - {{ $consolidado['perfil']['nombre_completo'] }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 13px;
            margin: 0;
            padding: 0;
        }
        .header {
            background-color: #1a237e;
            color: #fff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 13px;
            color: #c5cae9;
        }
        .content {
            padding: 20px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            color: #ff7043;
            border-bottom: 2px solid #eee;
            padding-bottom: 5px;
            font-size: 15px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #f5f5f5;
        }
        th {
            color: #666;
            font-weight: bold;
            background-color: #fafafa;
        }
        td {
            color: #111;
        }
        .grid-3 {
            width: 100%;
            margin-bottom: 15px;
        }
        .grid-3 td {
            width: 33.33%;
            border: none;
            padding: 5px;
            vertical-align: top;
        }
        .grid-3 .val {
            font-size: 16px;
            font-weight: bold;
            color: #1a237e;
            display: block;
        }
        .grid-3 .lbl {
            font-size: 12px;
            color: #666;
        }
        .badge {
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .bg-red { background-color: #fee2e2; color: #b91c1c; }
        .bg-green { background-color: #dcfce7; color: #15803d; }
        .bg-yellow { background-color: #fef9c3; color: #a16207; }
        .bg-blue { background-color: #e0f2fe; color: #0369a1; }
        .bg-gray { background-color: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $consolidado['perfil']['apellidos'] }}, {{ $consolidado['perfil']['nombres'] }}</h1>
        <p>DNI: {{ $consolidado['perfil']['dni'] }} | ESTADO: {{ $consolidado['perfil']['estado'] }}</p>
    </div>

    <div class="content">
        <!-- SECCIÓN 1: INFORMACIÓN ACADÉMICA Y CONTACTO -->
        <div class="section">
            <h2 class="section-title">Información Académica y Contacto</h2>
            <table>
                <tr>
                    <th width="25%">Carrera / Área</th>
                    <td width="25%">{{ $consolidado['perfil']['carrera']['nombre'] ?? 'N/A' }} ({{ $consolidado['perfil']['carrera']['area']['nombre'] ?? 'N/A' }})</td>
                    <th width="25%">Colegio Procedencia</th>
                    <td width="25%">{{ $consolidado['perfil']['colegio_procedencia']['nombre'] ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Modalidad</th>
                    <td>{{ $consolidado['matricula_actual']['modalidad'] ?? 'N/A' }}</td>
                    <th>Teléfono Estudiante</th>
                    <td>{{ $consolidado['perfil']['telefono'] ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Aula / Turno</th>
                    <td>{{ $consolidado['matricula_actual']['aula']['nombre'] ?? 'N/A' }} ({{ $consolidado['matricula_actual']['turno']['nombre'] ?? 'N/A' }})</td>
                    <th>Apoderado</th>
                    <td>{{ $consolidado['perfil']['apoderado']['nombres'] ?? 'N/A' }} (Tel: {{ $consolidado['perfil']['apoderado']['telefono'] ?? 'N/A' }})</td>
                </tr>
            </table>
        </div>

        <!-- SECCIÓN 2: ESTADO FINANCIERO -->
        <div class="section">
            <h2 class="section-title">Estado Financiero</h2>
            <table class="grid-3">
                <tr>
                    <td>
                        <span class="lbl">Costo Total</span>
                        <span class="val">S/ {{ number_format($consolidado['finanzas']['costo_total'] ?? 0, 2) }}</span>
                    </td>
                    <td>
                        <span class="lbl">Pagado</span>
                        <span class="val">S/ {{ number_format(($consolidado['finanzas']['costo_total'] ?? 0) - ($consolidado['finanzas']['saldo_pendiente'] ?? 0), 2) }}</span>
                    </td>
                    <td>
                        <span class="lbl">Saldo Pendiente</span>
                        <span class="val">S/ {{ number_format($consolidado['finanzas']['saldo_pendiente'] ?? 0, 2) }}</span>
                    </td>
                </tr>
            </table>

            <p style="font-weight: bold; font-size: 13px; color: #666;">Detalle de Cuotas</p>
            <table>
                <thead>
                    <tr>
                        <th>N° Cuota</th>
                        <th>Monto</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($consolidado['finanzas']['cuotas'] ?? [] as $cuota)
                        <tr>
                            <td>Cuota {{ $cuota['numero_cuota'] }}</td>
                            <td>S/ {{ number_format($cuota['monto'], 2) }}</td>
                            <td>{{ \Carbon\Carbon::parse($cuota['fecha_vencimiento'])->format('d/m/Y') }}</td>
                            <td>
                                @php
                                    $estadoStr = is_string($cuota['estado']) ? $cuota['estado'] : $cuota['estado']->value;
                                    $estado = strtoupper($estadoStr);
                                    $bg = match($estado) {
                                        'PAGADA' => 'bg-green',
                                        'VENCIDA' => 'bg-red',
                                        'PENDIENTE' => 'bg-yellow',
                                        default => 'bg-gray'
                                    };
                                @endphp
                                <span class="badge {{ $bg }}">{{ $estado }}</span>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="4">No hay cuotas registradas.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- SECCIÓN 3: ASISTENCIA -->
        <div class="section">
            <h2 class="section-title">Asistencia</h2>
            <table class="grid-3">
                <tr>
                    <td>
                        <span class="lbl">Asistencia %</span>
                        <span class="val">{{ number_format($consolidado['asistencia']['resumen']['tasa_asistencia'] ?? 0, 1) }}%</span>
                        <span class="lbl" style="font-size:10px;">{{ $consolidado['asistencia']['resumen']['total_asistencias'] ?? 0 }} de {{ $consolidado['asistencia']['resumen']['total_clases'] ?? 0 }} clases</span>
                    </td>
                    <td>
                        <span class="lbl">Asistencias</span>
                        <span class="val" style="color: #15803d;">{{ $consolidado['asistencia']['resumen']['total_asistencias'] ?? 0 }}</span>
                    </td>
                    <td>
                        <span class="lbl">Tardanzas / Faltas</span>
                        <span class="val" style="color: #b91c1c;">{{ $consolidado['asistencia']['resumen']['total_tardanzas'] ?? 0 }} / {{ $consolidado['asistencia']['resumen']['total_faltas'] ?? 0 }}</span>
                    </td>
                </tr>
            </table>

            <p style="font-weight: bold; font-size: 13px; color: #666;">Historial Reciente</p>
            <table>
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse(array_slice($consolidado['asistencia']['detalle'] ?? [], 0, 5) as $asist)
                        <tr>
                            <td>{{ $asist['curso'] }}</td>
                            <td>{{ \Carbon\Carbon::parse($asist['fecha'])->format('d/m/Y') }}</td>
                            <td>
                                @php
                                    $estadoStrA = is_string($asist['estado']) ? $asist['estado'] : $asist['estado']->value;
                                    $estadoA = strtoupper($estadoStrA);
                                    $bgA = match($estadoA) {
                                        'ASISTIO' => 'bg-green',
                                        'TARDANZA' => 'bg-yellow',
                                        'FALTO' => 'bg-red',
                                        default => 'bg-gray'
                                    };
                                @endphp
                                <span class="badge {{ $bgA }}">{{ $estadoA }}</span>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="3">No hay historial reciente.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- SECCIÓN 4: RENDIMIENTO ACADÉMICO -->
        <div class="section">
            <h2 class="section-title">Rendimiento Académico</h2>
            <table class="grid-3" style="margin-bottom: 10px;">
                <tr>
                    <td colspan="3">
                        <span class="lbl">Promedio General</span>
                        <span class="val">{{ number_format($consolidado['notas']['promedio_general'] ?? 0, 3) }}</span>
                        <span class="lbl" style="font-size:11px;">{{ $consolidado['perfil']['carrera']['area']['nombre'] ?? '' }}</span>
                    </td>
                </tr>
            </table>

            <p style="font-weight: bold; font-size: 13px; color: #666;">Historial de Exámenes</p>
            <table>
                <thead>
                    <tr>
                        <th>Examen</th>
                        <th>Fecha</th>
                        <th>Puntaje</th>
                        <th>Puesto</th>
                        <th>Comparativa Área</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($consolidado['notas']['examenes'] ?? [] as $examen)
                        <tr>
                            <td>{{ $examen['descripcion'] ?? ('SIMULACRO #' . $examen['numero']) }}</td>
                            <td>{{ \Carbon\Carbon::parse($examen['fecha'])->format('d/m/Y') }}</td>
                            <td><strong>{{ number_format($examen['puntaje_total'] ?? 0, 3) }}</strong></td>
                            <td>Puesto {{ $examen['puesto'] ?? '-' }}</td>
                            <td>
                                <span style="font-size:11px; color:#666;">Min: {{ number_format($examen['min_area'] ?? 0, 1) }} | Max: {{ number_format($examen['max_area'] ?? 0, 1) }}</span>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="5">No hay exámenes registrados.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
