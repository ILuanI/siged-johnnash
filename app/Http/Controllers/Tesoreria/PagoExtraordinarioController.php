<?php

namespace App\Http\Controllers\Tesoreria;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Matricula;
use App\Services\Tesoreria\PagoExtraordinarioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PagoExtraordinarioController extends Controller
{
    public function __construct(
        private readonly PagoExtraordinarioService $pagoExtraordinarioService,
    ) {}

    public function create(Request $request): Response
    {
        $search = $request->query('search');
        $alumnoId = $request->query('alumno_id');

        $alumnos = Alumno::query()
            ->when($search, function ($query, $search) {
                $query->where('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%");
            })
            ->when($alumnoId, function ($query, $alumnoId) {
                $query->whereKey($alumnoId);
            })
            ->get(['id_alumno', 'nombres', 'apellidos', 'dni']);

        return Inertia::render('tesoreria/pago-extraordinario', [
            'alumnos' => $alumnos,
            'alumno_id' => $alumnoId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_alumno' => ['required', 'integer', 'exists:alumno,id_alumno'],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'descripcion' => ['required', 'string', 'max:255'],
            'num_cuotas' => ['nullable', 'integer', 'min:1', 'max:4'],
        ]);

        $matricula = Matricula::query()
            ->where('id_alumno', $validated['id_alumno'])
            ->where('estado', 'VIGENTE')
            ->latest('fecha_matricula')
            ->firstOrFail();

        $this->pagoExtraordinarioService->registrar(
            matricula: $matricula,
            monto: (float) $validated['monto'],
            descripcion: $validated['descripcion'],
            numCuotas: (int) ($validated['num_cuotas'] ?? 1),
        );

        return to_route('tesoreria.estado-cuenta.show', $matricula->alumno)
            ->with('success', 'Pago extraordinario registrado correctamente.');
    }
}
