-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: gpti_siged
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alumno`
--

DROP TABLE IF EXISTS `alumno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumno` (
  `id_alumno` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(15) NOT NULL,
  `nombres` varchar(80) NOT NULL,
  `apellidos` varchar(80) NOT NULL,
  `dni` char(8) DEFAULT NULL,
  `fecha_nac` date DEFAULT NULL,
  `sexo` enum('M','F','OTRO') DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `colegio_procedencia_id` smallint(5) unsigned DEFAULT NULL,
  `id_carrera` smallint(5) unsigned DEFAULT NULL,
  `id_apoderado` int(10) unsigned DEFAULT NULL,
  `estado` enum('ACTIVO','MATRICULADO','RETIRADO','EGRESADO') NOT NULL DEFAULT 'ACTIVO',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_alumno`),
  UNIQUE KEY `alumno_codigo_unique` (`codigo`),
  UNIQUE KEY `alumno_dni_unique` (`dni`),
  KEY `alumno_id_carrera_foreign` (`id_carrera`),
  KEY `alumno_id_apoderado_foreign` (`id_apoderado`),
  KEY `idx_alumno_nombre` (`apellidos`,`nombres`),
  KEY `alumno_colegio_procedencia_id_index` (`colegio_procedencia_id`),
  CONSTRAINT `alumno_colegio_proc_fk` FOREIGN KEY (`colegio_procedencia_id`) REFERENCES `colegio_procedencia` (`id_colegio_procedencia`) ON DELETE SET NULL,
  CONSTRAINT `alumno_id_apoderado_foreign` FOREIGN KEY (`id_apoderado`) REFERENCES `apoderado` (`id_apoderado`),
  CONSTRAINT `alumno_id_carrera_foreign` FOREIGN KEY (`id_carrera`) REFERENCES `carrera` (`id_carrera`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `apoderado`
--

DROP TABLE IF EXISTS `apoderado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `apoderado` (
  `id_apoderado` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombres` varchar(120) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_apoderado`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `area`
--

DROP TABLE IF EXISTS `area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `area` (
  `id_area` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` char(1) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  PRIMARY KEY (`id_area`),
  UNIQUE KEY `area_codigo_unique` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asignacion_docente`
--

DROP TABLE IF EXISTS `asignacion_docente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignacion_docente` (
  `id_asignacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_docente` bigint(20) unsigned NOT NULL,
  `id_curso` smallint(5) unsigned NOT NULL,
  `id_ciclo` smallint(5) unsigned NOT NULL,
  `id_aula` smallint(5) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_asignacion`),
  UNIQUE KEY `uq_asignacion_curso_ciclo` (`id_curso`,`id_ciclo`),
  KEY `asignacion_docente_id_ciclo_foreign` (`id_ciclo`),
  KEY `idx_asignacion_docente_ciclo` (`id_docente`,`id_ciclo`),
  KEY `idx_asignacion_aula_ciclo` (`id_aula`,`id_ciclo`),
  CONSTRAINT `asignacion_docente_id_aula_foreign` FOREIGN KEY (`id_aula`) REFERENCES `aula` (`id_aula`) ON DELETE SET NULL,
  CONSTRAINT `asignacion_docente_id_ciclo_foreign` FOREIGN KEY (`id_ciclo`) REFERENCES `ciclo` (`id_ciclo`),
  CONSTRAINT `asignacion_docente_id_curso_foreign` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `asignacion_docente_id_docente_foreign` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asistencia`
--

DROP TABLE IF EXISTS `asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asistencia` (
  `id_asistencia` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tipo_alumno` enum('INTERNO','CONVENIO') NOT NULL DEFAULT 'INTERNO',
  `dni` char(8) DEFAULT NULL,
  `nombres_convenio` varchar(160) DEFAULT NULL,
  `id_matricula` int(10) unsigned DEFAULT NULL,
  `id_asignacion` int(10) unsigned DEFAULT NULL,
  `fecha` date NOT NULL,
  `estado` enum('ASISTIO','FALTO','TARDANZA','JUSTIFICADO') NOT NULL,
  `registrado_en` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `uq_asistencia` (`id_matricula`,`id_asignacion`,`fecha`),
  KEY `asistencia_id_asignacion_foreign` (`id_asignacion`),
  KEY `idx_asistencia_tipo_dni_fecha` (`tipo_alumno`,`dni`,`fecha`),
  KEY `asistencia_tipo_alumno_index` (`tipo_alumno`),
  KEY `asistencia_dni_index` (`dni`),
  KEY `asistencia_registrado_en_index` (`registrado_en`),
  CONSTRAINT `asistencia_id_asignacion_foreign` FOREIGN KEY (`id_asignacion`) REFERENCES `asignacion_docente` (`id_asignacion`) ON DELETE CASCADE,
  CONSTRAINT `asistencia_id_matricula_foreign` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=308 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aula`
--

DROP TABLE IF EXISTS `aula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `aula` (
  `id_aula` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `capacidad` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_aula`),
  UNIQUE KEY `aula_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `carrera`
--

DROP TABLE IF EXISTS `carrera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carrera` (
  `id_carrera` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `id_area` tinyint(3) unsigned NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `puntaje_min` decimal(7,3) DEFAULT NULL,
  `puntaje_max` decimal(7,3) DEFAULT NULL,
  PRIMARY KEY (`id_carrera`),
  UNIQUE KEY `uq_carrera` (`id_area`,`nombre`),
  CONSTRAINT `carrera_id_area_foreign` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ciclo`
--

DROP TABLE IF EXISTS `ciclo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ciclo` (
  `id_ciclo` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `id_periodo` smallint(5) unsigned DEFAULT NULL,
  `nombre` varchar(60) NOT NULL,
  `tipo_ciclo` varchar(40) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `costo_base` decimal(8,2) NOT NULL DEFAULT 0.00,
  `estado` enum('ABIERTO','EN_CURSO','CERRADO') NOT NULL DEFAULT 'ABIERTO',
  PRIMARY KEY (`id_ciclo`),
  UNIQUE KEY `uq_ciclo` (`nombre`),
  KEY `ciclo_id_periodo_foreign` (`id_periodo`),
  CONSTRAINT `ciclo_id_periodo_foreign` FOREIGN KEY (`id_periodo`) REFERENCES `periodo_academico` (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `colegio_procedencia`
--

DROP TABLE IF EXISTS `colegio_procedencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `colegio_procedencia` (
  `id_colegio_procedencia` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id_colegio_procedencia`),
  UNIQUE KEY `colegio_procedencia_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comprobante_pago`
--

DROP TABLE IF EXISTS `comprobante_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comprobante_pago` (
  `id_comprobante` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_matricula` int(10) unsigned NOT NULL,
  `numero` varchar(15) DEFAULT NULL,
  `tipo` enum('BOLETA','FACTURA','RECIBO','NINGUNO') NOT NULL DEFAULT 'BOLETA',
  `fecha_emision` date NOT NULL,
  `costo_total` decimal(8,2) NOT NULL,
  `saldo_pendiente` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_comprobante`),
  UNIQUE KEY `comprobante_pago_numero_unique` (`numero`),
  KEY `idx_comprobante_matricula` (`id_matricula`),
  CONSTRAINT `comprobante_pago_id_matricula_foreign` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuota`
--

DROP TABLE IF EXISTS `cuota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cuota` (
  `id_cuota` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_comprobante` int(10) unsigned NOT NULL,
  `numero_cuota` tinyint(3) unsigned NOT NULL,
  `monto` decimal(8,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('PENDIENTE','PAGADA','VENCIDA') NOT NULL DEFAULT 'PENDIENTE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_cuota`),
  UNIQUE KEY `uq_cuota` (`id_comprobante`,`numero_cuota`),
  KEY `idx_cuota_estado_vencimiento` (`estado`,`fecha_vencimiento`),
  CONSTRAINT `cuota_id_comprobante_foreign` FOREIGN KEY (`id_comprobante`) REFERENCES `comprobante_pago` (`id_comprobante`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `curso` (
  `id_curso` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `area_conoc` varchar(40) DEFAULT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#1a237e',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_curso`),
  UNIQUE KEY `uq_curso` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `docentes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombres` varchar(255) NOT NULL,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `dni` varchar(15) NOT NULL,
  `curso_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `docentes_correo_unique` (`correo`),
  UNIQUE KEY `docentes_dni_unique` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `egreso`
--

DROP TABLE IF EXISTS `egreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `egreso` (
  `id_egreso` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_egreso`),
  KEY `egreso_user_id_foreign` (`user_id`),
  CONSTRAINT `egreso_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `examen`
--

DROP TABLE IF EXISTS `examen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `examen` (
  `id_examen` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_ciclo` smallint(5) unsigned NOT NULL,
  `tipo` enum('SIMULACRO','CONOCIMIENTO','SEMANAL') NOT NULL,
  `numero` smallint(5) unsigned DEFAULT NULL,
  `id_area` tinyint(3) unsigned DEFAULT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(120) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_examen`),
  KEY `examen_id_ciclo_foreign` (`id_ciclo`),
  KEY `examen_id_area_foreign` (`id_area`),
  CONSTRAINT `examen_id_area_foreign` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`) ON DELETE SET NULL,
  CONSTRAINT `examen_id_ciclo_foreign` FOREIGN KEY (`id_ciclo`) REFERENCES `ciclo` (`id_ciclo`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `examen_metrica`
--

DROP TABLE IF EXISTS `examen_metrica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `examen_metrica` (
  `id_metrica` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_examen` int(10) unsigned NOT NULL,
  `id_area` tinyint(3) unsigned NOT NULL,
  `puntaje_max` decimal(7,3) NOT NULL,
  `puntaje_min` decimal(7,3) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_metrica`),
  UNIQUE KEY `uq_examen_area` (`id_examen`,`id_area`),
  KEY `examen_metrica_id_area_foreign` (`id_area`),
  CONSTRAINT `examen_metrica_id_area_foreign` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`) ON DELETE CASCADE,
  CONSTRAINT `examen_metrica_id_examen_foreign` FOREIGN KEY (`id_examen`) REFERENCES `examen` (`id_examen`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `horario`
--

DROP TABLE IF EXISTS `horario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `horario` (
  `id_horario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_asignacion` int(10) unsigned NOT NULL,
  `dia_semana` enum('LUN','MAR','MIE','JUE','VIE','SAB','DOM') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_horario`),
  KEY `horario_id_asignacion_foreign` (`id_asignacion`),
  KEY `idx_horario_dia_horas` (`dia_semana`,`hora_inicio`,`hora_fin`),
  CONSTRAINT `horario_id_asignacion_foreign` FOREIGN KEY (`id_asignacion`) REFERENCES `asignacion_docente` (`id_asignacion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `matricula`
--

DROP TABLE IF EXISTS `matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `matricula` (
  `id_matricula` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_alumno` int(10) unsigned NOT NULL,
  `id_ciclo` smallint(5) unsigned NOT NULL,
  `id_periodo` smallint(5) unsigned NOT NULL,
  `id_turno` tinyint(3) unsigned NOT NULL,
  `id_aula` smallint(5) unsigned NOT NULL,
  `fecha_matricula` date NOT NULL,
  `modalidad` enum('PRESENCIAL','VIRTUAL') NOT NULL DEFAULT 'PRESENCIAL',
  `tipo_pago` enum('CONTADO','CREDITO') NOT NULL DEFAULT 'CONTADO',
  `costo_total` decimal(8,2) NOT NULL,
  `estado` enum('VIGENTE','ANULADA','FINALIZADA') NOT NULL DEFAULT 'VIGENTE',
  PRIMARY KEY (`id_matricula`),
  UNIQUE KEY `uq_matricula` (`id_alumno`,`id_ciclo`),
  KEY `matricula_id_ciclo_foreign` (`id_ciclo`),
  KEY `matricula_id_periodo_foreign` (`id_periodo`),
  KEY `matricula_id_turno_foreign` (`id_turno`),
  KEY `matricula_id_aula_foreign` (`id_aula`),
  CONSTRAINT `matricula_id_alumno_foreign` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`),
  CONSTRAINT `matricula_id_aula_foreign` FOREIGN KEY (`id_aula`) REFERENCES `aula` (`id_aula`),
  CONSTRAINT `matricula_id_ciclo_foreign` FOREIGN KEY (`id_ciclo`) REFERENCES `ciclo` (`id_ciclo`),
  CONSTRAINT `matricula_id_periodo_foreign` FOREIGN KEY (`id_periodo`) REFERENCES `periodo_academico` (`id_periodo`),
  CONSTRAINT `matricula_id_turno_foreign` FOREIGN KEY (`id_turno`) REFERENCES `turno` (`id_turno`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pago` (
  `id_pago` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_cuota` int(10) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp(),
  `monto` decimal(8,2) NOT NULL,
  `metodo_pago` enum('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA') NOT NULL DEFAULT 'EFECTIVO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `pago_user_id_foreign` (`user_id`),
  KEY `idx_pago_cuota_fecha` (`id_cuota`,`fecha_pago`),
  CONSTRAINT `pago_id_cuota_foreign` FOREIGN KEY (`id_cuota`) REFERENCES `cuota` (`id_cuota`) ON DELETE CASCADE,
  CONSTRAINT `pago_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passkeys`
--

DROP TABLE IF EXISTS `passkeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `passkeys` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `credential_id` varchar(255) NOT NULL,
  `credential` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`credential`)),
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `passkeys_credential_id_unique` (`credential_id`),
  KEY `passkeys_user_id_index` (`user_id`),
  CONSTRAINT `passkeys_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_academico`
--

DROP TABLE IF EXISTS `periodo_academico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `periodo_academico` (
  `id_periodo` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `anio` smallint(5) unsigned NOT NULL,
  `descripcion` varchar(160) DEFAULT NULL,
  `estado` enum('ABIERTO','CERRADO') NOT NULL DEFAULT 'ABIERTO',
  PRIMARY KEY (`id_periodo`),
  UNIQUE KEY `uq_periodo_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prediccion_desercion`
--

DROP TABLE IF EXISTS `prediccion_desercion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `prediccion_desercion` (
  `id_prediccion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_matricula` int(10) unsigned NOT NULL,
  `fecha_calculo` datetime NOT NULL DEFAULT current_timestamp(),
  `riesgo_pct` decimal(5,2) NOT NULL,
  `nivel_riesgo` enum('BAJO','MEDIO','ALTO') NOT NULL,
  `prioritario` tinyint(1) GENERATED ALWAYS AS (`riesgo_pct` > 75) STORED,
  `tasa_asistencia` decimal(5,2) DEFAULT NULL,
  `promedio_examenes` decimal(7,3) DEFAULT NULL,
  `cuotas_vencidas` tinyint(3) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_prediccion`),
  KEY `prediccion_desercion_id_matricula_foreign` (`id_matricula`),
  KEY `idx_pred_riesgo` (`riesgo_pct`),
  CONSTRAINT `prediccion_desercion_id_matricula_foreign` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resultado_examen`
--

DROP TABLE IF EXISTS `resultado_examen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resultado_examen` (
  `id_resultado` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_examen` int(10) unsigned NOT NULL,
  `id_matricula` int(10) unsigned NOT NULL,
  `puntaje_aptitud` decimal(7,3) NOT NULL DEFAULT 0.000,
  `puntaje_conocimiento` decimal(7,3) NOT NULL DEFAULT 0.000,
  `puntaje_total` decimal(7,3) NOT NULL DEFAULT 0.000,
  `puesto` smallint(5) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_resultado`),
  UNIQUE KEY `uq_resultado` (`id_examen`,`id_matricula`),
  KEY `resultado_examen_id_matricula_foreign` (`id_matricula`),
  CONSTRAINT `resultado_examen_id_examen_foreign` FOREIGN KEY (`id_examen`) REFERENCES `examen` (`id_examen`) ON DELETE CASCADE,
  CONSTRAINT `resultado_examen_id_matricula_foreign` FOREIGN KEY (`id_matricula`) REFERENCES `matricula` (`id_matricula`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rol` (
  `id_rol` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `descripcion` varchar(160) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `rol_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rol_permiso` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_rol` tinyint(3) unsigned NOT NULL,
  `modulo` varchar(40) NOT NULL,
  `puede_ver` tinyint(1) NOT NULL DEFAULT 0,
  `puede_editar` tinyint(1) NOT NULL DEFAULT 0,
  `puede_eliminar` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rol_permiso_id_rol_modulo_unique` (`id_rol`,`modulo`),
  CONSTRAINT `rol_permiso_id_rol_foreign` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `turno`
--

DROP TABLE IF EXISTS `turno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `turno` (
  `id_turno` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(40) NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  PRIMARY KEY (`id_turno`),
  UNIQUE KEY `turno_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'ACTIVO',
  `id_rol` tinyint(3) unsigned DEFAULT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_estado_index` (`estado`),
  KEY `users_id_rol_index` (`id_rol`),
  CONSTRAINT `users_id_rol_foreign` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'gpti_siged'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-08  0:00:56
