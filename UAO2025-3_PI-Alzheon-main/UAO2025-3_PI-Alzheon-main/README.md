# Alzheon

Sistema de monitoreo y análisis cognitivo para pacientes con Alzheimer. Permite a pacientes, cuidadores y médicos colaborar en el seguimiento de la evolución cognitiva mediante grabaciones de voz, análisis con IA y gestión de fotos.

## Inicialización del Proyecto

### Instalación

#### 1. Clonar el repositorio

```bash
git clone https://github.com/Joseligos/PI-Alzheon.git
cd PI-Alzheon
```

#### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
MONGO_URI=tu_cadena_de_conexión

PORT=5500

JWT_SECRET=tu_clave_secreta

NODE_ENV=development

# Resend API Key 
RESEND_API_KEY=tu_api

R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=tu_api
R2_SECRET_ACCESS_KEY=tu_api
R2_BUCKET_NAME=alzheon
R2_PUBLIC_URL=tu_public_url
R2_ENDPOINT=tu_endpoint

ASSEMBLYAI_API_KEY=tu_api

GEMINI_API_KEY=tu_api

# Configuración de Análisis
UMBRAL_DESVIACION_DEFECTO=
MIN_PALABRAS_ANALISIS=

REPORT_ENCRYPTION_KEY=Hash_de_32_caracteres
```

Iniciar el servidor:

```bash
npm start
# o para desarrollo:
npm run dev
```

#### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:5500
```

Iniciar la aplicación:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:8080`

## Estructura del Proyecto

```
PI-Alzheon/
│
├── backend/                    # Servidor Node.js + Express
│   ├── config/                 # Configuración (DB, R2)
│   ├── controllers/            # Controladores de rutas
│   │   ├── authController.js
│   │   ├── cuidadorController.js
│   │   ├── medicoController.js
│   │   └── pacienteController.js
│   ├── features/               # Tests BDD con Cucumber
│   ├── jobs/                   # Tareas programadas (recordatorios)
│   ├── middleware/             # Middleware de autenticación
│   ├── models/                 # Modelos de Mongoose
│   │   ├── usuario.js          # Usuarios (paciente, cuidador, médico)
│   │   ├── foto.js
│   │   ├── grabacion.js
│   │   ├── analisisCognitivo.js
│   │   ├── alertaCognitiva.js
│   │   └── configuracion.js
│   ├── routes/                 # Definición de rutas
│   ├── scripts/                # Scripts de utilidad
│   ├── services/               # Servicios (NLP, PDF, transcripción, upload)
│   └── server.js               # Punto de entrada
│
├── frontend/                   # Aplicación React + TypeScript + Vite
│   ├── cypress/                # Tests E2E con Cypress
│   │   └── e2e/
│   │       ├── auth/           # Tests de autenticación
│   │       ├── paciente/       # Tests de funcionalidad paciente
│   │       ├── cuidador/       # Tests de funcionalidad cuidador
│   │       ├── medico/         # Tests de funcionalidad médico
│   │       └── integration/    # Tests de integración
│   ├── public/                 # Archivos estáticos
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── auth/           # Componentes de autenticación
│   │   │   ├── Paciente/       # Componentes del paciente
│   │   │   ├── Cuidador/       # Componentes del cuidador
│   │   │   ├── Medico/         # Componentes del médico
│   │   │   ├── generics/       # Componentes reutilizables
│   │   │   └── primitives/     # Componentes base (UI)
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilidades y configuración
│   │   ├── pages/              # Páginas de la aplicación
│   │   ├── services/           # Servicios API
│   │   ├── store/              # Redux store
│   │   │   ├── slices/         # Redux slices
│   │   │   └── thunks/         # Redux thunks
│   │   ├── styles/             # Estilos globales
│   │   └── types/              # Definiciones de tipos TypeScript
│   └── vite.config.ts          # Configuración de Vite
│
└── README.md
```

## Testing

### Tests E2E (Frontend - Cypress)

```bash
cd frontend

# Abrir Cypress UI
npm run cypress:open

# Ejecutar todos los tests
npm run test:e2e
```

### Tests BDD (Backend - Cucumber)

```bash
cd backend

npm run test:cucumber
```

## Tecnologías Utilizadas

### Backend
- **Express**: Framework web
- **MongoDB + Mongoose**: Base de datos
- **JWT**: Autenticación
- **OpenAI API**: Análisis cognitivo y transcripción
- **Cloudflare R2**: Almacenamiento de archivos
- **Resend**: Envío de emails
- **Multer**: Upload de archivos

### Frontend
- **React 19**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool
- **Redux Toolkit**: Estado global
- **React Router**: Navegación
- **Tailwind CSS**: Estilos
- **Framer Motion**: Animaciones
- **Recharts**: Gráficas
- **Cypress**: Testing E2E
