<?php

namespace App\Enums;

enum ConceptoPago: string
{
    case Matricula = 'MATRICULA';
    case Simulacro = 'SIMULACRO';
    case Carnet = 'CARNET';
    case Extraordinario = 'EXTRAORDINARIO';
}
