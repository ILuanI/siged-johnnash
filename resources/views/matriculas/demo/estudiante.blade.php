@extends('layouts.demo')

@section('title', 'Registrar alumno')

@section('content')
    <div class="card">
        <h2>Registrar estudiante nuevo</h2>
        <form method="post" action="{{ route('demo.matriculas.estudiante.store') }}">
            @csrf
            <div class="grid grid-2">
                <div>
                    <label for="nombres">Nombres *</label>
                    <input id="nombres" name="nombres" value="{{ old('nombres') }}" required>
                </div>
                <div>
                    <label for="apellidos">Apellidos *</label>
                    <input id="apellidos" name="apellidos" value="{{ old('apellidos') }}" required>
                </div>
                <div>
                    <label for="dni">DNI (8 dígitos)</label>
                    <input id="dni" name="dni" value="{{ old('dni') }}" maxlength="8" pattern="\d{8}">
                </div>
                <div>
                    <label for="fecha_nac">Fecha de nacimiento</label>
                    <input id="fecha_nac" name="fecha_nac" type="date" value="{{ old('fecha_nac') }}">
                </div>
                <div>
                    <label for="sexo">Sexo</label>
                    <select id="sexo" name="sexo">
                        <option value="">—</option>
                        <option value="M" @selected(old('sexo') === 'M')>M</option>
                        <option value="F" @selected(old('sexo') === 'F')>F</option>
                        <option value="OTRO" @selected(old('sexo') === 'OTRO')>Otro</option>
                    </select>
                </div>
                <div>
                    <label for="id_carrera">Carrera</label>
                    <select id="id_carrera" name="id_carrera">
                        <option value="">— Sin carrera —</option>
                        @foreach ($carreras as $carrera)
                            <option value="{{ $carrera->id_carrera }}" @selected(old('id_carrera') == $carrera->id_carrera)>
                                {{ $carrera->nombre }} (Área {{ $carrera->area?->codigo }})
                            </option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="telefono">Teléfono</label>
                    <input id="telefono" name="telefono" value="{{ old('telefono') }}">
                </div>
                <div>
                    <label for="correo">Correo</label>
                    <input id="correo" name="correo" type="email" value="{{ old('correo') }}">
                </div>
            </div>
            <label for="direccion">Dirección</label>
            <input id="direccion" name="direccion" value="{{ old('direccion') }}">

            <label for="colegio_proc">Colegio de procedencia</label>
            <input id="colegio_proc" name="colegio_proc" value="{{ old('colegio_proc') }}">

            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e2e8f0;">
            <h3>Apoderado (opcional)</h3>
            <div class="grid grid-2">
                <div>
                    <label for="apoderado_nombres">Nombres apoderado</label>
                    <input id="apoderado_nombres" name="apoderado[nombres]" value="{{ old('apoderado.nombres') }}">
                </div>
                <div>
                    <label for="apoderado_dni">DNI apoderado</label>
                    <input id="apoderado_dni" name="apoderado[dni]" value="{{ old('apoderado.dni') }}" maxlength="8">
                </div>
                <div>
                    <label for="apoderado_parentesco">Parentesco</label>
                    <input id="apoderado_parentesco" name="apoderado[parentesco]" value="{{ old('apoderado.parentesco') }}" placeholder="Madre, Padre, Tutor…">
                </div>
                <div>
                    <label for="apoderado_telefono">Teléfono apoderado</label>
                    <input id="apoderado_telefono" name="apoderado[telefono]" value="{{ old('apoderado.telefono') }}">
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

            <button type="submit">Registrar alumno</button>
            <a href="{{ route('demo.matriculas.index') }}" class="btn btn-secondary" style="margin-left: .5rem;">Cancelar</a>
        </form>
    </div>
@endsection
