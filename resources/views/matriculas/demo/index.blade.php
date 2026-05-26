@extends('layouts.demo')

@section('title', 'Inicio')

@section('content')
    <div class="card">
        <h2>Módulo de matrículas — prueba rápida</h2>
        <p>Usa el menú superior para registrar alumnos, matricularlos y ver el consolidado. Los datos de catálogo (periodo, ciclo, turno, aula) se cargan con el seeder.</p>
        <p class="hint">Comando: <code>php artisan db:seed --class=MatriculasCatalogoSeeder</code></p>
    </div>

    <div class="card">
        <h3>Últimos alumnos registrados</h3>
        @if ($alumnos->isEmpty())
            <p>No hay alumnos aún. <a href="{{ route('demo.matriculas.estudiante') }}">Registrar el primero</a>.</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>DNI</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($alumnos as $alumno)
                        <tr>
                            <td>{{ $alumno->codigo }}</td>
                            <td>{{ $alumno->nombres }} {{ $alumno->apellidos }}</td>
                            <td>{{ $alumno->dni ?? '—' }}</td>
                            <td>{{ $alumno->estado?->value }}</td>
                            <td>
                                <a href="{{ route('demo.matriculas.consolidado', $alumno->id_alumno) }}">Ver consolidado</a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
@endsection
