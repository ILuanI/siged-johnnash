# Casos de Pruebas Unitarias - Sistema Integral de Gestión Educativa John Nash

## CASO DE PRUEBA 1: Autenticación de Usuario (Login)

| Campo | Detalle |
|-------|---------|
| **Número de Caso** | 1 |
| **Componente** | Autenticación / Fortify - Login |
| **Prerrequisitos** | - Usuario registrado en el sistema<br>- Base de datos disponible<br>- Usuario activo con estado verificado |
| **Descripción** | Validar que un usuario registrado pueda iniciar sesión correctamente con credenciales válidas |
| **Datos de Entrada** | - Email: usuario@example.com<br>- Contraseña: Password123!<br>- Recordar sesión: false |
| **Pasos a Comprobar** | 1. Abrir formulario de login<br>2. Ingresar email válido<br>3. Ingresar contraseña correcta<br>4. Hacer clic en "Iniciar Sesión"<br>5. Validar redirección a dashboard |
| **Salida Esperada** | - Autenticación exitosa<br>- Usuario redirigido a página principal/dashboard<br>- Sesión activa en el servidor<br>- Token de sesión generado |
| **Resultado Ejecución** | *A llenar después de ejecutar la prueba* |
| **Observaciones** | *A llenar después de ejecutar la prueba* |

---

## CASO DE PRUEBA 2: Creación de Matrícula Válida

| Campo | Detalle |
|-------|---------|
| **Número de Caso** | 2 |
| **Componente** | Matriculas / Modelo Matricula |
| **Prerrequisitos** | - Alumno existente y activo<br>- Ciclo académico disponible<br>- Período académico disponible<br>- Turno disponible<br>- Aula disponible<br>- Usuario autenticado con permisos de administrador |
| **Descripción** | Validar que se pueda crear una matrícula correcta con todos los datos requeridos |
| **Datos de Entrada** | - ID Alumno: 1<br>- ID Ciclo: 1<br>- ID Período: 2024-I<br>- ID Turno: 1 (Mañana)<br>- ID Aula: 101<br>- Modalidad: Presencial<br>- Tipo de Pago: Contado<br>- Costo Total: 3500.00<br>- Estado: Activa<br>- Fecha de Matrícula: 2024-06-10 |
| **Pasos a Comprobar** | 1. Validar que el alumno existe y está activo<br>2. Validar disponibilidad del ciclo<br>3. Validar datos requeridos no estén vacíos<br>4. Validar costo sea mayor a cero<br>5. Crear registro de matrícula<br>6. Verificar inserción en base de datos |
| **Salida Esperada** | - Matrícula creada exitosamente<br>- ID de matrícula retornado<br>- Estado inicial en "Activa"<br>- Campos en la base de datos coinciden con entrada<br>- Sin errores de validación |
| **Resultado Ejecución** | *A llenar después de ejecutar la prueba* |
| **Observaciones** | *A llenar después de ejecutar la prueba* |

---

## CASO DE PRUEBA 3: Validación de Datos de Alumno (Crear/Actualizar)

| Campo | Detalle |
|-------|---------|
| **Número de Caso** | 3 |
| **Componente** | Alumnos / Modelo Alumno |
| **Prerrequisitos** | - Carrera disponible<br>- Apoderado disponible (si aplica)<br>- Base de datos limpia |
| **Descripción** | Validar que la creación/actualización de alumno valide correctamente DNI único, email válido, teléfono y campos requeridos |
| **Datos de Entrada** | **Caso válido:**<br>- Código: ALU-2024-001<br>- Nombres: Juan Carlos<br>- Apellidos: Pérez López<br>- DNI: 12345678 (único)<br>- Fecha Nacimiento: 2005-06-15<br>- Sexo: M<br>- Teléfono: 987654321<br>- Email: juan.perez@email.com<br>- Carrera: ID 1<br>- Estado: Activo |
| **Pasos a Comprobar** | 1. Validar que DNI sea único en el sistema<br>2. Validar que DNI tenga 8 dígitos<br>3. Validar formato de email<br>4. Validar teléfono sea válido (9-15 dígitos)<br>5. Validar campos requeridos no estén vacíos<br>6. Validar relación con carrera exista<br>7. Crear/actualizar registro de alumno |
| **Salida Esperada** | - Alumno creado/actualizado exitosamente<br>- DNI se verifica como único<br>- Email en formato válido almacenado<br>- Todos los campos requeridos presentes<br>- Sin errores de validación<br>- ID de alumno retornado |
| **Resultado Ejecución** | *A llenar después de ejecutar la prueba* |
| **Observaciones** | Prueba también casos inválidos (DNI duplicado, email inválido) |

---

## CASO DE PRUEBA 4: Asignación de Docentes a Cursos

| Campo | Detalle |
|-------|---------|
| **Número de Caso** | 4 |
| **Componente** | AsignacionDocente / Relaciones Docente-Curso |
| **Prerrequisitos** | - Docente activo en el sistema<br>- Curso disponible<br>- Ciclo académico activo<br>- Usuario autenticado con permisos de asignación |
| **Descripción** | Validar que se pueda asignar un docente a un curso correctamente para un ciclo académico |
| **Datos de Entrada** | - ID Docente: 5<br>- ID Curso: 3 (Matemática)<br>- ID Ciclo: 1 (2024-I)<br>- Horario: Lunes a Viernes, 08:00-10:00<br>- Aula: 101 |
| **Pasos a Comprobar** | 1. Validar que docente existe y está activo<br>2. Validar que curso existe<br>3. Validar que ciclo está disponible<br>4. Validar que no exista asignación duplicada<br>5. Validar disponibilidad de horario del docente<br>6. Validar disponibilidad del aula en ese horario<br>7. Crear asignación |
| **Salida Esperada** | - Asignación creada exitosamente<br>- Docente vinculado al curso<br>- Horario registrado sin conflictos<br>- Relación verificable en base de datos<br>- Sin duplicados de asignación |
| **Resultado Ejecución** | *A llenar después de ejecutar la prueba* |
| **Observaciones** | *A llenar después de ejecutar la prueba* |

---

## CASO DE PRUEBA 5: Gestión de Ciclos Académicos (Crear/Actualizar)

| Campo | Detalle |
|-------|---------|
| **Número de Caso** | 5 |
| **Componente** | Ciclos Académicos / Modelo Ciclo |
| **Prerrequisitos** | - Base de datos disponible<br>- Usuario autenticado con rol administrador<br>- Período académico debe existir previamente |
| **Descripción** | Validar que se pueda crear/actualizar un ciclo académico con validación de fechas, estado y relaciones |
| **Datos de Entrada** | - Nombre: Primer Ciclo 2024<br>- Período: 2024-I<br>- Fecha Inicio: 2024-06-10<br>- Fecha Fin: 2024-08-31<br>- Estado: Activo<br>- Descripción: Ciclo académico de inicio de año |
| **Pasos a Comprobar** | 1. Validar que nombre no esté vacío<br>2. Validar que período académico exista<br>3. Validar que fecha inicio sea antes de fecha fin<br>4. Validar que fecha inicio sea válida (formato correcto)<br>5. Validar que no exista ciclo duplicado para el mismo período<br>6. Validar transición de estados (Solo ciertos estados son válidos)<br>7. Crear/actualizar registro de ciclo |
| **Salida Esperada** | - Ciclo creado/actualizado exitosamente<br>- ID de ciclo retornado<br>- Fechas validadas correctamente<br>- Estado inicial según regla de negocio<br>- Relación con período académico establecida<br>- Sin duplicados para el mismo período |
| **Resultado Ejecución** | *A llenar después de ejecutar la prueba* |
| **Observaciones** | Validar también casos inválidos (fechas inversas, duplicados) |

---

## Resumen de Casos

| Caso | Componente | Prioridad | Estado |
|------|-----------|-----------|--------|
| 1 | Autenticación / Login | CRÍTICA | Pendiente |
| 2 | Matrículas | CRÍTICA | Pendiente |
| 3 | Validación Alumnos | ALTA | Pendiente |
| 4 | Asignación Docentes | ALTA | Pendiente |
| 5 | Ciclos Académicos | ALTA | Pendiente |

---

## Instrucciones para Llenar el Excel

Para **cada caso de prueba ejecutado**, debes llenar:

1. **Resultado Ejecución**: ✅ Exitoso / ❌ Fallido / ⚠️ Con observaciones
2. **Observaciones**: Detalles específicos, mensajes de error, valores reales obtenidos
3. **Fecha de Ejecución**: Cuándo se realizó la prueba
4. **Ejecutado por**: Nombre del tester

Estos campos sombreados te generarán el **Informe de Resultado de Pruebas Unitarias**.
