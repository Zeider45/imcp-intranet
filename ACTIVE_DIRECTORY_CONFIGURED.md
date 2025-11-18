# ✅ Active Directory - Configuración Completada con django-auth-ldap

El backend Django ha sido configurado exitosamente para autenticarse contra Active Directory usando **django-auth-ldap**.

## 🎯 Resumen de la Configuración

### Servidor Active Directory
- **Host:** 172.16.101.106
- **Puerto:** 389 (LDAP)
- **Dominio:** imcp-intranet.local
- **Base DN:** DC=imcp-intranet,DC=local

### Características Habilitadas
✅ Autenticación de usuarios via Active Directory usando **django-auth-ldap**  
✅ Sincronización automática de atributos de usuario (nombre, apellido, email)  
✅ Sincronización automática de grupos AD → Django (con AUTH_LDAP_MIRROR_GROUPS)  
✅ Autorización basada en roles (role-based access control)  
✅ Mapeo de grupos en español e inglés (via ldap_sync.py)  
✅ Fallback a autenticación local Django  
✅ API REST para login/logout  
✅ Biblioteca estándar y ampliamente soportada  

## 📁 Archivos Importantes

### Archivos de Configuración (NO commiteados)
- `backend/.env` - Contiene las credenciales reales de AD (creado localmente, en .gitignore)

### Archivos Commiteados al Repositorio
- `backend/.env.example` - Plantilla de configuración (sin contraseñas reales)
- `backend/SETUP_INSTRUCTIONS.md` - Guía completa de uso y configuración
- `backend/verify_ad_config.py` - Script para verificar la configuración
- `backend/test_django_auth_ldap.py` - **NUEVO**: Script para verificar django-auth-ldap
- `backend/ACTIVE_DIRECTORY_SETUP.md` - Documentación detallada de AD/LDAP con django-auth-ldap
- `backend/ROLE_BASED_AUTHORIZATION.md` - Documentación de permisos y roles

### Archivos del Sistema
- `backend/intranet/settings.py` - **ACTUALIZADO**: Configuración simplificada con django-auth-ldap
- `backend/requirements.txt` - **ACTUALIZADO**: Usa django-auth-ldap==5.0.0 y python-ldap==3.4.4
- `backend/api/ldap_sync.py` - Funciones auxiliares para mapeo de grupos personalizados
- `backend/api/views.py` - Endpoints de autenticación (login/logout/me)
- `backend/test_ldap_bind.py` - Script de prueba de conectividad LDAP

## 🚀 Cómo Usar

### 1. Copiar las Credenciales
En el servidor de producción, crear el archivo `.env` con las credenciales reales:

```bash
cd backend
cp .env.example .env
# Editar .env y reemplazar "your_password_here" con la contraseña real
```

Las variables ya están configuradas en `.env.example`:
```bash
AUTH_LDAP_SERVER_URI=ldap://172.16.101.106:389
AUTH_LDAP_BIND_DN=CN=administrator,CN=Users,DC=imcp-intranet,DC=local
AUTH_LDAP_BIND_PASSWORD=your_password_here  # ← Reemplazar con la real
AUTH_LDAP_USER_SEARCH_BASE=DC=imcp-intranet,DC=local
```

### 2. Verificar la Configuración
```bash
cd backend
python verify_ad_config.py
```

Este script verificará:
- ✓ LDAP está habilitado
- ✓ Backends de autenticación configurados
- ✓ Todas las variables requeridas están presentes
- ✓ Paquetes Python instalados
- ✓ Funciones personalizadas configuradas

### 3. Ejecutar las Pruebas
```bash
cd backend
python manage.py test
```

Resultado esperado: **30 tests pasan exitosamente**

### 4. Iniciar el Servidor
```bash
cd backend
python manage.py runserver
```

## 🔐 Prueba de Autenticación

### Usando curl
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario-ad","password":"contraseña-ad"}'
```

### Respuesta Exitosa
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
  "token": "a1b2c3d4e5f6..."
}
```

### Usar el Token
```bash
curl -H "Authorization: Token a1b2c3d4e5f6..." \
  http://localhost:8000/api/auth/me/
```

## 📋 Endpoints de API

| Método | Endpoint | Descripción | Requiere Auth |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login/` | Autenticar usuario | No |
| GET | `/api/auth/me/` | Obtener usuario actual | Sí |
| POST | `/api/auth/logout/` | Cerrar sesión | Sí |
| GET | `/api/health/` | Health check | No |
| GET | `/api/welcome/` | Mensaje de bienvenida | No |

## 🔒 Seguridad

### ✅ Implementado
- Credenciales en `.env` (no en código fuente)
- `.env` en `.gitignore` (no se commitea)
- Contraseñas enmascaradas en logs y scripts de verificación
- Sincronización segura de grupos AD
- Tokens de autenticación para API REST
- CodeQL security scan: **0 vulnerabilities**

### ⚠️ Recomendaciones para Producción
1. **Usar LDAPS** (puerto 636) en lugar de LDAP (puerto 389)
2. **Rotar la contraseña** del usuario bind regularmente
3. **Usar SECRET_KEY fuerte** en Django (cambiar en producción)
4. **Habilitar HTTPS** (TLS/SSL) para el servidor Django
5. **Configurar DEBUG=False** en producción
6. **Usar un usuario de servicio** con permisos mínimos (solo lectura)

## 🧪 Estado de las Pruebas

```
Ran 30 tests in 15.103s
OK
```

Todas las pruebas existentes pasan exitosamente:
- ✓ Tests de autenticación (login/logout/current user)
- ✓ Tests de sincronización de grupos LDAP
- ✓ Tests de permisos basados en roles
- ✓ Tests de endpoints de API
- ✓ Tests de modelos

## 📚 Documentación Adicional

- **[SETUP_INSTRUCTIONS.md](backend/SETUP_INSTRUCTIONS.md)** - Guía completa de configuración y uso
- **[ACTIVE_DIRECTORY_SETUP.md](backend/ACTIVE_DIRECTORY_SETUP.md)** - Documentación detallada de AD/LDAP
- **[ROLE_BASED_AUTHORIZATION.md](backend/ROLE_BASED_AUTHORIZATION.md)** - Permisos y autorización
- **[README.md](README.md)** - Documentación general del proyecto

## ✅ Lista de Verificación

Antes de desplegar a producción:

- [ ] Crear `.env` con credenciales reales
- [ ] Ejecutar `python verify_ad_config.py` (debe pasar todos los checks)
- [ ] Ejecutar `python manage.py test` (30 tests deben pasar)
- [ ] Verificar conectividad de red al servidor AD (puerto 389/636)
- [ ] Probar login con un usuario real de AD
- [ ] Verificar que los grupos se sincronizan correctamente
- [ ] Configurar SECRET_KEY fuerte y único
- [ ] Configurar DEBUG=False
- [ ] Considerar usar LDAPS (puerto 636) en lugar de LDAP
- [ ] Configurar HTTPS para el servidor Django
- [ ] Revisar logs de autenticación

## 🆘 Soporte

Si encuentras problemas:

1. **Verificar configuración:** `python verify_ad_config.py`
2. **Probar conectividad:** `python test_ldap_bind.py`
3. **Revisar logs:** Buscar errores en los logs de Django
4. **Consultar documentación:** Ver archivos .md en backend/
5. **Ejecutar tests:** `python manage.py test` para verificar el sistema

## 🎉 ¡Listo!

El sistema está completamente configurado y listo para autenticar usuarios contra Active Directory.

**Próximos pasos:**
1. Desplegar en el servidor de producción
2. Configurar el `.env` con las credenciales reales
3. Probar la autenticación con usuarios reales de AD
4. Configurar los grupos en AD según los roles necesarios

---

**Nota:** Este documento describe la configuración realizada. El archivo `.env` con las credenciales reales NO está incluido en el repositorio por seguridad y debe ser creado manualmente en cada entorno.
