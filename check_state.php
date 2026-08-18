<?php

use Illuminate\Support\Facades\DB;

echo 'alumnos: ' . DB::table('alumno')->count() . PHP_EOL;
$dup = DB::table('alumno')->select('dni')->groupBy('dni')->havingRaw('count(*) > 1')->get();
echo 'grupos duplicados: ' . count($dup) . PHP_EOL;
echo '72717127 count: ' . DB::table('alumno')->where('dni', '72717127')->count() . PHP_EOL;
echo 'users: ' . DB::table('users')->count() . PHP_EOL;