# Módulo: Roles y Permisos

Objetivo:
- Controlar acceso por roles y permisos a módulos y operaciones.

Funcionalidades MVP:
- Definición de Roles (admin, manager, empleado).
- Asignación de roles a usuarios.
- Permisos por recurso (leer, crear, editar, borrar).
- Middleware/guardas para validar permisos en rutas.

Páginas/Endpoints sugeridos:
- GET /roles
- POST /roles
- PUT /roles/:id
- POST /roles/:id/permissions

Notas:
- Implementar modelo escalable para permisos finos.
