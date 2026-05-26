-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-05-2026 a las 08:26:55
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gpti_siged`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alumno`
--

CREATE TABLE `alumno` (
  `id_alumno` int(10) UNSIGNED NOT NULL,
  `codigo` varchar(15) NOT NULL,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `dni` char(8) DEFAULT NULL,
  `fecha_nac` date DEFAULT NULL,
  `sexo` enum('M','F','OTRO') DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `direccion` varchar(160) DEFAULT NULL,
  `colegio_proc` varchar(120) DEFAULT NULL,
  `id_carrera` smallint(5) UNSIGNED DEFAULT NULL,
  `id_apoderado` int(10) UNSIGNED DEFAULT NULL,
  `estado` enum('ACTIVO','MATRICULADO','RETIRADO','EGRESADO') NOT NULL DEFAULT 'ACTIVO',
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `alumno`
--

INSERT INTO `alumno` (`id_alumno`, `codigo`, `nombres`, `apellidos`, `dni`, `fecha_nac`, `sexo`, `telefono`, `correo`, `direccion`, `colegio_proc`, `id_carrera`, `id_apoderado`, `estado`, `creado_en`) VALUES
(1, 'JOB-2026-00001', 'Joseph', 'Rodriguez Bermudez', '72717127', '2026-05-12', 'M', '981276345', 'josephluis10.01@gmail.com', '-', 'Santa Ana', 1, NULL, 'ACTIVO', '2026-05-26 01:25:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `apoderado`
--

CREATE TABLE `apoderado` (
  `id_apoderado` int(10) UNSIGNED NOT NULL,
  `nombres` varchar(120) NOT NULL,
  `dni` char(8) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `parentesco` varchar(40) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `id_area` tinyint(3) UNSIGNED NOT NULL,
  `codigo` char(1) NOT NULL,
  `nombre` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `area`
--

INSERT INTO `area` (`id_area`, `codigo`, `nombre`) VALUES
(1, 'A', 'Ciencias');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_docente`
--

CREATE TABLE `asignacion_docente` (
  `id_asignacion` int(10) UNSIGNED NOT NULL,
  `id_docente` int(10) UNSIGNED NOT NULL,
  `id_curso` smallint(5) UNSIGNED NOT NULL,
  `id_ciclo` smallint(5) UNSIGNED NOT NULL,
  `id_aula` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id_asistencia` int(10) UNSIGNED NOT NULL,
  `id_matricula` int(10) UNSIGNED NOT NULL,
  `id_asignacion` int(10) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('ASISTIO','FALTO','TARDANZA','JUSTIFICADO') NOT NULL,
  `registrado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aula`
--

CREATE TABLE `aula` (
  `id_aula` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `capacidad` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `aula`
--

INSERT INTO `aula` (`id_aula`, `nombre`, `capacidad`) VALUES
(1, 'Aula 101', 30),
(2, 'Aula 102', 25);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrera`
--

CREATE TABLE `carrera` (
  `id_carrera` smallint(5) UNSIGNED NOT NULL,
  `id_area` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `puntaje_min` decimal(7,3) DEFAULT NULL,
  `puntaje_max` decimal(7,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carrera`
--

INSERT INTO `carrera` (`id_carrera`, `id_area`, `nombre`, `puntaje_min`, `puntaje_max`) VALUES
(1, 1, 'Medicina', 10.000, 20.000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ciclo`
--

CREATE TABLE `ciclo` (
  `id_ciclo` smallint(5) UNSIGNED NOT NULL,
  `id_periodo` smallint(5) UNSIGNED DEFAULT NULL,
  `nombre` varchar(60) NOT NULL,
  `tipo_ciclo` varchar(40) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `costo_base` decimal(8,2) NOT NULL DEFAULT 0.00,
  `estado` enum('ABIERTO','EN_CURSO','CERRADO') NOT NULL DEFAULT 'ABIERTO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ciclo`
--

INSERT INTO `ciclo` (`id_ciclo`, `id_periodo`, `nombre`, `tipo_ciclo`, `fecha_inicio`, `fecha_fin`, `costo_base`, `estado`) VALUES
(1, 1, 'Ciclo Verano 2026', 'Intensivo', '2026-01-06', '2026-03-15', 1200.00, 'ABIERTO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprobante_pago`
--

CREATE TABLE `comprobante_pago` (
  `id_comprobante` int(10) UNSIGNED NOT NULL,
  `id_matricula` int(10) UNSIGNED NOT NULL,
  `numero` varchar(15) DEFAULT NULL,
  `tipo` enum('BOLETA','FACTURA','RECIBO','NINGUNO') NOT NULL DEFAULT 'BOLETA',
  `fecha_emision` date NOT NULL DEFAULT curdate(),
  `costo_total` decimal(8,2) NOT NULL,
  `saldo_pendiente` decimal(8,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuota`
--

CREATE TABLE `cuota` (
  `id_cuota` int(10) UNSIGNED NOT NULL,
  `id_comprobante` int(10) UNSIGNED NOT NULL,
  `numero_cuota` tinyint(3) UNSIGNED NOT NULL,
  `monto` decimal(8,2) NOT NULL,
  `fecha_venc` date NOT NULL,
  `estado` enum('PENDIENTE','PAGADA','VENCIDA') NOT NULL DEFAULT 'PENDIENTE'
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso`
--

CREATE TABLE `curso` (
  `id_curso` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `area_conoc` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docente`
--

CREATE TABLE `docente` (
  `id_docente` int(10) UNSIGNED NOT NULL,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `dni` char(8) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `especialidad` varchar(80) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `egreso`
--

CREATE TABLE `egreso` (
  `id_egreso` int(10) UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `tipo_egreso` varchar(60) NOT NULL,
  `descripcion` varchar(160) DEFAULT NULL,
  `cantidad` decimal(8,2) NOT NULL DEFAULT 1.00,
  `precio` decimal(8,2) NOT NULL,
  `igv` decimal(8,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio` + `igv`) STORED,
  `metodo_pago` enum('EFECTIVO','TRANSFERENCIA','TARJETA','YAPE','PLIN') NOT NULL DEFAULT 'EFECTIVO',
  `tipo_comprobante` enum('FACTURA','BOLETA','RECIBO','NINGUNO') NOT NULL DEFAULT 'NINGUNO',
  `personal` varchar(120) DEFAULT NULL,
  `id_usuario` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `examen`
--

CREATE TABLE `examen` (
  `id_examen` int(10) UNSIGNED NOT NULL,
  `id_ciclo` smallint(5) UNSIGNED NOT NULL,
  `tipo` enum('SIMULACRO','CONOCIMIENTO','SEMANAL') NOT NULL,
  `numero` smallint(5) UNSIGNED DEFAULT NULL,
  `id_area` tinyint(3) UNSIGNED DEFAULT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horario`
--

CREATE TABLE `horario` (
  `id_horario` int(10) UNSIGNED NOT NULL,
  `id_asignacion` int(10) UNSIGNED NOT NULL,
  `dia_semana` enum('LUN','MAR','MIE','JUE','VIE','SAB','DOM') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `matricula`
--

CREATE TABLE `matricula` (
  `id_matricula` int(10) UNSIGNED NOT NULL,
  `id_alumno` int(10) UNSIGNED NOT NULL,
  `id_ciclo` smallint(5) UNSIGNED NOT NULL,
  `id_periodo` smallint(5) UNSIGNED DEFAULT NULL,
  `id_turno` tinyint(3) UNSIGNED DEFAULT NULL,
  `id_aula` smallint(5) UNSIGNED DEFAULT NULL,
  `fecha_matricula` date NOT NULL DEFAULT curdate(),
  `modalidad` enum('PRESENCIAL','VIRTUAL') NOT NULL DEFAULT 'PRESENCIAL',
  `tipo_pago` enum('CONTADO','CREDITO') NOT NULL DEFAULT 'CONTADO',
  `costo_total` decimal(8,2) NOT NULL,
  `estado` enum('VIGENTE','ANULADA','FINALIZADA') NOT NULL DEFAULT 'VIGENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000000_create_passkeys_table', 1),
(5, '2025_08_14_170933_add_two_factor_columns_to_users_table', 1),
(6, '2026_05_25_044634_create_personal_access_tokens_table', 1),
(7, '2026_05_26_070000_add_matriculas_module_extensions', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(10) UNSIGNED NOT NULL,
  `id_cuota` int(10) UNSIGNED NOT NULL,
  `id_usuario` int(10) UNSIGNED DEFAULT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp(),
  `monto` decimal(8,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA') NOT NULL DEFAULT 'EFECTIVO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `passkeys`
--

CREATE TABLE `passkeys` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `credential_id` varchar(255) NOT NULL,
  `credential` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`credential`)),
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodo_academico`
--

CREATE TABLE `periodo_academico` (
  `id_periodo` smallint(5) UNSIGNED NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `anio` smallint(5) UNSIGNED NOT NULL,
  `descripcion` varchar(160) DEFAULT NULL,
  `estado` enum('ABIERTO','CERRADO') NOT NULL DEFAULT 'ABIERTO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `periodo_academico`
--

INSERT INTO `periodo_academico` (`id_periodo`, `nombre`, `anio`, `descripcion`, `estado`) VALUES
(1, 'Periodo 2026-I', 2026, 'Periodo de prueba', 'ABIERTO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prediccion_desercion`
--

CREATE TABLE `prediccion_desercion` (
  `id_prediccion` int(10) UNSIGNED NOT NULL,
  `id_matricula` int(10) UNSIGNED NOT NULL,
  `fecha_calculo` datetime NOT NULL DEFAULT current_timestamp(),
  `riesgo_pct` decimal(5,2) NOT NULL,
  `nivel_riesgo` enum('BAJO','MEDIO','ALTO') NOT NULL,
  `prioritario` tinyint(1) GENERATED ALWAYS AS (`riesgo_pct` > 75) STORED,
  `tasa_asistencia` decimal(5,2) DEFAULT NULL,
  `promedio_examenes` decimal(7,3) DEFAULT NULL,
  `cuotas_vencidas` tinyint(3) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resultado_examen`
--

CREATE TABLE `resultado_examen` (
  `id_resultado` int(10) UNSIGNED NOT NULL,
  `id_examen` int(10) UNSIGNED NOT NULL,
  `id_matricula` int(10) UNSIGNED NOT NULL,
  `puntaje_aptitud` decimal(7,3) DEFAULT 0.000,
  `puntaje_conocimiento` decimal(7,3) DEFAULT 0.000,
  `puntaje_total` decimal(7,3) DEFAULT 0.000,
  `puesto` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `descripcion` varchar(160) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('kx6Tlz7rJ9SdretM3tpttaqcdoaQUeX4LyPF7XKC', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJaaEV6dGpuR1dDYUUzUGRUb0RHV2xKbVVFMkpFSUsyRDdkWks0cTJnIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9zaWdlZC1qb2hubmFzaC50ZXN0XC9kZW1vXC9tYXRyaWN1bGFzXC9jb25zb2xpZGFkbyIsInJvdXRlIjoiZGVtby5tYXRyaWN1bGFzLmNvbnNvbGlkYWRvIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1779776738),
('xp8JVHL6gpOjFiGfgC4mF3BzRsuDrooYsvuuA489', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiI2SmI5UXlPRmZUNk5DcE9TTnAzbGxkRnJpRGFuRTN1ekRJckVhS3N0IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOiJob21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1779776007);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turno`
--

CREATE TABLE `turno` (
  `id_turno` tinyint(3) UNSIGNED NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `turno`
--

INSERT INTO `turno` (`id_turno`, `nombre`, `hora_inicio`, `hora_fin`) VALUES
(1, 'Mañana', NULL, NULL),
(2, 'Tarde', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `id_rol` tinyint(3) UNSIGNED NOT NULL,
  `usuario` varchar(40) NOT NULL,
  `hash_password` varchar(255) NOT NULL,
  `nombres` varchar(120) NOT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  `ultimo_acceso` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id_alumno`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_alumno_carrera` (`id_carrera`),
  ADD KEY `fk_alumno_apoderado` (`id_apoderado`),
  ADD KEY `idx_alumno_nombre` (`apellidos`,`nombres`);

--
-- Indices de la tabla `apoderado`
--
ALTER TABLE `apoderado`
  ADD PRIMARY KEY (`id_apoderado`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id_area`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `asignacion_docente`
--
ALTER TABLE `asignacion_docente`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD UNIQUE KEY `uq_asignacion` (`id_docente`,`id_curso`,`id_ciclo`),
  ADD KEY `fk_asig_curso` (`id_curso`),
  ADD KEY `fk_asig_ciclo` (`id_ciclo`),
  ADD KEY `fk_asig_aula` (`id_aula`);

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD UNIQUE KEY `uq_asistencia` (`id_matricula`,`id_asignacion`,`fecha`),
  ADD KEY `fk_asist_asig` (`id_asignacion`);

--
-- Indices de la tabla `aula`
--
ALTER TABLE `aula`
  ADD PRIMARY KEY (`id_aula`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indices de la tabla `carrera`
--
ALTER TABLE `carrera`
  ADD PRIMARY KEY (`id_carrera`),
  ADD UNIQUE KEY `uq_carrera` (`id_area`,`nombre`);

--
-- Indices de la tabla `ciclo`
--
ALTER TABLE `ciclo`
  ADD PRIMARY KEY (`id_ciclo`),
  ADD UNIQUE KEY `uq_ciclo` (`nombre`),
  ADD KEY `ciclo_id_periodo_foreign` (`id_periodo`);

--
-- Indices de la tabla `comprobante_pago`
--
ALTER TABLE `comprobante_pago`
  ADD PRIMARY KEY (`id_comprobante`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `fk_comp_matricula` (`id_matricula`);

--
-- Indices de la tabla `cuota`
--
ALTER TABLE `cuota`
  ADD PRIMARY KEY (`id_cuota`),
  ADD UNIQUE KEY `uq_cuota` (`id_comprobante`,`numero_cuota`);

--
-- Indices de la tabla `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`),
  ADD UNIQUE KEY `uq_curso` (`nombre`);

--
-- Indices de la tabla `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`id_docente`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `egreso`
--
ALTER TABLE `egreso`
  ADD PRIMARY KEY (`id_egreso`),
  ADD KEY `fk_egreso_usuario` (`id_usuario`);

--
-- Indices de la tabla `examen`
--
ALTER TABLE `examen`
  ADD PRIMARY KEY (`id_examen`),
  ADD KEY `fk_examen_ciclo` (`id_ciclo`),
  ADD KEY `fk_examen_area` (`id_area`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indices de la tabla `horario`
--
ALTER TABLE `horario`
  ADD PRIMARY KEY (`id_horario`),
  ADD KEY `fk_horario_asig` (`id_asignacion`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `matricula`
--
ALTER TABLE `matricula`
  ADD PRIMARY KEY (`id_matricula`),
  ADD UNIQUE KEY `uq_matricula` (`id_alumno`,`id_ciclo`),
  ADD KEY `fk_matricula_ciclo` (`id_ciclo`),
  ADD KEY `matricula_id_periodo_foreign` (`id_periodo`),
  ADD KEY `matricula_id_turno_foreign` (`id_turno`),
  ADD KEY `matricula_id_aula_foreign` (`id_aula`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `fk_pago_cuota` (`id_cuota`),
  ADD KEY `fk_pago_usuario` (`id_usuario`);

--
-- Indices de la tabla `passkeys`
--
ALTER TABLE `passkeys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `passkeys_credential_id_unique` (`credential_id`),
  ADD KEY `passkeys_user_id_index` (`user_id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `periodo_academico`
--
ALTER TABLE `periodo_academico`
  ADD PRIMARY KEY (`id_periodo`),
  ADD UNIQUE KEY `uq_periodo_nombre` (`nombre`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `prediccion_desercion`
--
ALTER TABLE `prediccion_desercion`
  ADD PRIMARY KEY (`id_prediccion`),
  ADD KEY `fk_pred_matricula` (`id_matricula`),
  ADD KEY `idx_pred_riesgo` (`riesgo_pct`);

--
-- Indices de la tabla `resultado_examen`
--
ALTER TABLE `resultado_examen`
  ADD PRIMARY KEY (`id_resultado`),
  ADD UNIQUE KEY `uq_resultado` (`id_examen`,`id_matricula`),
  ADD KEY `fk_resul_matricula` (`id_matricula`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`id_turno`),
  ADD UNIQUE KEY `turno_nombre_unique` (`nombre`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `fk_usuario_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id_alumno` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `apoderado`
--
ALTER TABLE `apoderado`
  MODIFY `id_apoderado` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `id_area` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `asignacion_docente`
--
ALTER TABLE `asignacion_docente`
  MODIFY `id_asignacion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id_asistencia` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `aula`
--
ALTER TABLE `aula`
  MODIFY `id_aula` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `carrera`
--
ALTER TABLE `carrera`
  MODIFY `id_carrera` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ciclo`
--
ALTER TABLE `ciclo`
  MODIFY `id_ciclo` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `comprobante_pago`
--
ALTER TABLE `comprobante_pago`
  MODIFY `id_comprobante` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cuota`
--
ALTER TABLE `cuota`
  MODIFY `id_cuota` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `docente`
--
ALTER TABLE `docente`
  MODIFY `id_docente` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `egreso`
--
ALTER TABLE `egreso`
  MODIFY `id_egreso` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `examen`
--
ALTER TABLE `examen`
  MODIFY `id_examen` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horario`
--
ALTER TABLE `horario`
  MODIFY `id_horario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `matricula`
--
ALTER TABLE `matricula`
  MODIFY `id_matricula` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `passkeys`
--
ALTER TABLE `passkeys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `periodo_academico`
--
ALTER TABLE `periodo_academico`
  MODIFY `id_periodo` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prediccion_desercion`
--
ALTER TABLE `prediccion_desercion`
  MODIFY `id_prediccion` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resultado_examen`
--
ALTER TABLE `resultado_examen`
  MODIFY `id_resultado` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `turno`
--
ALTER TABLE `turno`
  MODIFY `id_turno` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alumno`
--
ALTER TABLE `alumno`
  ADD CONSTRAINT `fk_alumno_apoderado` FOREIGN KEY (`id_apoderado`) REFERENCES `apoderado` (`id_apoderado`),
  ADD CONSTRAINT `fk_alumno_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carrera` (`id_carrera`);

--
-- Filtros para la tabla `asignacion_docente`
--
ALTER TABLE `asignacion_docente`
  ADD CONSTRAINT `fk_asig_aula` FOREIGN KEY (`id_aula`) REFERENCES `aula` (`id_aula`),
  ADD CONSTRAINT `fk_asig_ciclo` FOREIGN KEY (`id_ciclo`) REFERENCES `ciclo` (`id_ciclo`),
  ADD CONSTRAINT `fk_asig_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`),
  ADD CONSTRAINT `fk_asig_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`);

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `fk_asist_asig` FOREIGN KEY (`id_asignacion`) REFERENCES `asignacion_docente` (`id_asignacion`),
  ADD CONSTRAINT `fk_asist_matricula` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`);

--
-- Filtros para la tabla `carrera`
--
ALTER TABLE `carrera`
  ADD CONSTRAINT `fk_carrera_area` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`);

--
-- Filtros para la tabla `ciclo`
--
ALTER TABLE `ciclo`
  ADD CONSTRAINT `ciclo_id_periodo_foreign` FOREIGN KEY (`id_periodo`) REFERENCES `periodo_academico` (`id_periodo`);

--
-- Filtros para la tabla `comprobante_pago`
--
ALTER TABLE `comprobante_pago`
  ADD CONSTRAINT `fk_comp_matricula` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`);

--
-- Filtros para la tabla `cuota`
--
ALTER TABLE `cuota`
  ADD CONSTRAINT `fk_cuota_comp` FOREIGN KEY (`id_comprobante`) REFERENCES `comprobante_pago` (`id_comprobante`) ON DELETE CASCADE;

--
-- Filtros para la tabla `egreso`
--
ALTER TABLE `egreso`
  ADD CONSTRAINT `fk_egreso_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `examen`
--
ALTER TABLE `examen`
  ADD CONSTRAINT `fk_examen_area` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`),
  ADD CONSTRAINT `fk_examen_ciclo` FOREIGN KEY (`id_ciclo`) REFERENCES `ciclo` (`id_ciclo`);

--
-- Filtros para la tabla `horario`
--
ALTER TABLE `horario`
  ADD CONSTRAINT `fk_horario_asig` FOREIGN KEY (`id_asignacion`) REFERENCES `asignacion_docente` (`id_asignacion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `matricula`
--
ALTER TABLE `matricula`
  ADD CONSTRAINT `fk_matricula_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`),
  ADD CONSTRAINT `fk_matricula_ciclo` FOREIGN KEY (`id_ciclo`) REFERENCES `ciclo` (`id_ciclo`),
  ADD CONSTRAINT `matricula_id_aula_foreign` FOREIGN KEY (`id_aula`) REFERENCES `aula` (`id_aula`),
  ADD CONSTRAINT `matricula_id_periodo_foreign` FOREIGN KEY (`id_periodo`) REFERENCES `periodo_academico` (`id_periodo`),
  ADD CONSTRAINT `matricula_id_turno_foreign` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `fk_pago_cuota` FOREIGN KEY (`id_cuota`) REFERENCES `cuota` (`id_cuota`),
  ADD CONSTRAINT `fk_pago_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `passkeys`
--
ALTER TABLE `passkeys`
  ADD CONSTRAINT `passkeys_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `prediccion_desercion`
--
ALTER TABLE `prediccion_desercion`
  ADD CONSTRAINT `fk_pred_matricula` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`);

--
-- Filtros para la tabla `resultado_examen`
--
ALTER TABLE `resultado_examen`
  ADD CONSTRAINT `fk_resul_examen` FOREIGN KEY (`id_examen`) REFERENCES `examen` (`id_examen`),
  ADD CONSTRAINT `fk_resul_matricula` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
