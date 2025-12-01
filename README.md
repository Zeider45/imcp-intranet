# IMCP Intranet

Sistema de intranet desarrollado con Next.js (frontend) y Django (backend).

## 🚀 Tecnologías

### Frontend
- **Next.js 16** - Framework de React con TypeScript
- **Tailwind CSS** - Framework de estilos CSS
- **React 19** - Biblioteca de UI

### Backend
- **Django 5.2** - Framework web de Python
- **Django REST Framework 3.16** - API REST
- **django-cors-headers** - Manejo de CORS para integración con frontend

## 📁 Estructura del Proyecto

```
imcp-intranet/
├── frontend/          # Aplicación Next.js
│   ├── app/          # Páginas y layouts (App Router)
│   ├── lib/          # Utilidades y servicios API
│   ├── public/       # Archivos estáticos
│   └── package.json  # Dependencias de Node.js
│
├── backend/          # Aplicación Django
│   ├── intranet/    # Configuración del proyecto
│   ├── api/         # Aplicación API
│   ├── manage.py    # Utilidad de línea de comandos
│   └── requirements.txt  # Dependencias de Python
│
└── README.md
```

## 🛠️ Instalación y Configuración

### Prerequisitos
- Python 3.12+
- Node.js 20+
- npm 10+

### Backend (Django)

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear un entorno virtual (recomendado):
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones específicas
```

5. Ejecutar migraciones (⚠️ **IMPORTANTE**: Este paso es obligatorio):
```bash
python manage.py migrate
```
> **Nota**: Si no ejecutas las migraciones, recibirás errores como `no such table: api_librarydocument` al usar la API.

6. Crear un superusuario (opcional):
```bash
python manage.py createsuperuser
```

7. Iniciar el servidor de desarrollo:
```bash
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Frontend (Next.js)

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones específicas
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## 🔗 API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Endpoints Disponibles

#### Health Check
```
GET /api/health/
```
Respuesta:
```json
{
  "status": "ok",
  "message": "API is running successfully"
}
```

#### Autenticación

**Login (soporta Active Directory/LDAP)**
```
POST /api/auth/login/
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

**Usuario Actual**
```
GET /api/auth/me/
Authorization: Token <token>
```

**Logout**
```
POST /api/auth/logout/
Authorization: Token <token>
```

#### Welcome
```
GET /api/welcome/
```
Respuesta:
```json
{
  "message": "Bienvenido a la Intranet IMCP",
  "version": "1.0.0",
  "description": "Sistema de intranet con Django y Next.js"
}
```

#### Admin Panel
```
http://localhost:8000/admin/
```

## 🧪 Desarrollo

### Ejecutar ambos servidores simultáneamente

Terminal 1 - Backend:
```bash
cd backend
python manage.py runserver
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Construir para producción

#### Frontend:
```bash
cd frontend
npm run build
npm start
```

#### Backend:
```bash
cd backend
python manage.py collectstatic
# Usar un servidor WSGI como Gunicorn
gunicorn intranet.wsgi:application
```

## 🔧 Configuración

### Variables de Entorno

El proyecto utiliza archivos `.env` para gestionar las variables de entorno. Se proporcionan archivos de ejemplo (`.env.example`) que debes copiar y configurar.

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Variables disponibles:
- `SECRET_KEY`: Clave secreta de Django (cambiar en producción)
- `DEBUG`: Modo debug (True/False)
- `ALLOWED_HOSTS`: Hosts permitidos (separados por comas)
- `CORS_ALLOWED_ORIGINS`: Orígenes CORS permitidos (separados por comas)
- Variables LDAP/Active Directory (opcionales)

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

Variables disponibles:
- `NEXT_PUBLIC_API_URL`: URL del backend API (por defecto: http://localhost:8000)

### Autenticación con Active Directory

El backend está configurado para soportar autenticación con Active Directory/LDAP. Ver la guía completa en:
- **[backend/ACTIVE_DIRECTORY_SETUP.md](backend/ACTIVE_DIRECTORY_SETUP.md)**

Para habilitar autenticación LDAP, configurar las siguientes variables de entorno:
```bash
export AUTH_LDAP_SERVER_URI=ldap://ad.example.com:389
export AUTH_LDAP_BIND_DN=CN=ServiceAccount,DC=example,DC=com
export AUTH_LDAP_BIND_PASSWORD=password
export AUTH_LDAP_USER_SEARCH_BASE=DC=example,DC=com
```

**Nota:** Si el login tarda mucho tiempo (5-10+ segundos), puede ser un problema de conectividad con el servidor LDAP. Ver la sección de troubleshooting en [ACTIVE_DIRECTORY_SETUP.md](backend/ACTIVE_DIRECTORY_SETUP.md#slow-login--login-takes-too-long) para ajustar el timeout o deshabilitar LDAP temporalmente.

## 📝 Características

- ✅ API REST completamente funcional con Django REST Framework
- ✅ Frontend moderno con Next.js y TypeScript
- ✅ CORS configurado para comunicación frontend-backend
- ✅ Diseño responsive con Tailwind CSS
- ✅ Modo oscuro incluido
- ✅ Verificación de estado de la API en tiempo real

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto.

## 👥 Autores

- IMCP Development Team

## 📧 Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.
