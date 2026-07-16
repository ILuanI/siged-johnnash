<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::updateOrCreate(
            ['clave' => 'whatsapp_msg_vencido'],
            ['valor' => 'Hola, {nombre}. Te recordamos que tu estado de cuenta se encuentra como "VENCIDO". Por favor, acércate a tesorería para regularizar tu situación. ¡Gracias!'],
        );

        Configuracion::updateOrCreate(
            ['clave' => 'whatsapp_msg_proximo_a_vencer'],
            ['valor' => 'Hola, {nombre}. Te recordamos que tu estado de cuenta está PRÓXIMO A VENCER. Por favor, acércate a tesorería para evitar contratiempos. ¡Gracias!'],
        );
    }
}
