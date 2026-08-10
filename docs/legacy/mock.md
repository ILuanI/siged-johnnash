Número del Caso de Prueba		Componente	Descripción de lo que se Probará	Prerrequisitos	
<CA0XX>>		<<Componente 1>>			
<<CA0YY>>		<<Componente 2>>			


CA01						
Nº	Descripción	Método	Datos Entrada	Salida Esperada	¿OK?	Observaciones
1						
2						

Número del Caso de Prueba		Componente	Descripción de lo que se Probará	Prerrequisitos		
CA001		Autenticación / Login	Inicio de sesión valido	Usuario registrado		
CA002		Matriculas / Modelo matriculas	Se puede crear una matriculas con todos los datos requeridos	Estudiante registrado, usuario con los permisos y ciclo, aula y turno disponibles		
						
CA01						
Nº	Descripción	Método	Datos Entrada	Salida Esperada	¿OK?	Observaciones
1	Usuario autenticado puede acceder al dashboard	POST/login	correo: usuario@example.com contraseña: Password123!	redireccion a '/dashboard' y usuario autenticado	OK	
2	Usuario con credenciales incorrectas no puede autenticarse	POST/login	correo: usuario@example.com contraseña: ContraseñaIncorrecta	error validacion de emaily usuario no autenticado	OK	
3	Usuario no registrado no puede autenticarse	POST/login	correo: usuarionoexiste@example.com contraseña: Password123!	error validacion de emaily usuario no autenticado	OK	