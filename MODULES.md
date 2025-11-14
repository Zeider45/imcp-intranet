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

## 📅 Módulos de Gestión del Tiempo y Recursos

### 5. Calendario Corporativo

Gestión de eventos, festivos y fechas importantes de la empresa.

**Características:**
- Calendario de eventos corporativos
- Gestión de festivos y días importantes
- Eventos con múltiples asistentes
- Filtrado por tipo de evento
- Vista de eventos próximos
- Eventos de todo el día o con horario específico

**Endpoints:**
```
GET    /api/calendar-events/           - Listar todos los eventos
POST   /api/calendar-events/           - Crear nuevo evento
GET    /api/calendar-events/upcoming/  - Obtener eventos próximos
GET    /api/calendar-events/{id}/      - Obtener evento específico
PUT    /api/calendar-events/{id}/      - Actualizar evento
PATCH  /api/calendar-events/{id}/      - Actualización parcial
DELETE /api/calendar-events/{id}/      - Eliminar evento
```

**Modelo:**
```python
- title: CharField (max_length=200)
- description: TextField (blank=True)
- event_type: CharField (choices=['holiday', 'meeting', 'event', 'deadline', 'other'])
- start_date: DateTimeField
- end_date: DateTimeField
- all_day: BooleanField (default=False)
- location: CharField (max_length=200, blank=True)
- created_by: ForeignKey (User)
- attendees: ManyToManyField (User)
```

---

### 6. Solicitudes de Vacaciones/Permisos

Sistema de solicitud y aprobación de días libres con flujo de trabajo.

**Características:**
- Solicitud de vacaciones, permisos médicos, personales
- Flujo de aprobación con comentarios
- Estados: pendiente, aprobado, rechazado, cancelado
- Historial de solicitudes
- Panel de aprobación para supervisores
- Notificaciones de estado

**Endpoints:**
```
GET    /api/leave-requests/            - Listar solicitudes
POST   /api/leave-requests/            - Crear solicitud
GET    /api/leave-requests/pending/    - Solicitudes pendientes
GET    /api/leave-requests/{id}/       - Obtener solicitud específica
POST   /api/leave-requests/{id}/approve/ - Aprobar solicitud
POST   /api/leave-requests/{id}/reject/  - Rechazar solicitud
PUT    /api/leave-requests/{id}/       - Actualizar solicitud
DELETE /api/leave-requests/{id}/       - Eliminar solicitud
```

**Modelo:**
```python
- employee: ForeignKey (User)
- leave_type: CharField (choices=['vacation', 'sick', 'personal', 'unpaid', 'other'])
- start_date: DateField
- end_date: DateField
- reason: TextField
- status: CharField (choices=['pending', 'approved', 'rejected', 'cancelled'])
- approver: ForeignKey (User, null=True)
- approval_comment: TextField (blank=True)
- approved_at: DateTimeField (null=True)
```

---

### 7. Recursos y Reservas

Sistema de reserva de recursos (salas, equipos, escritorios).

**Características:**
- Catálogo de recursos disponibles
- Reserva de salas de reuniones
- Reserva de equipos (proyectores, laptops, vehículos)
- Sistema de hot-desking
- Verificación de disponibilidad
- Gestión de reservas (confirmar, cancelar, completar)

**Endpoints:**

**Recursos:**
```
GET    /api/resources/              - Listar recursos
POST   /api/resources/              - Crear recurso
GET    /api/resources/available/    - Recursos disponibles
GET    /api/resources/{id}/         - Obtener recurso específico
PUT    /api/resources/{id}/         - Actualizar recurso
DELETE /api/resources/{id}/         - Eliminar recurso
```

**Reservas:**
```
GET    /api/resource-reservations/     - Listar reservas
POST   /api/resource-reservations/     - Crear reserva
GET    /api/resource-reservations/{id}/ - Obtener reserva específica
PUT    /api/resource-reservations/{id}/ - Actualizar reserva
DELETE /api/resource-reservations/{id}/ - Eliminar reserva
```

**Modelos:**
```python
Resource:
- name: CharField (max_length=200)
- resource_type: CharField (choices=['room', 'equipment', 'desk', 'vehicle', 'other'])
- description: TextField (blank=True)
- capacity: IntegerField (null=True)
- location: CharField (max_length=200)
- is_available: BooleanField (default=True)

ResourceReservation:
- resource: ForeignKey (Resource)
- user: ForeignKey (User)
- start_time: DateTimeField
- end_time: DateTimeField
- purpose: TextField (blank=True)
- status: CharField (choices=['pending', 'confirmed', 'cancelled', 'completed'])
```

---

## 📚 Módulos de Formación y Desarrollo

### 8. Centro de Formación (LMS)

Sistema de gestión de aprendizaje con cursos internos y certificaciones.

**Características:**
- Catálogo de cursos
- Inscripción a cursos
- Seguimiento de progreso (0-100%)
- Cursos obligatorios y opcionales
- Certificados digitales
- Contenido de formación
- Asignación de instructores

**Endpoints:**

**Cursos:**
```
GET    /api/courses/               - Listar cursos
POST   /api/courses/               - Crear curso
GET    /api/courses/published/     - Cursos publicados
GET    /api/courses/{id}/          - Obtener curso específico
PUT    /api/courses/{id}/          - Actualizar curso
DELETE /api/courses/{id}/          - Eliminar curso
```

**Inscripciones:**
```
GET    /api/course-enrollments/    - Listar inscripciones
POST   /api/course-enrollments/    - Inscribirse a curso
GET    /api/course-enrollments/{id}/ - Obtener inscripción específica
PATCH  /api/course-enrollments/{id}/ - Actualizar progreso
```

**Modelos:**
```python
Course:
- title: CharField (max_length=200)
- description: TextField
- content: TextField (blank=True)
- instructor: ForeignKey (User, null=True)
- duration_hours: IntegerField
- status: CharField (choices=['draft', 'published', 'archived'])
- is_mandatory: BooleanField (default=False)
- department: ForeignKey (Department, null=True)
- certificate_available: BooleanField (default=False)

CourseEnrollment:
- course: ForeignKey (Course)
- student: ForeignKey (User)
- enrolled_at: DateTimeField (auto_now_add=True)
- status: CharField (choices=['enrolled', 'in_progress', 'completed', 'dropped'])
- progress_percentage: IntegerField (0-100)
- completed_at: DateTimeField (null=True)
- certificate_issued: BooleanField (default=False)
```

---

### 9. Base de Conocimientos / FAQ

Repositorio de artículos, tutoriales y respuestas frecuentes.

**Características:**
- Artículos y tutoriales
- Preguntas frecuentes (FAQ)
- Guías y políticas
- Sistema de etiquetas
- Búsqueda por contenido
- Contador de vistas y utilidad
- Artículos populares

**Endpoints:**
```
GET    /api/knowledge-articles/              - Listar artículos
POST   /api/knowledge-articles/              - Crear artículo
GET    /api/knowledge-articles/popular/      - Artículos populares
GET    /api/knowledge-articles/{id}/         - Obtener artículo específico
POST   /api/knowledge-articles/{id}/mark_helpful/ - Marcar como útil
PUT    /api/knowledge-articles/{id}/         - Actualizar artículo
DELETE /api/knowledge-articles/{id}/         - Eliminar artículo
```

**Modelo:**
```python
- title: CharField (max_length=200)
- content: TextField
- category: CharField (choices=['faq', 'tutorial', 'guide', 'policy', 'other'])
- author: ForeignKey (User)
- department: ForeignKey (Department, null=True)
- tags: CharField (max_length=200, blank=True)
- is_published: BooleanField (default=True)
- views_count: IntegerField (default=0)
- helpful_count: IntegerField (default=0)
```

---

## 💬 Módulos de Interacción y Colaboración

### 10. Foros de Discusión

Espacios para interacción entre equipos y empleados con intereses comunes.

**Características:**
- Categorías de foros
- Crear discusiones y respuestas
- Posts fijados e importantes
- Sistema de hilos (posts padre-hijo)
- Contador de vistas y respuestas
- Bloqueo de posts
- Búsqueda en discusiones

**Endpoints:**

**Categorías:**
```
GET    /api/forum-categories/      - Listar categorías
POST   /api/forum-categories/      - Crear categoría
GET    /api/forum-categories/{id}/ - Obtener categoría específica
PUT    /api/forum-categories/{id}/ - Actualizar categoría
DELETE /api/forum-categories/{id}/ - Eliminar categoría
```

**Posts:**
```
GET    /api/forum-posts/               - Listar posts
POST   /api/forum-posts/               - Crear post
GET    /api/forum-posts/{id}/          - Obtener post específico
POST   /api/forum-posts/{id}/increment_views/ - Incrementar vistas
PUT    /api/forum-posts/{id}/          - Actualizar post
DELETE /api/forum-posts/{id}/          - Eliminar post
```

**Modelos:**
```python
ForumCategory:
- name: CharField (max_length=100)
- description: TextField (blank=True)
- icon: CharField (max_length=50, blank=True)
- is_active: BooleanField (default=True)

ForumPost:
- category: ForeignKey (ForumCategory)
- title: CharField (max_length=200)
- content: TextField
- author: ForeignKey (User)
- parent_post: ForeignKey (self, null=True)
- is_pinned: BooleanField (default=False)
- is_locked: BooleanField (default=False)
- views_count: IntegerField (default=0)
```

---

### 11. Buzón de Sugerencias

Canal para que empleados envíen ideas anónimas o públicas.

**Características:**
- Sugerencias anónimas o públicas
- Sistema de votación (upvotes)
- Estados de revisión
- Comentarios del revisor
- Categorización
- Historial de sugerencias
- Panel de gestión

**Endpoints:**
```
GET    /api/suggestions/            - Listar sugerencias
POST   /api/suggestions/            - Crear sugerencia
GET    /api/suggestions/{id}/       - Obtener sugerencia específica
POST   /api/suggestions/{id}/upvote/ - Votar sugerencia
PUT    /api/suggestions/{id}/       - Actualizar sugerencia
DELETE /api/suggestions/{id}/       - Eliminar sugerencia
```

**Modelo:**
```python
- title: CharField (max_length=200)
- description: TextField
- author: ForeignKey (User, null=True)
- is_anonymous: BooleanField (default=False)
- status: CharField (choices=['submitted', 'under_review', 'approved', 'rejected', 'implemented'])
- category: CharField (max_length=100, blank=True)
- reviewer: ForeignKey (User, null=True)
- review_comment: TextField (blank=True)
- reviewed_at: DateTimeField (null=True)
- upvotes: IntegerField (default=0)
```

---

## 📊 Módulos de Herramientas y Datos

### 12. Indicadores Clave (KPIs)

Dashboard de métricas y resultados clave del negocio en tiempo real.

**Características:**
- Visualizar KPIs en tiempo real
- Valores actuales vs objetivos
- Porcentaje de cumplimiento automático
- Filtrado por departamento y período
- Métricas personalizadas
- Histórico de KPIs
- Indicadores activos/inactivos

**Endpoints:**
```
GET    /api/kpi-dashboards/        - Listar KPIs
POST   /api/kpi-dashboards/        - Crear KPI
GET    /api/kpi-dashboards/active/ - KPIs activos
GET    /api/kpi-dashboards/{id}/   - Obtener KPI específico
PUT    /api/kpi-dashboards/{id}/   - Actualizar KPI
DELETE /api/kpi-dashboards/{id}/   - Eliminar KPI
```

**Modelo:**
```python
- name: CharField (max_length=200)
- description: TextField (blank=True)
- metric_name: CharField (max_length=100)
- current_value: DecimalField (max_digits=15, decimal_places=2)
- target_value: DecimalField (max_digits=15, decimal_places=2, null=True)
- unit: CharField (max_length=50, blank=True)
- department: ForeignKey (Department, null=True)
- period: CharField (max_length=50)
- is_active: BooleanField (default=True)
```

---

### 13. Enlaces de Interés

Listado de accesos directos a herramientas externas importantes.

**Características:**
- Enlaces a CRM, ERP, sistemas varios
- Categorización (CRM, ERP, HR, Finance, etc.)
- Iconos personalizados
- Orden personalizable
- Enlaces por departamento
- Activar/desactivar enlaces
- Descripción de herramientas

**Endpoints:**
```
GET    /api/quick-links/        - Listar enlaces
POST   /api/quick-links/        - Crear enlace
GET    /api/quick-links/active/ - Enlaces activos
GET    /api/quick-links/{id}/   - Obtener enlace específico
PUT    /api/quick-links/{id}/   - Actualizar enlace
DELETE /api/quick-links/{id}/   - Eliminar enlace
```

**Modelo:**
```python
- title: CharField (max_length=200)
- url: URLField
- description: TextField (blank=True)
- category: CharField (choices=['crm', 'erp', 'hr', 'finance', 'communication', 'productivity', 'other'])
- icon: CharField (max_length=50, blank=True)
- is_active: BooleanField (default=True)
- order: IntegerField (default=0)
- department: ForeignKey (Department, null=True)
```

---

### 14. Gestión de Proyectos

Herramienta para planificar, organizar y dar seguimiento a proyectos.

**Características:**
- Crear y gestionar proyectos
- Estados y prioridades
- Asignar gerente y equipo
- Fechas de inicio y fin
- Seguimiento de progreso
- Ver tareas asociadas
- Filtrado y búsqueda

**Endpoints:**
```
GET    /api/projects/         - Listar proyectos
POST   /api/projects/         - Crear proyecto
GET    /api/projects/active/  - Proyectos activos
GET    /api/projects/{id}/    - Obtener proyecto específico
PUT    /api/projects/{id}/    - Actualizar proyecto
DELETE /api/projects/{id}/    - Eliminar proyecto
```

**Modelo:**
```python
- name: CharField (max_length=200)
- description: TextField
- status: CharField (choices=['planning', 'active', 'on_hold', 'completed', 'cancelled'])
- priority: CharField (choices=['low', 'medium', 'high', 'critical'])
- project_manager: ForeignKey (User, null=True)
- team_members: ManyToManyField (User)
- department: ForeignKey (Department, null=True)
- start_date: DateField (null=True)
- end_date: DateField (null=True)
- progress_percentage: IntegerField (0-100)
```

---

### 15. Gestión de Tareas

Sistema simple para asignar, seguir y reportar el estado de tareas.

**Características:**
- Crear y asignar tareas
- Estados y prioridades
- Asociar tareas a proyectos
- Fechas de vencimiento
- Ver mis tareas asignadas
- Filtrar por estado, prioridad, proyecto
- Búsqueda en tareas

**Endpoints:**
```
GET    /api/tasks/           - Listar tareas
POST   /api/tasks/           - Crear tarea
GET    /api/tasks/my_tasks/  - Mis tareas asignadas
GET    /api/tasks/{id}/      - Obtener tarea específica
PUT    /api/tasks/{id}/      - Actualizar tarea
DELETE /api/tasks/{id}/      - Eliminar tarea
```

**Modelo:**
```python
- title: CharField (max_length=200)
- description: TextField (blank=True)
- project: ForeignKey (Project, null=True)
- assigned_to: ForeignKey (User, null=True)
- created_by: ForeignKey (User)
- status: CharField (choices=['todo', 'in_progress', 'review', 'done', 'blocked'])
- priority: CharField (choices=['low', 'medium', 'high', 'urgent'])
- due_date: DateField (null=True)
- completed_at: DateTimeField (null=True)
```

---

## 📞 Soporte

Para preguntas o problemas, por favor crear un issue en el repositorio.
