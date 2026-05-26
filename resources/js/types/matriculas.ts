export type EstudianteListItem = {
    id_alumno: number;
    codigo: string;
    nombres: string;
    apellidos: string;
    dni: string | null;
    estado: string;
    correo: string | null;
    telefono: string | null;
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
        correo: string | null;
        direccion: string | null;
        colegio_procedencia: string | null;
        estado: string | null;
        carrera: {
            id_carrera: number;
            nombre: string;
            area: { id_area: number; codigo: string; nombre: string } | null;
        } | null;
        apoderado: {
            id_apoderado: number;
            nombres: string;
            dni: string | null;
            telefono: string | null;
            parentesco: string | null;
            correo: string | null;
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
        cuotas: unknown[];
        pagos: unknown[];
        _meta: { modulo: string; disponible: boolean; mensaje: string };
    };
};

export type CarreraOption = {
    id_carrera: number;
    nombre: string;
    id_area: number;
    area?: { codigo: string; nombre: string } | null;
};
