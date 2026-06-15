<?php

namespace App\Enums;

enum EstadoCuota: string
{
    case Pendiente = 'PENDIENTE';
    case Pagada = 'PAGADA';
    case Vencida = 'VENCIDA';
}
