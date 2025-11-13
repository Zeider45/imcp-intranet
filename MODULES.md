# Módulos de la Intranet IMCP

Este documento describe los módulos implementados en la intranet con sus características y endpoints.

## 📚 Módulos Disponibles

### 1. Departamentos

Gestión de la estructura organizacional de la empresa.

**Características:**
- Listado de departamentos
- Contador automático de empleados por departamento
- Búsqueda por nombre y descripción
- Ordenamiento por nombre o fecha de creación

**Endpoints:**
```
GET    /api/departments/          - Listar todos los departamentos
POST   /api/departments/          - Crear nuevo departamento
GET    /api/departments/{id}/     - Obtener departamento específico
PUT    /api/departments/{id}/     - Actualizar departamento
PATCH  /api/departments/{id}/     - Actualización parcial
DELETE /api/departments/{id}/     - Eliminar departamento
```

**Modelo:**
```python
- name: CharField (max_length=100, unique=True)
- description: TextField (blank=True)
- created_at: DateTimeField (auto_now_add=True)
- updated_at: DateTimeField (auto_now=True)
```

---

### 2. Perfiles de Usuario

Directorio completo de empleados con información extendida.

**Características:**
- Perfiles de usuario extendidos
- Asignación de departamento
- Información de contacto (teléfono, email)
- Avatar personalizado
- Biografía
- Filtrado por departamento y estado activo
- Búsqueda por nombre, username o puesto

**Endpoints:**
```
GET    /api/profiles/             - Listar todos los perfiles
POST   /api/profiles/             - Crear nuevo perfil
GET    /api/profiles/{id}/        - Obtener perfil específico
GET    /api/profiles/me/          - Obtener perfil del usuario actual
PUT    /api/profiles/{id}/        - Actualizar perfil
PATCH  /api/profiles/{id}/        - Actualización parcial
DELETE /api/profiles/{id}/        - Eliminar perfil
```

**Modelo:**
```python
- user: OneToOneField (User)
- department: ForeignKey (Department, null=True, blank=True)
- phone: CharField (max_length=20, blank=True)
- position: CharField (max_length=100, blank=True)
- bio: TextField (blank=True)
- avatar: ImageField (upload_to='avatars/', blank=True, null=True)
- created_at: DateTimeField (auto_now_add=True)
- updated_at: DateTimeField (auto_now=True)
```

---

### 3. Anuncios

Sistema de comunicados y anuncios empresariales.

**Características:**
- Anuncios con niveles de prioridad (low, normal, high, urgent)
- Estado activo/inactivo
- Atribución de autor
- Filtrado por prioridad y estado
- Búsqueda en título y contenido
- Ordenamiento por fecha o prioridad
- Endpoint especial para anuncios activos

**Endpoints:**
```
GET    /api/announcements/        - Listar todos los anuncios
POST   /api/announcements/        - Crear nuevo anuncio
GET    /api/announcements/active/ - Listar solo anuncios activos
GET    /api/announcements/{id}/   - Obtener anuncio específico
PUT    /api/announcements/{id}/   - Actualizar anuncio
PATCH  /api/announcements/{id}/   - Actualización parcial
DELETE /api/announcements/{id}/   - Eliminar anuncio
```

**Modelo:**
```python
- title: CharField (max_length=200)
- content: TextField
- author: ForeignKey (User)
- priority: CharField (choices=['low', 'normal', 'high', 'urgent'])
- is_active: BooleanField (default=True)
- published_at: DateTimeField (auto_now_add=True)
- updated_at: DateTimeField (auto_now=True)
```

**Niveles de Prioridad:**
- `low`: Baja prioridad
- `normal`: Prioridad normal (por defecto)
- `high`: Alta prioridad
- `urgent`: Urgente

---

### 4. Documentos

Repositorio centralizado de documentos corporativos.

**Características:**
- Gestión de documentos con carga de archivos
- Categorización (policy, procedure, form, report, other)
- Asignación a departamentos
- Validación de extensiones de archivo (.pdf, .doc, .docx, .xls, .xlsx, .txt)
- Filtrado por categoría y departamento
- Búsqueda en título y descripción
- Endpoint para documentos recientes

**Endpoints:**
```
GET    /api/documents/            - Listar todos los documentos
POST   /api/documents/            - Subir nuevo documento
GET    /api/documents/recent/     - Obtener documentos recientes (últimos 10)
GET    /api/documents/{id}/       - Obtener documento específico
PUT    /api/documents/{id}/       - Actualizar documento
PATCH  /api/documents/{id}/       - Actualización parcial
DELETE /api/documents/{id}/       - Eliminar documento
```

**Modelo:**
```python
- title: CharField (max_length=200)
- description: TextField (blank=True)
- file: FileField (upload_to='documents/%Y/%m/')
- category: CharField (choices=['policy', 'procedure', 'form', 'report', 'other'])
- department: ForeignKey (Department, null=True, blank=True)
- uploaded_by: ForeignKey (User)
- uploaded_at: DateTimeField (auto_now_add=True)
- updated_at: DateTimeField (auto_now=True)
```

**Categorías:**
- `policy`: Política
- `procedure`: Procedimiento
- `form`: Formulario
- `report`: Reporte
- `other`: Otro

---

## 🔍 Características Comunes de la API

### Paginación
Todos los endpoints de listado están paginados:
- Por defecto: 10 items por página
- Parámetro: `?page=2`
- Respuesta incluye: `count`, `next`, `previous`, `results`

### Búsqueda
Parámetro: `?search=término`
- Busca en campos específicos de cada modelo
- Case-insensitive

### Ordenamiento
Parámetro: `?ordering=campo` o `?ordering=-campo` (descendente)
- Múltiples campos: `?ordering=campo1,-campo2`

### Filtrado
Parámetros específicos por modelo:
```
Departments:
  - ?search=nombre

Profiles:
  - ?department=1
  - ?user__is_active=true
  - ?search=nombre

Announcements:
  - ?priority=high
  - ?is_active=true
  - ?author=1
  - ?search=término

Documents:
  - ?category=policy
  - ?department=1
  - ?uploaded_by=1
  - ?search=término
```

---

## 💻 Uso en Frontend

### Ejemplo de uso del API Client

```typescript
import { departmentApi, profileApi, announcementApi, documentApi } from '@/lib/api';

// Listar departamentos
const { data, error } = await departmentApi.list();

// Buscar perfiles por departamento
const profiles = await profileApi.list({ department: 1, search: 'Juan' });

// Obtener anuncios activos
const activeAnnouncements = await announcementApi.active();

// Listar documentos recientes
const recentDocs = await documentApi.recent();
```

### Tipos TypeScript

Todos los módulos tienen interfaces TypeScript completas:
```typescript
interface Department {
  id: number;
  name: string;
  description: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: number;
  user: User;
  department: number;
  department_name: string;
  phone: string;
  position: string;
  bio: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

// ... más interfaces en lib/api.ts
```

---

## 🧪 Testing

### Backend Tests

Ejecutar tests:
```bash
cd backend
source venv/bin/activate
python manage.py test
```

Tests incluidos:
- Tests de modelos (creación, validación)
- Tests de API endpoints (CRUD operations)
- Tests de serializers
- Tests de filtrado y búsqueda

### Cobertura Actual
- 11 tests pasando
- Cobertura de modelos: 100%
- Cobertura de endpoints principales: 100%

---

## 📋 Checklist de Mejores Prácticas

### Backend ✅
- [x] ViewSets para operaciones RESTful
- [x] Serializers con validación
- [x] Paginación automática
- [x] Filtrado y búsqueda
- [x] Tests comprehensivos
- [x] Admin personalizado
- [x] Documentación en código

### Frontend ✅
- [x] TypeScript para type safety
- [x] Componentes reutilizables
- [x] Estados de carga y error
- [x] Diseño responsive
- [x] API client modular
- [x] Manejo robusto de errores

---

## 🔐 Seguridad

### Configuración Actual
- CORS configurado para desarrollo
- Permisos: AllowAny (para desarrollo)
- Validación de archivos por extensión
- Sanitización de inputs vía Django Forms

### Recomendaciones para Producción
1. Implementar autenticación (JWT, Session, etc.)
2. Configurar permisos apropiados (IsAuthenticated, custom permissions)
3. Usar HTTPS
4. Configurar CORS para dominios específicos
5. Implementar rate limiting
6. Validar y sanitizar todos los inputs
7. Usar variables de entorno para configuración sensible

---

## 🚀 Próximas Mejoras Sugeridas

1. **Autenticación y Autorización**
   - Login/Logout
   - Permisos basados en roles
   - Reset de contraseña

2. **Dashboard**
   - Estadísticas generales
   - Gráficos de actividad
   - Widgets personalizables

3. **Notificaciones**
   - Sistema de notificaciones en tiempo real
   - Email notifications
   - Push notifications

4. **Búsqueda Global**
   - Búsqueda unificada en todos los módulos
   - Elasticsearch integration

5. **Audit Log**
   - Registro de cambios
   - Historial de acciones

6. **Exportación**
   - Exportar datos a Excel/PDF
   - Reportes personalizados

7. **Mobile App**
   - App móvil React Native
   - Progressive Web App

---

## 📞 Soporte

Para preguntas o problemas, por favor crear un issue en el repositorio.
