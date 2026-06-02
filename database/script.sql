-- =====================================================================
--  BASE DE DATOS: ACADEMIA PRE-UNIVERSITARIA "JOHN NASH"
--  Sistema de Gestión Académica, Financiera, BI e IA de Deserción
--  Motor: MySQL 8.0+  /  Charset: utf8mb4
--  Fecha de elaboración: 25/05/2026
-- =====================================================================
--  Cobertura por módulos (alineado a la Matriz de Trazabilidad):
--    RI001 Registro de Alumnos        -> alumno, apoderado
--    RI002 Matrícula                  -> ciclo, matricula
--    RI003 Cursos / Docentes          -> curso, docente, horario, asignacion_docente
--    RI004 Asistencia                 -> asistencia
--    RI005 Pagos                      -> comprobante_pago, cuota, pago
--    RI006 Notas / Rendimiento        -> examen, resultado_examen
--    RI007 Usuarios y Roles           -> rol, usuario
--    RI008 Dashboard BI               -> vistas vw_bi_*
--    RI009 IA Deserción               -> prediccion_desercion + vista vw_features_ia
--    RI010-014 (egresos, seguridad…)  -> egreso, (auditoría sugerida)
-- =====================================================================

DROP DATABASE IF EXISTS academia_john_nash;
CREATE DATABASE academia_john_nash
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE academia_john_nash;

-- =====================================================================
--  MÓDULO 0: SEGURIDAD — USUARIOS Y ROLES  (RI007)
-- =====================================================================
CREATE TABLE rol (
  id_rol        TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(40)  NOT NULL UNIQUE,        -- Administrador, Cajero, Docente, Director, Tutor
  descripcion   VARCHAR(160)
) ENGINE=InnoDB;

CREATE TABLE usuario (
  id_usuario    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_rol        TINYINT UNSIGNED NOT NULL,
  usuario       VARCHAR(40)  NOT NULL UNIQUE,
  hash_password VARCHAR(255) NOT NULL,               -- almacenar SIEMPRE el hash, nunca texto plano
  nombres       VARCHAR(120) NOT NULL,
  correo        VARCHAR(120) UNIQUE,
  estado        ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  ultimo_acceso DATETIME,
  creado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 1: CATÁLOGOS ACADÉMICOS — ÁREAS Y CARRERAS
--  (de la Imagen 2: AREA_A/B/C/D y carreras con puntaje min/max simulacro)
-- =====================================================================
CREATE TABLE area (
  id_area       TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  codigo        CHAR(1) NOT NULL UNIQUE,             -- A, B, C, D
  nombre        VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE carrera (
  id_carrera    SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_area       TINYINT UNSIGNED NOT NULL,
  nombre        VARCHAR(120) NOT NULL,
  -- Puntajes de referencia del examen simulacro (Imagen 2)
  puntaje_min   DECIMAL(7,3),
  puntaje_max   DECIMAL(7,3),
  CONSTRAINT fk_carrera_area FOREIGN KEY (id_area) REFERENCES area(id_area),
  UNIQUE KEY uq_carrera (id_area, nombre)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 2: REGISTRO DE ALUMNOS  (RI001)
--  (Imagen 1: CODIGO, NOMBRE COMPLETO, TIPO CICLO, CARRERA, ÁREA)
-- =====================================================================
CREATE TABLE apoderado (
  id_apoderado  INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombres       VARCHAR(120) NOT NULL,
  dni           CHAR(8) UNIQUE,
  telefono      VARCHAR(20),
  parentesco    VARCHAR(40),                          -- Padre, Madre, Tutor
  correo        VARCHAR(120)
) ENGINE=InnoDB;

CREATE TABLE alumno (
  id_alumno     INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  codigo        VARCHAR(15) NOT NULL UNIQUE,          -- "Código" del alumno (Imagen 1 y 3)
  nombres       VARCHAR(80)  NOT NULL,
  apellidos     VARCHAR(80)  NOT NULL,
  dni           CHAR(8) UNIQUE,
  fecha_nac     DATE,
  sexo          ENUM('M','F','OTRO'),
  telefono      VARCHAR(20),
  correo        VARCHAR(120),
  direccion     VARCHAR(160),
  colegio_proc  VARCHAR(120),                          -- colegio de procedencia
  id_carrera    SMALLINT UNSIGNED,                     -- carrera a la que postula
  id_apoderado  INT UNSIGNED,
  estado        ENUM('ACTIVO','RETIRADO','EGRESADO') NOT NULL DEFAULT 'ACTIVO',
  creado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alumno_carrera   FOREIGN KEY (id_carrera)   REFERENCES carrera(id_carrera),
  CONSTRAINT fk_alumno_apoderado FOREIGN KEY (id_apoderado) REFERENCES apoderado(id_apoderado),
  INDEX idx_alumno_nombre (apellidos, nombres)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 3: MATRÍCULA Y CICLOS  (RI002)
--  (Imagen 7: concepto = ciclo, modalidad, tipo de pago)
-- =====================================================================
CREATE TABLE ciclo (
  id_ciclo      SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(60) NOT NULL,                 -- "Ciclo Verano 2026", "Anual 2026", etc.
  tipo_ciclo    VARCHAR(40),                          -- "TIPO CICLO" (Imagen 1): Intensivo, Anual, Semestral
  fecha_inicio  DATE NOT NULL,
  fecha_fin     DATE NOT NULL,
  costo_base    DECIMAL(8,2) NOT NULL DEFAULT 0,      -- costo de referencia del ciclo
  estado        ENUM('ABIERTO','EN_CURSO','CERRADO') NOT NULL DEFAULT 'ABIERTO',
  UNIQUE KEY uq_ciclo (nombre)
) ENGINE=InnoDB;

CREATE TABLE matricula (
  id_matricula  INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_alumno     INT UNSIGNED NOT NULL,
  id_ciclo      SMALLINT UNSIGNED NOT NULL,
  fecha_matricula DATE NOT NULL DEFAULT (CURRENT_DATE),
  modalidad     ENUM('PRESENCIAL','VIRTUAL') NOT NULL DEFAULT 'PRESENCIAL',
  tipo_pago     ENUM('CONTADO','CREDITO') NOT NULL DEFAULT 'CONTADO',
  costo_total   DECIMAL(8,2) NOT NULL,                -- costo pactado de esta matrícula
  estado        ENUM('VIGENTE','ANULADA','FINALIZADA') NOT NULL DEFAULT 'VIGENTE',
  CONSTRAINT fk_matricula_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
  CONSTRAINT fk_matricula_ciclo  FOREIGN KEY (id_ciclo)  REFERENCES ciclo(id_ciclo),
  UNIQUE KEY uq_matricula (id_alumno, id_ciclo)        -- 1 matrícula por alumno por ciclo
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 4: DOCENTES, CURSOS Y HORARIOS  (RI003)
-- =====================================================================
CREATE TABLE docente (
  id_docente    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombres       VARCHAR(80) NOT NULL,
  apellidos     VARCHAR(80) NOT NULL,
  dni           CHAR(8) UNIQUE,
  telefono      VARCHAR(20),
  correo        VARCHAR(120),
  especialidad  VARCHAR(80),                           -- curso/materia que dicta
  estado        ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

CREATE TABLE curso (
  id_curso      SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(80) NOT NULL,                  -- Aritmética, Álgebra, Biología, etc.
  area_conoc    VARCHAR(40),                           -- Razonamiento, Ciencias, Letras...
  UNIQUE KEY uq_curso (nombre)
) ENGINE=InnoDB;

CREATE TABLE aula (
  id_aula       SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre        VARCHAR(40) NOT NULL UNIQUE,           -- "Aula 101"
  capacidad     SMALLINT UNSIGNED
) ENGINE=InnoDB;

-- Asignación: un docente dicta un curso en un ciclo
CREATE TABLE asignacion_docente (
  id_asignacion INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_docente    INT UNSIGNED NOT NULL,
  id_curso      SMALLINT UNSIGNED NOT NULL,
  id_ciclo      SMALLINT UNSIGNED NOT NULL,
  id_aula       SMALLINT UNSIGNED,
  CONSTRAINT fk_asig_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente),
  CONSTRAINT fk_asig_curso   FOREIGN KEY (id_curso)   REFERENCES curso(id_curso),
  CONSTRAINT fk_asig_ciclo   FOREIGN KEY (id_ciclo)   REFERENCES ciclo(id_ciclo),
  CONSTRAINT fk_asig_aula    FOREIGN KEY (id_aula)    REFERENCES aula(id_aula),
  UNIQUE KEY uq_asignacion (id_docente, id_curso, id_ciclo)
) ENGINE=InnoDB;

-- Horario por asignación (valida cruces docente/aula a nivel lógico vía app)
CREATE TABLE horario (
  id_horario    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_asignacion INT UNSIGNED NOT NULL,
  dia_semana    ENUM('LUN','MAR','MIE','JUE','VIE','SAB','DOM') NOT NULL,
  hora_inicio   TIME NOT NULL,
  hora_fin      TIME NOT NULL,
  CONSTRAINT fk_horario_asig FOREIGN KEY (id_asignacion) REFERENCES asignacion_docente(id_asignacion)
    ON DELETE CASCADE,
  CONSTRAINT chk_horas CHECK (hora_fin > hora_inicio)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 5: ASISTENCIA  (RI004)
-- =====================================================================
CREATE TABLE asistencia (
  id_asistencia INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_matricula  INT UNSIGNED NOT NULL,
  id_asignacion INT UNSIGNED NOT NULL,                 -- curso/docente al que asiste
  fecha         DATE NOT NULL,
  estado        ENUM('ASISTIO','FALTO','TARDANZA','JUSTIFICADO') NOT NULL,
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asist_matricula FOREIGN KEY (id_matricula)  REFERENCES matricula(id_matricula),
  CONSTRAINT fk_asist_asig      FOREIGN KEY (id_asignacion) REFERENCES asignacion_docente(id_asignacion),
  UNIQUE KEY uq_asistencia (id_matricula, id_asignacion, fecha)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 6: EXÁMENES Y RENDIMIENTO  (RI006)
--  (Imagen 3: tipos Simulacro, Conocimiento, Semanal; columnas Aptitud,
--   Conocimientos, Puntaje; por Área A/B/C/D)
-- =====================================================================
CREATE TABLE examen (
  id_examen     INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_ciclo      SMALLINT UNSIGNED NOT NULL,
  tipo          ENUM('SIMULACRO','CONOCIMIENTO','SEMANAL') NOT NULL,
  numero        SMALLINT UNSIGNED,                     -- N° de simulacro/semanal
  id_area       TINYINT UNSIGNED,                      -- área evaluada (A/B/C/D), opcional
  fecha         DATE NOT NULL,
  descripcion   VARCHAR(120),
  CONSTRAINT fk_examen_ciclo FOREIGN KEY (id_ciclo) REFERENCES ciclo(id_ciclo),
  CONSTRAINT fk_examen_area  FOREIGN KEY (id_area)  REFERENCES area(id_area)
) ENGINE=InnoDB;

CREATE TABLE resultado_examen (
  id_resultado  INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_examen     INT UNSIGNED NOT NULL,
  id_matricula  INT UNSIGNED NOT NULL,
  -- Desglose de la Imagen 3:
  puntaje_aptitud      DECIMAL(7,3) DEFAULT 0,         -- "Aptitud"
  puntaje_conocimiento DECIMAL(7,3) DEFAULT 0,         -- "Conocimientos"
  puntaje_total        DECIMAL(7,3) DEFAULT 0,         -- "Puntaje"
  puesto        SMALLINT UNSIGNED,                      -- ranking opcional
  CONSTRAINT fk_resul_examen    FOREIGN KEY (id_examen)    REFERENCES examen(id_examen),
  CONSTRAINT fk_resul_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),
  UNIQUE KEY uq_resultado (id_examen, id_matricula)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 7: PAGOS, CUOTAS Y COMPROBANTES  (RI005)
--  (Imagen 5 y 7: hasta 4 cuotas, costo, comprobante, cancelado)
-- =====================================================================
CREATE TABLE comprobante_pago (
  id_comprobante INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_matricula   INT UNSIGNED NOT NULL,
  numero         VARCHAR(15) UNIQUE,                   -- N° de comprobante (Imagen 7: 0169)
  tipo           ENUM('BOLETA','FACTURA','RECIBO','NINGUNO') NOT NULL DEFAULT 'BOLETA',
  fecha_emision  DATE NOT NULL DEFAULT (CURRENT_DATE),
  costo_total    DECIMAL(8,2) NOT NULL,
  saldo_pendiente DECIMAL(8,2) NOT NULL,
  CONSTRAINT fk_comp_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula)
) ENGINE=InnoDB;

-- Cronograma de cuotas (máximo 4 según Imagen 7)
CREATE TABLE cuota (
  id_cuota       INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_comprobante INT UNSIGNED NOT NULL,
  numero_cuota   TINYINT UNSIGNED NOT NULL,            -- 1..4
  monto          DECIMAL(8,2) NOT NULL,
  fecha_venc     DATE NOT NULL,
  estado         ENUM('PENDIENTE','PAGADA','VENCIDA') NOT NULL DEFAULT 'PENDIENTE',
  CONSTRAINT fk_cuota_comp FOREIGN KEY (id_comprobante) REFERENCES comprobante_pago(id_comprobante)
    ON DELETE CASCADE,
  CONSTRAINT chk_num_cuota CHECK (numero_cuota BETWEEN 1 AND 4),
  UNIQUE KEY uq_cuota (id_comprobante, numero_cuota)
) ENGINE=InnoDB;

-- Abonos realizados contra una cuota
CREATE TABLE pago (
  id_pago        INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_cuota       INT UNSIGNED NOT NULL,
  id_usuario     INT UNSIGNED,                          -- cajero que registró
  fecha_pago     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto          DECIMAL(8,2) NOT NULL,
  metodo_pago    ENUM('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA') NOT NULL DEFAULT 'EFECTIVO',
  CONSTRAINT fk_pago_cuota   FOREIGN KEY (id_cuota)   REFERENCES cuota(id_cuota),
  CONSTRAINT fk_pago_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 8: EGRESOS  (Imagen 4 y 6 — control financiero / BI)
-- =====================================================================
CREATE TABLE egreso (
  id_egreso      INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  fecha          DATE NOT NULL,
  tipo_egreso    VARCHAR(60) NOT NULL,                 -- Servicios, Planilla, Materiales...
  descripcion    VARCHAR(160),
  cantidad       DECIMAL(8,2) NOT NULL DEFAULT 1,
  precio         DECIMAL(8,2) NOT NULL,
  igv            DECIMAL(8,2) NOT NULL DEFAULT 0,
  total          DECIMAL(10,2) AS (cantidad * precio + igv) STORED,  -- IGV -> total automático (Imagen 6)
  metodo_pago    ENUM('EFECTIVO','TRANSFERENCIA','TARJETA','YAPE','PLIN') NOT NULL DEFAULT 'EFECTIVO',
  tipo_comprobante ENUM('FACTURA','BOLETA','RECIBO','NINGUNO') NOT NULL DEFAULT 'NINGUNO',
  personal       VARCHAR(120),                          -- responsable del egreso
  id_usuario     INT UNSIGNED,
  CONSTRAINT fk_egreso_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

-- =====================================================================
--  MÓDULO 9: IA — PREDICCIÓN DE DESERCIÓN  (RI009)
-- =====================================================================
CREATE TABLE prediccion_desercion (
  id_prediccion  INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  id_matricula   INT UNSIGNED NOT NULL,
  fecha_calculo  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  riesgo_pct     DECIMAL(5,2) NOT NULL,                 -- 0.00 a 100.00
  nivel_riesgo   ENUM('BAJO','MEDIO','ALTO') NOT NULL,
  prioritario    BOOLEAN AS (riesgo_pct > 75) STORED,   -- >75% -> lista prioritaria
  -- snapshot de variables usadas por el modelo (para trazabilidad)
  tasa_asistencia   DECIMAL(5,2),
  promedio_examenes DECIMAL(7,3),
  cuotas_vencidas   TINYINT UNSIGNED,
  CONSTRAINT fk_pred_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),
  INDEX idx_pred_riesgo (riesgo_pct)
) ENGINE=InnoDB;
