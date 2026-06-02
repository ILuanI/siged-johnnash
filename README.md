# Sistema Integral de Gestión Educativa para la Mejora de Procesos Académicos de la Academia Preuniversitaria John Nash

## 📝 Descripción del Proyecto

Este proyecto es un sistema integral de gestión educativa, hecho a medida y orientado a mejorar los procesos académicos de la Academia Preuniversitaria John Nash potenciado con inteligencia artificial y con inteligencia de negocios. Se cubren los siguientes procesos académicos dentro de la institución: matrícula, notas, asistencia, cursos, horarios y asignación docente. Asimismo, el sistema incorpora un módulo de pagos, con la finalidad de agilizar el registro y almacenamiento seguro de la información financiera de los estudiantes. En cuanto a la visualización y análisis de datos académicos, se integra un módulo de reportes que generará información; este módulo está potenciado con inteligencia de negocios. Por último, se incluye un módulo de inteligencia artificial orientado a la predicción de la deserción estudiantil, brindando alertas tempranas que apoyen la gestión académica.

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza una arquitectura **Monolítica Moderna** que combina la potencia del backend de Laravel con una interfaz de usuario reactiva construida en React, todo en un mismo repositorio. 

Se hace uso de **Inertia.js** como el pegamento entre el frontend (React) y el backend (Laravel), permitiendo crear aplicaciones de una sola página (SPA) sin la complejidad de construir una API REST separada. El enrutamiento y los controladores siguen residiendo en Laravel, mientras que las vistas se renderizan como componentes de React.

### Patrones y Enfoques
- **MVC (Modelo-Vista-Controlador)** extendido con clases de Servicio (`Services/`), Acciones (`Actions/`) y Traits (`Concerns/`) en el servidor.
- **Client-Side Rendering (CSR)** e hidratación proporcionada por Inertia.js y React en el frontend.
- **Generación estricta de tipos** para rutas y acciones del backend utilizando **Wayfinder**.
- **Autenticación Headless** delegada a **Fortify**, manteniendo la UI en React.
- **Optimización en tiempo de compilación** usando **React Compiler** integrado en Vite.

## 📁 Estructura del Proyecto

La estructura del proyecto sigue las convenciones de Laravel y un esquema escalable para React (vía Vite):

```text
/
├── app/                  # Lógica del Backend (Laravel)
│   ├── Actions/          # Clases de Acción, encapsulando procesos específicos (ej. Fortify)
│   ├── Concerns/         # Traits de PHP para reutilización de código transversal
│   ├── Console/          # Comandos de Artisan personalizados
│   ├── Http/             # Controladores y Middleware
│   ├── Models/           # Modelos de base de datos de Eloquent
│   ├── Providers/        # Proveedores de servicios
│   └── Services/         # Clases de servicio que manejan la lógica de negocio compleja
├── bootstrap/            # Archivos de inicialización y caché del framework
├── config/               # Archivos de configuración de Laravel (base de datos, mail, auth, etc.)
├── database/             # Estructura y datos de prueba de la base de datos
│   ├── factories/        # Fábricas para generar datos de prueba
│   ├── migrations/       # Migraciones para crear/modificar tablas
│   └── seeders/          # Sembradores para poblar la base de datos
├── public/               # Punto de entrada público y assets estáticos (imágenes, favicon)
├── resources/            # Código del Frontend (React, TypeScript, CSS)
│   ├── css/              # Hojas de estilo y configuración principal de Tailwind CSS
│   └── js/               # Código fuente del cliente
│       ├── actions/      # Interacciones con el servidor, integradas con Wayfinder
│       ├── components/   # Componentes de UI (incluyendo los de shadcn/ui en subcarpetas)
│       ├── hooks/        # Hooks personalizados de React
│       ├── layouts/      # Plantillas de diseño de las páginas de la aplicación
│       ├── lib/          # Librerías y utilidades base (ej. utils.ts de shadcn)
│       ├── pages/        # Vistas de páginas renderizadas por Inertia
│       ├── routes/       # Manejo de rutas exportadas hacia el cliente
│       ├── types/        # Definiciones globales de tipos e interfaces de TypeScript
│       ├── utils/        # Utilidades generales y helpers
│       └── wayfinder/    # Tipos y funciones autogeneradas por Laravel Wayfinder
├── routes/               # Definiciones de rutas de Laravel (web.php, api.php, console.php)
├── storage/              # Archivos generados, logs del sistema, cachés y subidas de usuarios
├── tests/                # Pruebas automatizadas usando Pest PHP
└── Archivos de Configuración Destacados:
    ├── components.json   # Configuración y estilos para shadcn/ui
    ├── vite.config.ts    # Configuración del empaquetador (incluye React Compiler y fuentes Bunny)
    ├── eslint.config.js  # Reglas de linting del frontend
    ├── pint.json         # Reglas de formateo estricto del backend en PHP
    ├── boost.json        # Configuración para las herramientas de Laravel Boost
    └── pnpm-workspace.yaml # Soporte para espacios de trabajo de PNPM
```

### Módulos funcionales del SIGED

La matriz completa de requerimientos (RI001–RI009), convenciones de carpetas, rutas y estado de implementación está documentada en:

**[docs/MODULOS.md](docs/MODULOS.md)**

## 🛠️ Tecnologías Usadas

El sistema está construido sobre un stack robusto y extremadamente moderno, configurado con las mejores prácticas del ecosistema:

### Backend
- **PHP:** `^8.3`
- **Laravel Framework:** `^13.7` - Framework principal.
- **Laravel Fortify:** `^1.37.2` - Backend de autenticación headless.
- **Laravel Wayfinder:** `^0.1.14` - Exportación de rutas y controladores de Laravel al frontend con tipado fuerte.
- **Pest PHP:** `^4.7` - Framework moderno y elegante para pruebas unitarias y de arquitectura.
- **Laravel Pint:** `^1.27` - Herramienta de formateo de código estandarizado (enlazado a `pint.json`).

### Frontend
- **React:** `^19.2.0` - Motor central de la interfaz de usuario.
- **React Compiler (Babel):** Habilitado en la configuración de Vite para memoización automática.
- **Inertia.js (React):** `^3.0.0` - Enlace entre Laravel y React sin usar APIs REST clásicas.
- **TypeScript:** `^5.7.2` - Tipado estático riguroso en todo el frontend.
- **Tailwind CSS:** `^4.0.0` - Utilizado como base para los estilos de la plataforma.
- **shadcn/ui:** Componentes de interfaz de usuario hermosos y accesibles configurados con el estilo `new-york`.
- **Lucide React:** `^0.475.0` - Paquete principal de iconos de la aplicación.
- **Bunny Fonts:** Para la gestión de tipografías, usando `Instrument Sans` embebida desde Vite.
- **Vite:** `^8.0.0` - Herramienta de construcción y HMR (Hot Module Replacement) ultrarrápida.

## 🚀 Requisitos e Instalación

Para ejecutar este proyecto en un entorno de desarrollo local:

1. Clonar el repositorio.
2. Copiar el archivo de entorno: `cp .env.example .env`
3. Instalar dependencias de backend: `composer install`
4. Generar clave: `php artisan key:generate`
5. Ejecutar migraciones de la BD: `php artisan migrate`
6. Instalar dependencias del frontend: `npm install` (o `pnpm install` dado el workspace configurado).
7. Iniciar el servidor local: `composer run dev` (esto lanzará concurretemente el servidor de PHP, Vite y las colas según está definido en `composer.json`).
