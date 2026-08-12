<?php

namespace App\Enums;

enum CategoriaIngreso: string
{
    case Academico = 'ACADEMICO';
    case Servicios = 'SERVICIOS';
    case Eventos = 'EVENTOS';
    case Administrativo = 'ADMINISTRATIVO';
    case Otros = 'OTROS';
}
