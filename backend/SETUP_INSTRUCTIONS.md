# Instrucciones de Configuración - Autenticación Active Directory

## ✅ Configuración Completada

El backend ha sido configurado exitosamente para autenticar usuarios contra el servidor Active Directory.

### Configuración Actual

- **Servidor LDAP:** ldap://172.16.101.106:389
- **Dominio:** imcp-intranet.local
- **Base de búsqueda:** DC=imcp-intranet,DC=local
- **Usuario de enlace:** CN=administrator,CN=Users,DC=imcp-intranet,DC=local
- **Mapeo de atributos:** 
  - Username: sAMAccountName
  - Nombre: givenName
  - Apellido: sn
  - Email: mail

## 🚀 Cómo Usar

### 1. Copiar el archivo de configuración

El archivo `.env` debe ser creado en el directorio `backend/` con las credenciales proporcionadas:

```bash
cd backend
cp .env.example .env
```

Luego editar el archivo `.env` con las siguientes variables:

```bash
# Active Directory / LDAP Configuration
AUTH_LDAP_SERVER_URI=ldap://172.16.101.106:389
AUTH_LDAP_BIND_DN=CN=administrator,CN=Users,DC=imcp-intranet,DC=local
AUTH_LDAP_BIND_PASSWORD=Nicyen0302.
AUTH_LDAP_USER_SEARCH_BASE=DC=imcp-intranet,DC=local
AUTH_LDAP_USER_SEARCH_FILTER=(sAMAccountName=%(user)s)
AUTH_LDAP_START_TLS=False

# LDAP Attribute Mapping
AUTH_LDAP_ATTR_USERNAME=sAMAccountName
AUTH_LDAP_ATTR_FIRST_NAME=givenName
AUTH_LDAP_ATTR_LAST_NAME=sn
AUTH_LDAP_ATTR_EMAIL=mail
AUTH_LDAP_OBJECT_CLASS=person
```

### 2. Iniciar el servidor

```bash
cd backend
python manage.py runserver
```

### 3. Probar la autenticación

Usar cualquiera de los siguientes métodos:

#### Opción A: Usando curl

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario-ad","password":"contraseña-ad"}'
```

#### Opción B: Usando Python

```python
import requests

response = requests.post(
    'http://localhost:8000/api/auth/login/',
    json={
        'username': 'usuario-ad',
        'password': 'contraseña-ad'
    }
)

print(response.json())
```

#### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": 1,
    "username": "usuario-ad",
    "email": "usuario@imcp-intranet.local",
    "first_name": "Nombre",
    "last_name": "Apellido",
    "is_staff": false,
    "is_superuser": false,
    "groups": ["HR_Managers", "Department_Managers"]
  },
  "profile": {
    "department": "Recursos Humanos",
    "position": "Manager",
    "phone": "555-1234"
  },
  "token": "a1b2c3d4e5f6..."
}
```

## 🔐 Características de Seguridad

### Autenticación

1. **LDAP Backend Primero:** El sistema intenta autenticar primero contra Active Directory
2. **Fallback Local:** Si LDAP falla o no está disponible, usa autenticación local de Django
3. **Creación Automática de Usuarios:** Los usuarios de AD se crean automáticamente en Django al primer login

### Autorización

1. **Sincronización de Grupos:** Los grupos de AD se sincronizan automáticamente a grupos Django
2. **Mapeo de Grupos:** Soporta nombres en inglés y español (ej: HR_Managers, Gerentes_RH)
3. **Permisos Basados en Roles:** Los permisos se asignan según los grupos de Django

### Grupos Mapeados

| Grupo AD (Inglés) | Grupo AD (Español) | Grupo Django | Permisos |
|-------------------|-------------------|--------------|----------|
| HR_Managers | Gerentes_RH | HR_Managers | Gestión de departamentos, empleados |
| Department_Managers | Gerentes_Departamento | Department_Managers | Gestión de su departamento |
| Communications | Comunicaciones | Communications | Crear anuncios |
| Document_Managers | Administradores_Documentos | Document_Managers | Gestión de documentos |
| Resource_Managers | Administradores_Recursos | Resource_Managers | Gestión de recursos |
| Training_Managers | Administradores_Capacitacion | Training_Managers | Gestión de cursos |
| Project_Managers | Gerentes_Proyecto | Project_Managers | Gestión de proyectos |

## 📋 Endpoints de Autenticación

### Login
```
POST /api/auth/login/
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

### Obtener Usuario Actual
```
GET /api/auth/me/
Authorization: Token <token>
```

### Logout
```
POST /api/auth/logout/
Authorization: Token <token>
```

## 🧪 Pruebas

Todas las pruebas (30) pasan exitosamente:

```bash
cd backend
python manage.py test
```

## 🔍 Verificar Configuración

Para verificar que la configuración LDAP está activa:

```bash
cd backend
python manage.py shell
```

```python
from django.conf import settings

# Verificar backend LDAP
print(settings.AUTHENTICATION_BACKENDS)
# Debe mostrar: ['django_python3_ldap.auth.LDAPBackend', 'django.contrib.auth.backends.ModelBackend']

# Verificar configuración LDAP
print(f"Servidor: {settings.LDAP_AUTH_URL}")
print(f"Base de búsqueda: {settings.LDAP_AUTH_SEARCH_BASE}")
```

## ⚠️ Notas Importantes

1. **Archivo .env:** El archivo `.env` con las credenciales **NO** debe ser commiteado a git (ya está en .gitignore)
2. **Conectividad:** El servidor Django debe tener acceso de red al servidor LDAP en 172.16.101.106:389
3. **Credenciales del Bind:** El usuario administrator debe tener permisos de lectura en AD
4. **Seguridad:** En producción, considerar usar LDAPS (puerto 636) o StartTLS para conexiones seguras

## 🐛 Solución de Problemas

### Error: "Connection timeout"
- Verificar que el firewall permite conexiones al puerto 389
- Probar conectividad: `telnet 172.16.101.106 389`

### Error: "Invalid credentials"
- Verificar el formato del Bind DN
- Verificar la contraseña del usuario de enlace
- Probar con el script: `python test_ldap_bind.py`

### Error: "User not found"
- Verificar que el usuario existe en la base de búsqueda
- Verificar el filtro de búsqueda (sAMAccountName)
- Verificar que el usuario es de tipo "person"

## 📚 Referencias

- [ACTIVE_DIRECTORY_SETUP.md](./ACTIVE_DIRECTORY_SETUP.md) - Guía detallada de configuración
- [ROLE_BASED_AUTHORIZATION.md](./ROLE_BASED_AUTHORIZATION.md) - Guía de autorización y permisos
- [django-python3-ldap](https://github.com/etianen/django-python3-ldap) - Documentación de la biblioteca
