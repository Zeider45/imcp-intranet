from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils import timezone


class Department(models.Model):
    """Model for organizational departments"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'
    
    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Extended user profile model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    phone = models.CharField(max_length=20, blank=True)
    position = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__username']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s Profile"


class Announcement(models.Model):
    """Model for company announcements"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcements')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-published_at']
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
    
    def __str__(self):
        return self.title


class Document(models.Model):
    """Model for document management"""
    CATEGORY_CHOICES = [
        ('policy', 'Policy'),
        ('procedure', 'Procedure'),
        ('form', 'Form'),
        ('report', 'Report'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to='documents/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'])]
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'
    
    def __str__(self):
        return self.title


# ========================================
# TIME AND RESOURCE MANAGEMENT MODELS
# ========================================

class CalendarEvent(models.Model):
    """Model for corporate calendar events and holidays"""
    EVENT_TYPE_CHOICES = [
        ('holiday', 'Holiday'),
        ('meeting', 'Meeting'),
        ('event', 'Event'),
        ('deadline', 'Deadline'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='event')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=200, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    attendees = models.ManyToManyField(User, related_name='calendar_events', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date']
        verbose_name = 'Calendar Event'
        verbose_name_plural = 'Calendar Events'
    
    def __str__(self):
        return f"{self.title} ({self.start_date.strftime('%Y-%m-%d')})"


class LeaveRequest(models.Model):
    """Model for vacation and leave requests"""
    LEAVE_TYPE_CHOICES = [
        ('vacation', 'Vacation'),
        ('sick', 'Sick Leave'),
        ('personal', 'Personal Leave'),
        ('unpaid', 'Unpaid Leave'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approval_comment = models.TextField(blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Leave Request'
        verbose_name_plural = 'Leave Requests'
    
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.leave_type} ({self.start_date})"


class Resource(models.Model):
    """Model for bookable resources"""
    RESOURCE_TYPE_CHOICES = [
        ('room', 'Meeting Room'),
        ('equipment', 'Equipment'),
        ('desk', 'Hot Desk'),
        ('vehicle', 'Vehicle'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    description = models.TextField(blank=True)
    capacity = models.IntegerField(null=True, blank=True, help_text="Capacity for rooms/vehicles")
    location = models.CharField(max_length=200, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['resource_type', 'name']
        verbose_name = 'Resource'
        verbose_name_plural = 'Resources'
    
    def __str__(self):
        return f"{self.name} ({self.get_resource_type_display()})"


class ResourceReservation(models.Model):
    """Model for resource reservations"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    purpose = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_time']
        verbose_name = 'Resource Reservation'
        verbose_name_plural = 'Resource Reservations'
    
    def __str__(self):
        return f"{self.resource.name} - {self.user.username} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"


# ========================================
# TRAINING AND DEVELOPMENT MODELS
# ========================================

class Course(models.Model):
    """Model for training courses (LMS)"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField(blank=True, help_text="Course materials and content")
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='taught_courses')
    duration_hours = models.IntegerField(help_text="Estimated duration in hours")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_mandatory = models.BooleanField(default=False)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    certificate_available = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
    
    def __str__(self):
        return self.title


class CourseEnrollment(models.Model):
    """Model for course enrollments and progress tracking"""
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    progress_percentage = models.IntegerField(default=0, help_text="0-100")
    completed_at = models.DateTimeField(null=True, blank=True)
    certificate_issued = models.BooleanField(default=False)
    certificate_issued_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['course', 'student']
        ordering = ['-enrolled_at']
        verbose_name = 'Course Enrollment'
        verbose_name_plural = 'Course Enrollments'
    
    def __str__(self):
        return f"{self.student.username} - {self.course.title}"


class KnowledgeArticle(models.Model):
    """Model for knowledge base articles and FAQs"""
    CATEGORY_CHOICES = [
        ('faq', 'FAQ'),
        ('tutorial', 'Tutorial'),
        ('guide', 'Guide'),
        ('policy', 'Policy'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='faq')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='knowledge_articles')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='knowledge_articles')
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    is_published = models.BooleanField(default=True)
    views_count = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Knowledge Article'
        verbose_name_plural = 'Knowledge Articles'
    
    def __str__(self):
        return self.title


# ========================================
# INTERACTION AND COLLABORATION MODELS
# ========================================

class ForumCategory(models.Model):
    """Model for forum categories"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class or emoji")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Forum Category'
        verbose_name_plural = 'Forum Categories'
    
    def __str__(self):
        return self.name


class ForumPost(models.Model):
    """Model for forum posts and discussions"""
    category = models.ForeignKey(ForumCategory, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='forum_posts')
    parent_post = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
        verbose_name = 'Forum Post'
        verbose_name_plural = 'Forum Posts'
    
    def __str__(self):
        return self.title


class Suggestion(models.Model):
    """Model for employee suggestions"""
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('implemented', 'Implemented'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='suggestions')
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    category = models.CharField(max_length=100, blank=True)
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_suggestions')
    review_comment = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Suggestion'
        verbose_name_plural = 'Suggestions'
    
    def __str__(self):
        return self.title


# ========================================
# TOOLS AND DATA MODELS
# ========================================

class KPIDashboard(models.Model):
    """Model for KPI metrics and business indicators"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    metric_name = models.CharField(max_length=100)
    current_value = models.DecimalField(max_digits=15, decimal_places=2)
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, help_text="e.g., %, $, units")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='kpis')
    period = models.CharField(max_length=50, help_text="e.g., Monthly, Quarterly, Yearly")
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['department', 'name']
        verbose_name = 'KPI Dashboard'
        verbose_name_plural = 'KPI Dashboards'
    
    def __str__(self):
        return f"{self.name} - {self.metric_name}"


class QuickLink(models.Model):
    """Model for quick access links to external tools"""
    CATEGORY_CHOICES = [
        ('crm', 'CRM'),
        ('erp', 'ERP'),
        ('hr', 'HR System'),
        ('finance', 'Finance'),
        ('communication', 'Communication'),
        ('productivity', 'Productivity'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    url = models.URLField()
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class or emoji")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Display order")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='quick_links')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'title']
        verbose_name = 'Quick Link'
        verbose_name_plural = 'Quick Links'
    
    def __str__(self):
        return self.title


class Project(models.Model):
    """Model for project management"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    project_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_projects')
    team_members = models.ManyToManyField(User, related_name='project_teams', blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    progress_percentage = models.IntegerField(default=0, help_text="0-100")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
    
    def __str__(self):
        return self.name


class Task(models.Model):
    """Model for task management"""
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'In Review'),
        ('done', 'Done'),
        ('blocked', 'Blocked'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', 'due_date']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
    
    def __str__(self):
        return self.title


# ========================================
# BUSINESS PROCESS MODELS - IMCP USE CASES
# ========================================

class TechnicalDocument(models.Model):
    """
    Modelo para Documentación Técnica del IMCP
    Caso de Uso: CONSULTA DOCUMENTACIÓN
    Representa manuales, políticas, procedimientos almacenados en el archivo físico
    """
    DOCUMENT_TYPE_CHOICES = [
        ('manual', 'Manual Técnico'),
        ('procedure', 'Procedimiento'),
        ('policy', 'Política'),
        ('guide', 'Guía de Usuario'),
        ('specification', 'Especificación Funcional'),
        ('other', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('on_loan', 'En Préstamo'),
        ('archived', 'Archivado'),
        ('under_review', 'En Revisión'),
    ]
    
    title = models.CharField(max_length=300, verbose_name="Título del Documento")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código de Documento")
    description = models.TextField(blank=True, verbose_name="Descripción")
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='manual')
    physical_location = models.CharField(max_length=200, verbose_name="Ubicación Física")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='technical_documents')
    version = models.CharField(max_length=20, default='1.0', verbose_name="Versión")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    authorized_users = models.ManyToManyField(User, related_name='authorized_documents', blank=True, verbose_name="Usuarios Autorizados")
    file = models.FileField(
        upload_to='technical_documents/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])],
        verbose_name="Archivo Digital (opcional)"
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_technical_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['code']
        verbose_name = 'Documentación Técnica'
        verbose_name_plural = 'Documentaciones Técnicas'
    
    def __str__(self):
        return f"{self.code} - {self.title}"


class DocumentLoan(models.Model):
    """
    Modelo para Bitácora de Préstamos de Documentos
    Caso de Uso: CONSULTA DOCUMENTACIÓN
    Registra préstamos y devoluciones de documentación técnica
    """
    STATUS_CHOICES = [
        ('requested', 'Solicitado'),
        ('approved', 'Aprobado'),
        ('delivered', 'Entregado'),
        ('returned', 'Devuelto'),
        ('overdue', 'Vencido'),
        ('cancelled', 'Cancelado'),
    ]
    
    document = models.ForeignKey(TechnicalDocument, on_delete=models.CASCADE, related_name='loans')
    analyst = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_loans', verbose_name="Analista")
    assistant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_loans', verbose_name="Asistente Administrativo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    request_date = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Solicitud")
    delivery_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Entrega")
    expected_return_date = models.DateField(null=True, blank=True, verbose_name="Fecha Esperada de Devolución")
    actual_return_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha Real de Devolución")
    purpose = models.TextField(verbose_name="Propósito de la Consulta")
    notes = models.TextField(blank=True, verbose_name="Notas/Observaciones")
    analyst_signature = models.BooleanField(default=False, verbose_name="Firma del Analista")
    return_verified = models.BooleanField(default=False, verbose_name="Verificación de Devolución")
    
    class Meta:
        ordering = ['-request_date']
        verbose_name = 'Préstamo de Documento'
        verbose_name_plural = 'Préstamos de Documentos'
    
    def __str__(self):
        return f"Préstamo: {self.document.code} - {self.analyst.get_full_name()}"


class DocumentDraft(models.Model):
    """
    Modelo para Borradores de Documentación
    Caso de Uso: REALIZA DOCUMENTACIÓN SOBRE UNA FUNCIONALIDAD O SISTEMA
    Representa documentación en proceso de elaboración por analistas
    """
    DOCUMENT_TYPE_CHOICES = [
        ('technical_manual', 'Manual Técnico'),
        ('user_guide', 'Guía de Usuario'),
        ('functional_spec', 'Especificación Funcional'),
        ('procedure', 'Procedimiento Operativo'),
        ('other', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('under_review', 'En Revisión'),
        ('pending_approval', 'Pendiente de Aprobación'),
        ('approved', 'Aprobado'),
        ('approved_with_observations', 'Aprobado con Observaciones'),
        ('rejected', 'Rechazado'),
        ('published', 'Publicado'),
    ]
    
    title = models.CharField(max_length=300, verbose_name="Título")
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    content = models.TextField(verbose_name="Contenido del Documento")
    system_or_functionality = models.CharField(max_length=200, verbose_name="Sistema/Funcionalidad Documentada")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_drafts', verbose_name="Analista Autor")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    version = models.CharField(max_length=20, default='1.0')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    file = models.FileField(
        upload_to='document_drafts/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])],
        verbose_name="Archivo del Documento"
    )
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Envío a Revisión")
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewing_drafts', verbose_name="Gerente Asignado")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Borrador de Documentación'
        verbose_name_plural = 'Borradores de Documentación'
    
    def __str__(self):
        return f"{self.title} - {self.author.get_full_name()}"


class DocumentApproval(models.Model):
    """
    Modelo para Aprobación de Documentación
    Caso de Uso: APROBACIÓN DE LA DOCUMENTACIÓN
    Registra el proceso de revisión y aprobación por gerentes
    """
    DECISION_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('approved_with_observations', 'Aprobado con Observaciones'),
        ('rejected', 'Rechazado'),
    ]
    
    document_draft = models.ForeignKey(DocumentDraft, on_delete=models.CASCADE, related_name='approvals')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_reviews', verbose_name="Gerente Revisor")
    assistant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assisted_approvals', verbose_name="Asistente Administrativo")
    decision = models.CharField(max_length=30, choices=DECISION_CHOICES, default='pending')
    technical_observations = models.TextField(blank=True, verbose_name="Observaciones Técnicas")
    corrections_required = models.TextField(blank=True, verbose_name="Correcciones Requeridas")
    correction_deadline = models.DateField(null=True, blank=True, verbose_name="Plazo para Correcciones")
    rejection_reason = models.TextField(blank=True, verbose_name="Motivo de Rechazo")
    approved_at = models.DateTimeField(null=True, blank=True)
    validity_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Vigencia")
    requires_board_approval = models.BooleanField(default=False, verbose_name="Requiere Aprobación de Junta Directiva")
    board_approved = models.BooleanField(default=False, verbose_name="Aprobado por Junta Directiva")
    reviewer_signature = models.BooleanField(default=False, verbose_name="Firma del Revisor")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Aprobación de Documento'
        verbose_name_plural = 'Aprobaciones de Documentos'
    
    def __str__(self):
        return f"Revisión: {self.document_draft.title} - {self.get_decision_display()}"


class Policy(models.Model):
    """
    Modelo para Políticas Institucionales
    Caso de Uso: ESTABLECER POLÍTICAS
    Representa políticas tecnológicas oficiales del IMCP
    """
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('under_review', 'En Revisión'),
        ('pending_signatures', 'Pendiente de Firmas'),
        ('approved', 'Aprobada'),
        ('published', 'Publicada'),
        ('obsolete', 'Obsoleta'),
    ]
    
    ORIGIN_CHOICES = [
        ('sudeban', 'Cambio Normativo SUDEBAN'),
        ('bcv', 'Cambio Normativo BCV'),
        ('audit', 'Resultado de Auditoría'),
        ('improvement', 'Mejora de Procesos'),
        ('internal', 'Iniciativa Interna'),
        ('other', 'Otro'),
    ]
    
    title = models.CharField(max_length=300, verbose_name="Título de la Política")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código de Política")
    description = models.TextField(verbose_name="Descripción")
    content = models.TextField(verbose_name="Contenido de la Política")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    origin = models.CharField(max_length=20, choices=ORIGIN_CHOICES, verbose_name="Origen de la Necesidad")
    origin_justification = models.TextField(verbose_name="Justificación")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_policies', verbose_name="Gerente Creador")
    auditor_reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audited_policies', verbose_name="Auditor Revisor")
    peer_reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='peer_reviewed_policies', verbose_name="Gerente Par Revisor")
    review_meeting_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Reunión de Revisión")
    review_meeting_notes = models.TextField(blank=True, verbose_name="Minuta de Reunión")
    board_approval_date = models.DateField(null=True, blank=True, verbose_name="Fecha Aprobación Junta Directiva")
    board_approved = models.BooleanField(default=False, verbose_name="Aprobado por Junta Directiva")
    effective_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Vigencia")
    expiration_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Expiración")
    version = models.CharField(max_length=20, default='1.0')
    replaces_policy = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replaced_by', verbose_name="Reemplaza a Política")
    file = models.FileField(
        upload_to='policies/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])]
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Política'
        verbose_name_plural = 'Políticas'
    
    def __str__(self):
        return f"{self.code} - {self.title}"


class PolicyDistribution(models.Model):
    """
    Modelo para Distribución de Políticas
    Caso de Uso: ESTABLECER POLÍTICAS
    Registra la distribución oficial de políticas a personal
    """
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name='distributions')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_policies', verbose_name="Destinatario")
    distributed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='distributed_policies', verbose_name="Distribuido Por")
    distributed_at = models.DateTimeField(auto_now_add=True)
    acknowledged = models.BooleanField(default=False, verbose_name="Acuse de Recibo")
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['policy', 'recipient']
        ordering = ['-distributed_at']
        verbose_name = 'Distribución de Política'
        verbose_name_plural = 'Distribuciones de Políticas'
    
    def __str__(self):
        return f"{self.policy.code} -> {self.recipient.get_full_name()}"


class TrainingPlan(models.Model):
    """
    Modelo para Planificación de Capacitaciones
    Caso de Uso: PLANIFICAR CAPACITACIONES PARA LOS ANALISTAS
    Plan de capacitación técnica elaborado por el presidente
    """
    MODALITY_CHOICES = [
        ('presential', 'Presencial'),
        ('online', 'En Línea'),
        ('hybrid', 'Híbrido'),
    ]
    
    SCOPE_CHOICES = [
        ('intergerencial', 'Intergerencial'),
        ('interdepartamental', 'Interdepartamental'),
    ]
    
    ORIGIN_CHOICES = [
        ('performance', 'Evaluación de Desempeño'),
        ('new_technology', 'Nueva Tecnología/Sistema'),
        ('regulation', 'Actualización Normativa'),
        ('audit', 'Resultado de Auditoría'),
        ('other', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('planning', 'En Planificación'),
        ('budget_review', 'En Revisión de Presupuesto'),
        ('quotation', 'En Cotización'),
        ('approved', 'Aprobado'),
        ('scheduled', 'Programado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]
    
    title = models.CharField(max_length=300, verbose_name="Título de la Capacitación")
    description = models.TextField(verbose_name="Descripción/Objetivo")
    topics = models.TextField(verbose_name="Temas a Cubrir")
    origin = models.CharField(max_length=20, choices=ORIGIN_CHOICES, verbose_name="Origen de la Necesidad")
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, verbose_name="Alcance")
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES, default='presential')
    duration_hours = models.IntegerField(verbose_name="Duración (horas)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_training_plans', verbose_name="Creado Por (Presidente)")
    assigned_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_training_plans', verbose_name="Gerente Asignado")
    budget_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Presupuesto")
    budget_approved = models.BooleanField(default=False, verbose_name="Presupuesto Aprobado")
    instructor_profile = models.TextField(blank=True, verbose_name="Perfil del Instructor Requerido")
    planned_start_date = models.DateField(null=True, blank=True, verbose_name="Fecha Planificada de Inicio")
    planned_end_date = models.DateField(null=True, blank=True, verbose_name="Fecha Planificada de Fin")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Plan de Capacitación'
        verbose_name_plural = 'Planes de Capacitación'
    
    def __str__(self):
        return self.title


class TrainingProvider(models.Model):
    """
    Modelo para Proveedores de Capacitación
    Caso de Uso: PLANIFICAR CAPACITACIONES PARA LOS ANALISTAS
    Proveedores externos e instructores
    """
    name = models.CharField(max_length=200, verbose_name="Nombre del Proveedor")
    contact_name = models.CharField(max_length=200, blank=True, verbose_name="Persona de Contacto")
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    specialties = models.TextField(blank=True, verbose_name="Especialidades")
    rating = models.IntegerField(null=True, blank=True, verbose_name="Calificación (1-5)")
    notes = models.TextField(blank=True, verbose_name="Notas")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Proveedor de Capacitación'
        verbose_name_plural = 'Proveedores de Capacitación'
    
    def __str__(self):
        return self.name


class TrainingQuotation(models.Model):
    """
    Modelo para Cotizaciones de Capacitación
    Caso de Uso: PLANIFICAR CAPACITACIONES PARA LOS ANALISTAS
    Cotizaciones recibidas de proveedores
    """
    STATUS_CHOICES = [
        ('received', 'Recibida'),
        ('under_review', 'En Revisión'),
        ('selected', 'Seleccionada'),
        ('rejected', 'Rechazada'),
    ]
    
    training_plan = models.ForeignKey(TrainingPlan, on_delete=models.CASCADE, related_name='quotations')
    provider = models.ForeignKey(TrainingProvider, on_delete=models.CASCADE, related_name='quotations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    temario = models.TextField(verbose_name="Temario Ofrecido")
    duration_hours = models.IntegerField(verbose_name="Duración Propuesta (horas)")
    cost = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Costo")
    instructor_name = models.CharField(max_length=200, blank=True, verbose_name="Nombre del Instructor")
    instructor_profile = models.TextField(blank=True, verbose_name="Perfil del Instructor")
    available_dates = models.TextField(blank=True, verbose_name="Fechas Disponibles")
    validity_date = models.DateField(null=True, blank=True, verbose_name="Vigencia de la Cotización")
    received_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-received_at']
        verbose_name = 'Cotización de Capacitación'
        verbose_name_plural = 'Cotizaciones de Capacitación'
    
    def __str__(self):
        return f"Cotización: {self.training_plan.title} - {self.provider.name}"


class TrainingSession(models.Model):
    """
    Modelo para Sesiones de Capacitación
    Caso de Uso: ASISTEN A CAPACITACIONES DE LA GERENCIA
    Sesiones programadas de capacitación
    """
    STATUS_CHOICES = [
        ('scheduled', 'Programada'),
        ('confirmed', 'Confirmada'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
    ]
    
    training_plan = models.ForeignKey(TrainingPlan, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=300, verbose_name="Título de la Sesión")
    description = models.TextField(blank=True)
    instructor_name = models.CharField(max_length=200, verbose_name="Nombre del Instructor")
    provider = models.ForeignKey(TrainingProvider, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    location = models.CharField(max_length=300, verbose_name="Lugar")
    start_datetime = models.DateTimeField(verbose_name="Fecha y Hora de Inicio")
    end_datetime = models.DateTimeField(verbose_name="Fecha y Hora de Fin")
    materials_required = models.TextField(blank=True, verbose_name="Materiales Requeridos")
    objectives = models.TextField(blank=True, verbose_name="Objetivos")
    max_participants = models.IntegerField(null=True, blank=True, verbose_name="Máximo de Participantes")
    confirmation_deadline = models.DateField(null=True, blank=True, verbose_name="Fecha Límite de Confirmación")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_datetime']
        verbose_name = 'Sesión de Capacitación'
        verbose_name_plural = 'Sesiones de Capacitación'
    
    def __str__(self):
        return f"{self.title} - {self.start_datetime.strftime('%Y-%m-%d')}"


class TrainingAttendance(models.Model):
    """
    Modelo para Asistencia a Capacitaciones
    Caso de Uso: ASISTEN A CAPACITACIONES DE LA GERENCIA
    Registro de convocatoria, confirmación y asistencia de analistas
    """
    CONFIRMATION_STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmada'),
        ('declined', 'Rechazada'),
        ('rescheduled', 'Reprogramada'),
    ]
    
    ATTENDANCE_STATUS_CHOICES = [
        ('not_recorded', 'No Registrada'),
        ('present', 'Presente'),
        ('absent_justified', 'Ausente Justificado'),
        ('absent_unjustified', 'Ausente Injustificado'),
        ('late', 'Tardanza'),
    ]
    
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='attendances')
    analyst = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_attendances', verbose_name="Analista")
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='training_invitations', verbose_name="Convocado Por")
    confirmation_status = models.CharField(max_length=20, choices=CONFIRMATION_STATUS_CHOICES, default='pending')
    confirmation_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Confirmación")
    decline_reason = models.TextField(blank=True, verbose_name="Motivo de Rechazo")
    justification_document = models.FileField(
        upload_to='training_justifications/%Y/%m/',
        blank=True,
        null=True,
        verbose_name="Documento de Justificación"
    )
    attendance_status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS_CHOICES, default='not_recorded')
    arrival_time = models.TimeField(null=True, blank=True, verbose_name="Hora de Llegada")
    departure_time = models.TimeField(null=True, blank=True, verbose_name="Hora de Salida")
    attendance_signature = models.BooleanField(default=False, verbose_name="Firma de Asistencia")
    evaluation_score = models.IntegerField(null=True, blank=True, verbose_name="Calificación de Evaluación")
    certificate_issued = models.BooleanField(default=False, verbose_name="Certificado Emitido")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['session', 'analyst']
        ordering = ['-session__start_datetime']
        verbose_name = 'Asistencia a Capacitación'
        verbose_name_plural = 'Asistencias a Capacitaciones'
    
    def __str__(self):
        return f"{self.analyst.get_full_name()} - {self.session.title}"


class InternalVacancy(models.Model):
    """
    Modelo para Vacantes Internas
    Caso de Uso: DISPONIBILIDAD DE VACANTE INTERNA
    Gestión de vacantes disponibles en el bloque tecnológico
    """
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('pending_approval', 'Pendiente de Aprobación'),
        ('published', 'Publicada'),
        ('closed', 'Cerrada'),
        ('filled', 'Cubierta'),
        ('cancelled', 'Cancelada'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título del Puesto")
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='vacancies')
    description = models.TextField(verbose_name="Descripción del Puesto")
    responsibilities = models.TextField(verbose_name="Responsabilidades")
    technical_requirements = models.TextField(verbose_name="Requisitos Técnicos")
    competencies = models.TextField(verbose_name="Competencias Requeridas")
    experience_required = models.CharField(max_length=200, verbose_name="Experiencia Mínima")
    specific_knowledge = models.TextField(blank=True, verbose_name="Conocimientos Específicos")
    salary_range_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Rango Salarial Mínimo")
    salary_range_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Rango Salarial Máximo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_vacancies', verbose_name="Gerente Solicitante")
    hr_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_vacancies', verbose_name="Responsable RRHH")
    authorization_justification = models.TextField(verbose_name="Justificación de la Solicitud")
    budget_approved = models.BooleanField(default=False, verbose_name="Presupuesto Aprobado")
    required_date = models.DateField(null=True, blank=True, verbose_name="Fecha Requerida")
    application_deadline = models.DateField(null=True, blank=True, verbose_name="Fecha Límite de Postulación")
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Vacante Interna'
        verbose_name_plural = 'Vacantes Internas'
    
    def __str__(self):
        return f"{self.title} - {self.department.name}"


class VacancyApplication(models.Model):
    """
    Modelo para Aplicaciones a Vacantes
    Caso de Uso: DISPONIBILIDAD DE VACANTE INTERNA
    Postulaciones de empleados internos
    """
    STATUS_CHOICES = [
        ('submitted', 'Enviada'),
        ('under_review', 'En Revisión'),
        ('shortlisted', 'Preseleccionado'),
        ('interview_scheduled', 'Entrevista Programada'),
        ('interviewed', 'Entrevistado'),
        ('selected', 'Seleccionado'),
        ('rejected', 'Rechazado'),
        ('withdrawn', 'Retirada'),
    ]
    
    vacancy = models.ForeignKey(InternalVacancy, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vacancy_applications', verbose_name="Postulante")
    current_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_applications', verbose_name="Gerente Actual")
    current_manager_authorization = models.BooleanField(default=False, verbose_name="Autorización del Gerente Actual")
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='submitted')
    cover_letter = models.TextField(blank=True, verbose_name="Carta de Presentación")
    cv_file = models.FileField(
        upload_to='vacancy_applications/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx'])],
        verbose_name="CV Actualizado"
    )
    certificates_file = models.FileField(
        upload_to='vacancy_certificates/%Y/%m/',
        blank=True,
        null=True,
        verbose_name="Certificados"
    )
    performance_evaluations = models.TextField(blank=True, verbose_name="Referencias a Evaluaciones de Desempeño")
    technical_score = models.IntegerField(null=True, blank=True, verbose_name="Puntuación Técnica")
    experience_score = models.IntegerField(null=True, blank=True, verbose_name="Puntuación de Experiencia")
    performance_score = models.IntegerField(null=True, blank=True, verbose_name="Puntuación de Desempeño")
    potential_score = models.IntegerField(null=True, blank=True, verbose_name="Puntuación de Potencial")
    overall_ranking = models.IntegerField(null=True, blank=True, verbose_name="Ranking General")
    interview_date = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Entrevista")
    interview_notes = models.TextField(blank=True, verbose_name="Notas de Entrevista")
    hr_notes = models.TextField(blank=True, verbose_name="Notas de RRHH")
    rejection_reason = models.TextField(blank=True, verbose_name="Motivo de Rechazo")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['vacancy', 'applicant']
        ordering = ['-applied_at']
        verbose_name = 'Aplicación a Vacante'
        verbose_name_plural = 'Aplicaciones a Vacantes'
    
    def __str__(self):
        return f"{self.applicant.get_full_name()} -> {self.vacancy.title}"


class VacancyTransition(models.Model):
    """
    Modelo para Transición de Puesto
    Caso de Uso: DISPONIBILIDAD DE VACANTE INTERNA
    Gestión de transición cuando se selecciona un candidato
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completada'),
    ]
    
    application = models.OneToOneField(VacancyApplication, on_delete=models.CASCADE, related_name='transition')
    previous_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='outgoing_transitions')
    new_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='incoming_transitions')
    previous_position = models.CharField(max_length=200, verbose_name="Puesto Anterior")
    new_position = models.CharField(max_length=200, verbose_name="Nuevo Puesto")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transition_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Transición")
    hr_coordinator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='coordinated_transitions', verbose_name="Coordinador RRHH")
    directory_updated = models.BooleanField(default=False, verbose_name="Directorio Actualizado")
    system_permissions_updated = models.BooleanField(default=False, verbose_name="Permisos de Sistema Actualizados")
    file_updated = models.BooleanField(default=False, verbose_name="Expediente Actualizado")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Transición de Puesto'
        verbose_name_plural = 'Transiciones de Puesto'
    
    def __str__(self):
        return f"Transición: {self.application.applicant.get_full_name()} -> {self.new_position}"
