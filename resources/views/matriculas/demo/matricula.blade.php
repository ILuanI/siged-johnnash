@extends('layouts.demo')

@section('title', 'Formalizar matrícula')

@section('content')
    <div class="card">
        <h2>Formalizar matrícula</h2>
        <p class="hint">El alumno pasará a estado <strong>MATRICULADO</strong> al guardar.</p>

        @if ($alumnos->isEmpty() || $periodos->isEmpty() || $ciclos->isEmpty())
            <div class="alert alert-error">
                Faltan datos de catálogo o alumnos.
                Ejecuta: <code>php artisan db:seed --class=MatriculasCatalogoSeeder</code>
                y registra al menos un alumno.
            </div>
        @endif

        <form method="post" action="{{ route('demo.matriculas.matricula.store') }}">
            @csrf
            <label for="id_alumno">Alumno *</label>
            <select id="id_alumno" name="id_alumno" required>
                <option value="">— Seleccionar —</option>
                @foreach ($alumnos as $alumno)
                    <option value="{{ $alumno->id_alumno }}" @selected(old('id_alumno') == $alumno->id_alumno)>
                        {{ $alumno->codigo }} — {{ $alumno->apellidos }}, {{ $alumno->nombres }} ({{ $alumno->estado?->value }})
                    </option>
                @endforeach
            </select>

            <div class="grid grid-2">
                <div>
                    <label for="id_periodo">Periodo académico *</label>
                    <select id="id_periodo" name="id_periodo" required>
                        @foreach ($periodos as $periodo)
                            <option value="{{ $periodo->id_periodo }}" @selected(old('id_periodo') == $periodo->id_periodo)>
                                {{ $periodo->nombre }} ({{ $periodo->anio }})
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="id_ciclo">Ciclo *</label>
                    <select id="id_ciclo" name="id_ciclo" required>
                        @foreach ($ciclos as $ciclo)
                            <option value="{{ $ciclo->id_ciclo }}" @selected(old('id_ciclo') == $ciclo->id_ciclo)>
                                {{ $ciclo->nombre }} — S/ {{ number_format($ciclo->costo_base, 2) }}
                                @if ($ciclo->periodo) ({{ $ciclo->periodo->nombre }}) @endif
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="id_turno">Turno *</label>
                    <select id="id_turno" name="id_turno" required>
                        @foreach ($turnos as $turno)
                            <option value="{{ $turno->id_turno }}" @selected(old('id_turno') == $turno->id_turno)>
                                {{ $turno->nombre }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="id_aula">Aula *</label>
                    <select id="id_aula" name="id_aula" required>
                        @foreach ($aulas as $aula)
                            <option value="{{ $aula->id_aula }}" @selected(old('id_aula') == $aula->id_aula)>
                                {{ $aula->nombre }} (cap. {{ $aula->capacidad }})
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="modalidad">Modalidad</label>
                    <select id="modalidad" name="modalidad">
                        <option value="PRESENCIAL" @selected(old('modalidad', 'PRESENCIAL') === 'PRESENCIAL')>Presencial</option>
                        <option value="VIRTUAL" @selected(old('modalidad') === 'VIRTUAL')>Virtual</option>
                    </select>
                </div>
                <div>
                    <label for="tipo_pago">Tipo de pago</label>
                    <select id="tipo_pago" name="tipo_pago">
                        <option value="CONTADO" @selected(old('tipo_pago', 'CONTADO') === 'CONTADO')>Contado</option>
                        <option value="CREDITO" @selected(old('tipo_pago') === 'CREDITO')>Crédito</option>
                    </select>
                </div>
                <div>
                    <label for="costo_total">Costo total (opcional)</label>
                    <input id="costo_total" name="costo_total" type="number" step="0.01" min="0" value="{{ old('costo_total') }}" placeholder="Usa costo del ciclo si se deja vacío">
                </div>
                <div>
                    <label for="fecha_matricula">Fecha matrícula</label>
                    <input id="fecha_matricula" name="fecha_matricula" type="date" value="{{ old('fecha_matricula', now()->toDateString()) }}">
                </div>
            </div>

            @if ($errors->any())
                <div class="alert alert-error">
                    <ul style="margin: 0; padding-left: 1.2rem;">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <button type="submit">Formalizar matrícula</button>
        </form>
    </div>
@endsection
