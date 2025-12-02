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


# ========================================
# BUSINESS PROCESS MODELS - IMCP USE CASES
# ========================================

class LibraryDocument(models.Model):
    """
    Modelo unificado para Biblioteca de Documentos del IMCP
    Unifica: Documentación Técnica, Elaboración de Docs y Aprobación de Docs
    Permite subir, ver, descargar archivos, y realizar elaboración y aprobación
    """
    DOCUMENT_TYPE_CHOICES = [
        ('manual', 'Manual Técnico'),
        ('procedure', 'Procedimiento'),
        ('policy', 'Política'),
        ('guide', 'Guía de Usuario'),
        ('specification', 'Especificación Funcional'),
        ('form', 'Formulario'),
        ('report', 'Reporte'),
        ('other', 'Otro'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('pending_approval', 'Pendiente de Aprobación'),
        ('approved', 'Aprobado'),
        ('approved_with_observations', 'Aprobado con Observaciones'),
        ('rejected', 'Rechazado'),
        ('published', 'Publicado'),
        ('archived', 'Archivado'),
    ]
    
    # Basic document information
    title = models.CharField(max_length=300, verbose_name="Título del Documento")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código de Documento")
    description = models.TextField(blank=True, verbose_name="Descripción")
    content = models.TextField(blank=True, verbose_name="Contenido del Documento")
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='manual')
    version = models.CharField(max_length=20, default='1.0', verbose_name="Versión")
    
    # File attachment
    file = models.FileField(
        upload_to='library_documents/%Y/%m/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'ppt', 'pptx'])],
        verbose_name="Archivo del Documento"
    )
    
    # Organization
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='library_documents')
    tags = models.CharField(max_length=500, blank=True, verbose_name="Etiquetas (separadas por coma)")
    
    # Authorship
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_library_documents', verbose_name="Autor")
    
    # Status and workflow
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Envío a Aprobación")
    
    # Approval fields (approval done in same module)
    # Note: For testing, approval is open to everyone. In production, only managers should approve.
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_library_documents', verbose_name="Aprobador")
    approval_decision = models.CharField(max_length=30, choices=[
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('approved_with_observations', 'Aprobado con Observaciones'),
        ('rejected', 'Rechazado'),
    ], default='pending', verbose_name="Decisión de Aprobación")
    approval_observations = models.TextField(blank=True, verbose_name="Observaciones de Aprobación")
    corrections_required = models.TextField(blank=True, verbose_name="Correcciones Requeridas")
    rejection_reason = models.TextField(blank=True, verbose_name="Motivo de Rechazo")
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Aprobación")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Stats
    download_count = models.IntegerField(default=0, verbose_name="Número de Descargas")
    view_count = models.IntegerField(default=0, verbose_name="Número de Vistas")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Documento de Biblioteca'
        verbose_name_plural = 'Biblioteca de Documentos'
    
    def __str__(self):
        return f"{self.code} - {self.title}"


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


# ========================================
# FORUM MODULE - DISCUSSION FORUMS
# ========================================

class ForumCategory(models.Model):
    """
    Modelo para Categorías de Foro
    Agrupa discusiones por tema o área de interés
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de Categoría")
    description = models.TextField(blank=True, verbose_name="Descripción")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Icono (nombre de Lucide)")
    color = models.CharField(max_length=20, default='blue', verbose_name="Color de la categoría")
    is_active = models.BooleanField(default=True, verbose_name="Activa")
    order = models.IntegerField(default=0, verbose_name="Orden de visualización")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Categoría de Foro'
        verbose_name_plural = 'Categorías de Foro'
    
    def __str__(self):
        return self.name


class ForumPost(models.Model):
    """
    Modelo para Posts de Foro
    Publicaciones y respuestas en los foros de discusión
    """
    category = models.ForeignKey(
        ForumCategory, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name="Categoría"
    )
    title = models.CharField(max_length=200, verbose_name="Título")
    content = models.TextField(verbose_name="Contenido")
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='forum_posts',
        verbose_name="Autor"
    )
    parent_post = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies',
        verbose_name="Post Padre (si es respuesta)"
    )
    is_pinned = models.BooleanField(default=False, verbose_name="Fijado")
    is_locked = models.BooleanField(default=False, verbose_name="Bloqueado")
    views_count = models.IntegerField(default=0, verbose_name="Número de Vistas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
        verbose_name = 'Post de Foro'
        verbose_name_plural = 'Posts de Foro'
    
    def __str__(self):
        return self.title
    
    @property
    def replies_count(self):
        """Returns the number of replies to this post"""
        return self.replies.count()
