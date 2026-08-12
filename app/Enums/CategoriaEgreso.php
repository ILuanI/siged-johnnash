<?php

namespace App\Enums;

enum CategoriaEgreso: string
{
    case Operativo = 'OPERATIVO';
    case Administrativo = 'ADMINISTRATIVO';
    case Mantenimiento = 'MANTENIMIENTO';
    case Servicios = 'SERVICIOS';
    case Academico = 'ACADEMICO';
    case Otros = 'OTROS';
}
