<?php

namespace App\Http\Controllers\Tesoreria;

use App\Enums\CategoriaIngreso;
use App\Enums\TipoCategoriaFinanciera;
use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\CategoriaFinanciera;
use App\Models\Matricula;
use App\Services\Tesoreria\PagoExtraordinarioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PagoExtraordinarioController extends Controller
{
    public function __construct(
        private readonly PagoExtraordinarioService $pagoExtraordinarioService,
    ) {}

    /**
     * Catálogo de categorías de ingreso: las del mantenedor
     * (`categoria_financiera`) más las del enum como fallback.
     *
     * @return list<string>
     */
    private function categoriasValidas(): array
    {
        return CategoriaFinanciera::query()
            ->where('tipo', TipoCategoriaFinanciera::Ingreso)
            ->pluck('nombre')
            ->merge(array_column(CategoriaIngreso::cases(), 'value'))
            ->unique()
            ->values()
            ->all();
    }

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

        // Categorías de ingreso dinámicas (mantenedor) para el formulario
        $categoriasIngreso = CategoriaFinanciera::query()
            ->where('tipo', TipoCategoriaFinanciera::Ingreso)
            ->orderBy('es_por_defecto', 'desc')
            ->orderBy('nombre')
            ->get(['nombre', 'descripcion', 'es_por_defecto']);

        return Inertia::render('tesoreria/pago-extraordinario', [
            'alumnos' => $alumnos,
            'alumno_id' => $alumnoId,
            'categoriasIngreso' => $categoriasIngreso,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id_alumno' => ['nullable', 'integer', 'exists:alumno,id_alumno'],
            'monto' => ['required', 'numeric', 'min:0.01'],
            'descripcion' => ['required', 'string', 'max:60'],
            'num_cuotas' => ['nullable', 'integer', 'min:1', 'max:4'],
            'categoria' => ['nullable', Rule::in($this->categoriasValidas())],
        ], [
            'id_alumno.exists' => 'El alumno seleccionado no existe.',
            'descripcion.max' => 'El concepto no puede superar los 60 caracteres.',
            'categoria.in' => 'La categoría contable seleccionada no es válida.',
        ]);

        // Si se indica un alumno, se vincula el comprobante a su matrícula
        // vigente. Si el alumno no tiene matrícula vigente (o no se indica
        // alumno), el ingreso se registra como ingreso general (sin matrícula).
        $matricula = null;

        if ($request->filled('id_alumno')) {
            $matricula = Matricula::query()
                ->where('id_alumno', $validated['id_alumno'])
                ->where('estado', 'VIGENTE')
                ->latest('fecha_matricula')
                ->first();
        }

        $this->pagoExtraordinarioService->registrar(
            matricula: $matricula,
            monto: (float) $validated['monto'],
            descripcion: $validated['descripcion'],
            numCuotas: (int) ($validated['num_cuotas'] ?? 1),
            categoria: $validated['categoria'] ?? null,
        );

        if ($matricula) {
            return to_route('tesoreria.estado-cuenta.show', $matricula->alumno)
                ->with('success', 'Pago extraordinario registrado correctamente.');
        }

        return to_route('tesoreria.caja.index')
            ->with('success', 'Ingreso general registrado correctamente.');
    }
}
