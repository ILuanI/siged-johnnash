@extends('layouts.demo')

@section('title', 'Consolidado del alumno')

@section('content')
    <div class="card">
        <h2>Consolidado del alumno</h2>
        <form method="get" action="{{ route('demo.matriculas.consolidado') }}" style="display: flex; gap: .5rem; flex-wrap: wrap; align-items: end;">
            <div style="flex: 1; min-width: 200px;">
                <label for="id_alumno">Seleccionar alumno</label>
                <select id="id_alumno" name="id_alumno" onchange="this.form.submit()">
                    <option value="">— Elegir —</option>
                    @foreach ($alumnos as $alumno)
                        <option value="{{ $alumno->id_alumno }}" @selected($idAlumno == $alumno->id_alumno)>
                            {{ $alumno->codigo }} — {{ $alumno->apellidos }}, {{ $alumno->nombres }}
                        </option>
                    @endforeach
                </select>
            </div>
            <button type="submit">Ver consolidado</button>
        </form>
        <p class="hint">Equivalente API: <code>GET /api/matriculas/estudiantes/{id}/consolidado</code></p>
    </div>

    @if ($error)
        <div class="alert alert-error">{{ $error }}</div>
    @endif

    @if ($consolidado)
        <div class="card">
            <h3>{{ $consolidado['perfil']['nombre_completo'] ?? 'Alumno' }}</h3>
            <p>
                <strong>Código:</strong> {{ $consolidado['perfil']['codigo'] }} &nbsp;|&nbsp;
                <strong>DNI:</strong> {{ $consolidado['perfil']['dni'] ?? '—' }} &nbsp;|&nbsp;
                <strong>Estado:</strong> {{ $consolidado['perfil']['estado'] }}
            </p>
            @if ($consolidado['matricula_actual'])
                <p>
                    <strong>Matrícula:</strong>
                    {{ $consolidado['matricula_actual']['periodo']['nombre'] ?? '—' }} /
                    {{ $consolidado['matricula_actual']['ciclo']['nombre'] ?? '—' }} /
                    Turno {{ $consolidado['matricula_actual']['turno']['nombre'] ?? '—' }} /
                    {{ $consolidado['matricula_actual']['aula']['nombre'] ?? '—' }}
                </p>
            @else
                <p><em>Sin matrícula vigente.</em></p>
            @endif
        </div>

        <div class="card">
            <h3>JSON completo (para el equipo de frontend)</h3>
            <pre>{{ json_encode($consolidado, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
        </div>
    @endif
@endsection
