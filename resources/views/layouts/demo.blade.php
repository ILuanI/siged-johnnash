<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Demo Matrículas') — SIGED Job</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; margin: 0; background: #f4f6f8; color: #1a1a1a; line-height: 1.5; }
        header { background: #1e3a5f; color: #fff; padding: 1rem 1.5rem; }
        header h1 { margin: 0; font-size: 1.25rem; }
        header p { margin: .25rem 0 0; opacity: .85; font-size: .875rem; }
        nav { background: #fff; border-bottom: 1px solid #dde3ea; padding: .5rem 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; }
        nav a { color: #1e3a5f; text-decoration: none; font-size: .9rem; padding: .35rem 0; }
        nav a:hover { text-decoration: underline; }
        main { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
        .card { background: #fff; border: 1px solid #dde3ea; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
        .alert { padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
        .alert-success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
        .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        label { display: block; font-weight: 600; font-size: .85rem; margin-bottom: .25rem; }
        input, select, textarea { width: 100%; padding: .5rem .65rem; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: .75rem; font: inherit; }
        .grid { display: grid; gap: .75rem; }
        @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
        button, .btn { display: inline-block; background: #1e3a5f; color: #fff; border: none; padding: .6rem 1.2rem; border-radius: 6px; cursor: pointer; font: inherit; text-decoration: none; }
        button:hover, .btn:hover { background: #152a47; }
        .btn-secondary { background: #64748b; }
        table { width: 100%; border-collapse: collapse; font-size: .9rem; }
        th, td { text-align: left; padding: .5rem; border-bottom: 1px solid #e2e8f0; }
        pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow: auto; font-size: .8rem; }
        .hint { font-size: .8rem; color: #64748b; margin-top: -.5rem; margin-bottom: .75rem; }
    </style>
</head>
<body>
    <header>
        <h1>Academia Preuniversitaria Job — Demo Matrículas</h1>
        <p>Vistas temporales para pruebas del backend (RI001 / RI002)</p>
    </header>
    <nav>
        <a href="{{ route('demo.matriculas.index') }}">Inicio</a>
        <a href="{{ route('demo.matriculas.estudiante') }}">Registrar alumno</a>
        <a href="{{ route('demo.matriculas.matricula') }}">Formalizar matrícula</a>
        <a href="{{ route('demo.matriculas.consolidado') }}">Consolidado</a>
        <a href="/api/matriculas/estudiantes" target="_blank" rel="noopener">API (JSON)</a>
    </nav>
    <main>
        @if (session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif
        @if (session('error'))
            <div class="alert alert-error">{{ session('error') }}</div>
        @endif
        @yield('content')
    </main>
</body>
</html>
