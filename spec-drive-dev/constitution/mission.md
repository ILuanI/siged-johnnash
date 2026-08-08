# Misión

## Disparadores de reviewer obligatorio
Si la tarea o los archivos que toca contienen cualquiera de estos términos
(en el nombre de archivo, ruta, o descripción de la tarea), reviewer es
obligatorio sin excepción, aunque orchestrator no lo vea riesgoso:

- auth, login, password, token, session, jwt
- pago, payment, cobro, tarjeta, billing
- alumno, student, menor, personal_data, pii
- delete, drop, truncate, migrate



> Solo cuando trabajemos en producción (dahora estamos en dev): Pendiente para cuando haya datos reales de alumnos: hoy el desarrollo no toca PII real, así que la política de retención de datos de los modelos gratis en uso (Mimo, Gemini, etc.) no es urgente. Antes de que coder/explorer/reviewer procesen datos reales de alumnos o menores, revisar la política de retención de cada modelo usado en ese momento — no solo reviewer, cualquier rol que vaya a leer ese dato. Si alguno retiene para entrenamiento, ese rol pasa a un modelo con retención cero antes de tocar producción.