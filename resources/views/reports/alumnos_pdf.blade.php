<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Alumnos - Academia John Nash</title>
    <style>
        @page {
            margin: 40px 40px 60px 40px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.4;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .header td {
            vertical-align: top;
            border: none;
        }
        .logo-title {
            font-size: 18px;
            font-weight: bold;
            color: #f4511e;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-title {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            margin-top: 5px;
        }
        .report-meta {
            text-align: right;
            color: #64748b;
            font-size: 9px;
        }
        .filters-section {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 15px;
        }
        .filters-title {
            font-weight: bold;
            color: #334155;
            margin-bottom: 5px;
            font-size: 9px;
            text-transform: uppercase;
        }
        .filters-grid {
            width: 100%;
        }
        .filters-grid td {
            font-size: 9px;
            padding: 2px 0;
            color: #475569;
            width: 20%;
        }
        .filters-grid td span {
            font-weight: bold;
            color: #0f172a;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 8px 6px;
            border: 1px solid #1e293b;
            font-size: 9px;
            text-transform: uppercase;
        }
        .data-table td {
            padding: 6px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .bold {
            font-weight: bold;
        }
        .badge {
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-asistencia {
            background-color: #dcfce7;
            color: #15803d;
        }
        .badge-tardanza {
            background-color: #fef9c3;
            color: #a16207;
        }
        .badge-falta {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        .footer {
            position: fixed;
            bottom: -35px;
            left: 0;
            right: 0;
            height: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
            font-size: 8px;
            color: #94a3b8;
        }
        .footer .page-number:after {
            content: counter(page);
        }
    </style>
</head>
<body>

    <div class="header">
        <table>
            <tr>
                <td>
                    <div class="logo-title">Academia John Nash</div>
                    <div class="report-title">Reporte Consolidado de Alumnos y BI</div>
                </td>
                <td class="report-meta">
                    <div>Generado el: {{ $fecha }}</div>
                    <div>Total Registros: {{ count($alumnos) }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="filters-section">
        <div class="filters-title">Filtros aplicados</div>
        <table class="filters-grid">
            <tr>
                <td>Búsqueda: <span>{{ !empty($filters['q']) ? $filters['q'] : 'Ninguna' }}</span></td>
                <td>Turno: <span>{{ !empty($filters['turno']) ? $filters['turno'] : 'Todos' }}</span></td>
                <td>Área: <span>{{ !empty($filters['area']) ? $filters['area'] : 'Todas' }}</span></td>
                <td>Min. Tardanzas: <span>{{ !empty($filters['tardanzas_count']) ? $filters['tardanzas_count'] : '0' }}</span></td>
                <td>Min. Faltas: <span>{{ !empty($filters['faltas_count']) ? $filters['faltas_count'] : '0' }}</span></td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%">N°</th>
                <th style="width: 10%">DNI</th>
                <th style="width: 25%">Apellidos y Nombres</th>
                <th width="8%">Turno</th>
                <th width="5%" class="text-center">Clases</th>
                <th width="12%" class="text-center">Asist / Tard / Falt</th>
                <th width="10%" class="text-center">Tasa Asistencia</th>
                <th width="8%" class="text-right">Prom. Notas</th>
            </tr>
        </thead>
        <tbody>
            @forelse($alumnos as $alumno)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $alumno['dni'] }}</td>
                    <td class="bold">{{ $alumno['nombre_completo'] }}</td>
                    <td>
                        {{ $alumno['carrera'] }}
                        <div style="font-size: 8px; color: #64748b;">Área: {{ $alumno['area'] }}</div>
                    </td>
                    <td>{{ $alumno['turno'] }}</td>
                    <td class="text-center">{{ $alumno['total_clases'] }}</td>
                    <td class="text-center">
                        <span class="badge badge-asistencia">{{ $alumno['total_asistencias'] }} A</span>
                        <span class="badge badge-tardanza">{{ $alumno['total_tardanzas'] }} T</span>
                        <span class="badge badge-falta">{{ $alumno['total_faltas'] }} F</span>
                    </td>
                    <td class="text-center bold">
                        @if($alumno['tasa_asistencia'] !== null)
                            <span style="color: {{ $alumno['tasa_asistencia'] >= 85 ? '#15803d' : ($alumno['tasa_asistencia'] >= 70 ? '#a16207' : '#b91c1c') }}">
                                {{ number_format($alumno['tasa_asistencia'], 1) }}%
                            </span>
                        @else
                            -
                        @endif
                    </td>
                    <td class="text-right bold">
                        @if($alumno['promedio_notas'] !== null)
                            {{ number_format($alumno['promedio_notas'], 2) }}
                        @else
                            <span style="color: #94a3b8; font-weight: normal;">-</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="padding: 20px; color: #64748b; font-size: 11px;">
                        No se encontraron alumnos con los criterios seleccionados.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <span>Reporte Académico de Control de Alumnos e Inteligencia de Negocios - Academia John Nash</span>
        <span style="float: right;">Página <span class="page-number"></span></span>
    </div>

</body>
</html>
