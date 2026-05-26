<?php

namespace App\Enums;

enum EstadoCiclo: string
{
    case Abierto = 'ABIERTO';
    case EnCurso = 'EN_CURSO';
    case Cerrado = 'CERRADO';
}
