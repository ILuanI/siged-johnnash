<?php

namespace App\Enums;

enum EstadoAlumno: string
{
    case Activo = 'ACTIVO';
    case Matriculado = 'MATRICULADO';
    case Retirado = 'RETIRADO';
    case Egresado = 'EGRESADO';
}
