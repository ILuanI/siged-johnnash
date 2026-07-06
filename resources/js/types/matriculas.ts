export type EstudianteListItem = {
    id_alumno: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    dni: string | null;
    estado: string;
    telefono: string | null;
    cuotas?: { estado: string; fecha_vencimiento: string }[];
    apoderado?: {
        id_apoderado: number;
        nombres: string;
        telefono: string | null;
    } | null;
};

export type ConsolidadoAlumno = {
    perfil: {
        id_alumno: number;
        codigo: string;
        nombres: string;
        apellidos: string;
        nombre_completo: string;
        dni: string | null;
        fecha_nac: string | null;
        sexo: string | null;
        telefono: string | null;
        colegio_procedencia: {
            id_colegio_procedencia: number;
            nombre: string;
        } | null;
        estado: string | null;
        carrera: {
            id_carrera: number;
            nombre: string;
            area: { id_area: number; codigo: string; nombre: string } | null;
        } | null;
        apoderado: {
            id_apoderado: number;
            nombres: string;
            telefono: string | null;
        } | null;
    };
    matricula_actual: {
        id_matricula: number;
        estado: string;
        fecha_matricula: string;
        modalidad: string;
        tipo_pago: string;
        costo_total: string;
        periodo: { id_periodo: number; nombre: string; anio: number };
        ciclo: {
            id_ciclo: number;
            nombre: string;
            tipo_ciclo: string | null;
            fecha_inicio: string;
            fecha_fin: string;
        };
        turno: { id_turno: number; nombre: string };
        aula: { id_aula: number; nombre: string; capacidad: number | null };
    } | null;
    riesgo_desercion: {
        riesgo_pct: number;
        nivel_riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
        prioritario: boolean;
        tasa_asistencia: number | null;
        promedio_examenes: number | null;
        cuotas_vencidas: number | null;
        fecha_calculo: string | null;
    } | null;
    asistencia: {
        resumen: unknown;
        detalle: unknown[];
        _meta: { modulo: string; disponible: boolean; mensaje: string };
    };
    notas: {
        promedio_general: unknown;
        examenes: unknown[];
        _meta: { modulo: string; disponible: boolean; mensaje: string };
    };
    finanzas: {
        saldo_pendiente: unknown;
        costo_total: unknown;
        tipo_pago: string | null;
        estado_pago: string;
        cuotas: unknown[];
        pagos: unknown[];
        _meta: { modulo: string; disponible: boolean; mensaje: string };
    };
};

export type CarreraOption = {
    id_carrera: number;
    nombre: string;
    id_area: number;
    puntaje_min?: number | null;
    puntaje_max?: number | null;
    area?: { codigo: string; nombre: string } | null;
};

export type AreaOption = {
    id_area: number;
    nombre: string;
    codigo: string;
};

export type AreaCatalogo = AreaOption & {
    carreras_count?: number;
    carreras: CarreraOption[];
};
