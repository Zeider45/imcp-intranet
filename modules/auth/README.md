# Módulo: Autenticación y Usuarios

Objetivo:
- Gestionar el acceso de usuarios a la intranet y los datos básicos de perfil.

Funcionalidades MVP:
- Login (email/usuario + contraseña).
- Logout.
- Recuperación de contraseña (email).
- Gestión de perfil (nombre, email, foto).
- Registro / creación manual de usuarios por admin.
- Validación básica y bloqueo tras intentos fallidos.

Endpoints / Páginas sugeridas:
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /users/me
- PUT /users/me

Notas:
- Preparar hooks para integración futura con SSO/LDAP.
