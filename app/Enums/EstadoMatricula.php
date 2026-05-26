<?php

namespace App\Enums;

enum EstadoMatricula: string
{
    case Vigente = 'VIGENTE';
    case Anulada = 'ANULADA';
    case Finalizada = 'FINALIZADA';
}
