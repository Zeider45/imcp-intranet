from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department,
    # Business Process Models
    LibraryDocument,
    Policy, PolicyDistribution, TrainingPlan, TrainingProvider,
    TrainingQuotation, TrainingSession, TrainingAttendance,
    InternalVacancy, VacancyApplication, VacancyTransition,
    # Forum Models
    ForumCategory, ForumPost
)


class HealthCheckSerializer(serializers.Serializer):
    """Serializer for health check endpoint"""
    status = serializers.CharField()
    message = serializers.CharField()


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_active', 'date_joined', 'groups']
        read_only_fields = ['date_joined']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_groups(self, obj):
        # Return list of group names the user belongs to
        return list(obj.groups.values_list('name', flat=True))


# ========================================
# BUSINESS PROCESS SERIALIZERS - IMCP USE CASES
# ========================================

class LibraryDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for LibraryDocument model - Biblioteca de Documentos Unificada
    Unifica: Documentación Técnica, Elaboración de Docs y Aprobación de Docs
    """
    department_name = serializers.CharField(source='department.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = LibraryDocument
        fields = ['id', 'title', 'code', 'description', 'content', 'document_type',
                  'version', 'file', 'file_name', 'file_size', 'department', 'department_name',
                  'tags', 'author', 'author_name', 'status', 'submitted_at',
                  'approver', 'approver_name', 'approval_decision', 'approval_observations',
                  'corrections_required', 'rejection_reason', 'approved_at',
                  'download_count', 'view_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'download_count', 'view_count']
    
    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            try:
                return obj.file.size
            except Exception:
                return None
        return None


class PolicySerializer(serializers.ModelSerializer):
    """Serializer for Policy model - Establecer Políticas"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    auditor_reviewer_name = serializers.CharField(source='auditor_reviewer.get_full_name', read_only=True)
    peer_reviewer_name = serializers.CharField(source='peer_reviewer.get_full_name', read_only=True)
    replaces_policy_code = serializers.CharField(source='replaces_policy.code', read_only=True)
    distribution_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Policy
        fields = ['id', 'title', 'code', 'description', 'content', 'department', 'department_name',
                  'status', 'origin', 'origin_justification', 'created_by', 'created_by_name',
                  'auditor_reviewer', 'auditor_reviewer_name', 'peer_reviewer', 'peer_reviewer_name',
                  'review_meeting_date', 'review_meeting_notes', 'board_approval_date',
                  'board_approved', 'effective_date', 'expiration_date', 'version',
                  'replaces_policy', 'replaces_policy_code', 'file', 'published_at',
                  'distribution_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_distribution_count(self, obj):
        return obj.distributions.count()


class PolicyDistributionSerializer(serializers.ModelSerializer):
    """Serializer for PolicyDistribution model"""
    policy_code = serializers.CharField(source='policy.code', read_only=True)
    policy_title = serializers.CharField(source='policy.title', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    distributed_by_name = serializers.CharField(source='distributed_by.get_full_name', read_only=True)
    
    class Meta:
        model = PolicyDistribution
        fields = ['id', 'policy', 'policy_code', 'policy_title', 'recipient', 'recipient_name',
                  'distributed_by', 'distributed_by_name', 'distributed_at', 'acknowledged',
                  'acknowledged_at']
        read_only_fields = ['distributed_at']


class TrainingPlanSerializer(serializers.ModelSerializer):
    """Serializer for TrainingPlan model - Planificar Capacitaciones"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_manager_name = serializers.CharField(source='assigned_manager.get_full_name', read_only=True)
    session_count = serializers.SerializerMethodField()
    quotation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingPlan
        fields = ['id', 'title', 'description', 'topics', 'origin', 'scope', 'modality',
                  'duration_hours', 'status', 'department', 'department_name', 'created_by',
                  'created_by_name', 'assigned_manager', 'assigned_manager_name', 'budget_amount',
                  'budget_approved', 'instructor_profile', 'planned_start_date', 'planned_end_date',
                  'session_count', 'quotation_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_session_count(self, obj):
        return obj.sessions.count()
    
    def get_quotation_count(self, obj):
        return obj.quotations.count()


class TrainingProviderSerializer(serializers.ModelSerializer):
    """Serializer for TrainingProvider model"""
    quotation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingProvider
        fields = ['id', 'name', 'contact_name', 'email', 'phone', 'specialties', 'rating',
                  'notes', 'is_active', 'quotation_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_quotation_count(self, obj):
        return obj.quotations.count()


class TrainingQuotationSerializer(serializers.ModelSerializer):
    """Serializer for TrainingQuotation model"""
    training_plan_title = serializers.CharField(source='training_plan.title', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    
    class Meta:
        model = TrainingQuotation
        fields = ['id', 'training_plan', 'training_plan_title', 'provider', 'provider_name',
                  'status', 'temario', 'duration_hours', 'cost', 'instructor_name',
                  'instructor_profile', 'available_dates', 'validity_date', 'received_at', 'notes']
        read_only_fields = ['received_at']


class TrainingSessionSerializer(serializers.ModelSerializer):
    """Serializer for TrainingSession model - Asisten a Capacitaciones"""
    training_plan_title = serializers.CharField(source='training_plan.title', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    attendance_count = serializers.SerializerMethodField()
    confirmed_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = ['id', 'training_plan', 'training_plan_title', 'title', 'description',
                  'instructor_name', 'provider', 'provider_name', 'status', 'location',
                  'start_datetime', 'end_datetime', 'materials_required', 'objectives',
                  'max_participants', 'confirmation_deadline', 'attendance_count',
                  'confirmed_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_attendance_count(self, obj):
        return obj.attendances.count()
    
    def get_confirmed_count(self, obj):
        return obj.attendances.filter(confirmation_status='confirmed').count()


class TrainingAttendanceSerializer(serializers.ModelSerializer):
    """Serializer for TrainingAttendance model"""
    session_title = serializers.CharField(source='session.title', read_only=True)
    session_date = serializers.DateTimeField(source='session.start_datetime', read_only=True)
    analyst_name = serializers.CharField(source='analyst.get_full_name', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    
    class Meta:
        model = TrainingAttendance
        fields = ['id', 'session', 'session_title', 'session_date', 'analyst', 'analyst_name',
                  'invited_by', 'invited_by_name', 'confirmation_status', 'confirmation_date',
                  'decline_reason', 'justification_document', 'attendance_status',
                  'arrival_time', 'departure_time', 'attendance_signature', 'evaluation_score',
                  'certificate_issued', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class InternalVacancySerializer(serializers.ModelSerializer):
    """Serializer for InternalVacancy model - Disponibilidad de Vacante"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    hr_manager_name = serializers.CharField(source='hr_manager.get_full_name', read_only=True)
    application_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InternalVacancy
        fields = ['id', 'title', 'department', 'department_name', 'description',
                  'responsibilities', 'technical_requirements', 'competencies',
                  'experience_required', 'specific_knowledge', 'salary_range_min',
                  'salary_range_max', 'status', 'requested_by', 'requested_by_name',
                  'hr_manager', 'hr_manager_name', 'authorization_justification',
                  'budget_approved', 'required_date', 'application_deadline',
                  'published_at', 'application_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_application_count(self, obj):
        return obj.applications.count()


class VacancyApplicationSerializer(serializers.ModelSerializer):
    """Serializer for VacancyApplication model"""
    vacancy_title = serializers.CharField(source='vacancy.title', read_only=True)
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    current_manager_name = serializers.CharField(source='current_manager.get_full_name', read_only=True)
    
    class Meta:
        model = VacancyApplication
        fields = ['id', 'vacancy', 'vacancy_title', 'applicant', 'applicant_name',
                  'current_manager', 'current_manager_name', 'current_manager_authorization',
                  'status', 'cover_letter', 'cv_file', 'certificates_file',
                  'performance_evaluations', 'technical_score', 'experience_score',
                  'performance_score', 'potential_score', 'overall_ranking',
                  'interview_date', 'interview_notes', 'hr_notes', 'rejection_reason',
                  'applied_at', 'updated_at']
        read_only_fields = ['applied_at', 'updated_at']


class VacancyTransitionSerializer(serializers.ModelSerializer):
    """Serializer for VacancyTransition model"""
    applicant_name = serializers.CharField(source='application.applicant.get_full_name', read_only=True)
    previous_department_name = serializers.CharField(source='previous_department.name', read_only=True)
    new_department_name = serializers.CharField(source='new_department.name', read_only=True)
    hr_coordinator_name = serializers.CharField(source='hr_coordinator.get_full_name', read_only=True)
    
    class Meta:
        model = VacancyTransition
        fields = ['id', 'application', 'applicant_name', 'previous_department',
                  'previous_department_name', 'new_department', 'new_department_name',
                  'previous_position', 'new_position', 'status', 'transition_date',
                  'hr_coordinator', 'hr_coordinator_name', 'directory_updated',
                  'system_permissions_updated', 'file_updated', 'notes',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ========================================
# FORUM SERIALIZERS
# ========================================

class ForumCategorySerializer(serializers.ModelSerializer):
    """Serializer for ForumCategory model"""
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'is_active', 
                  'order', 'posts_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(parent_post__isnull=True).count()


class ForumPostSerializer(serializers.ModelSerializer):
    """Serializer for ForumPost model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.SerializerMethodField()
    author_username = serializers.CharField(source='author.username', read_only=True)
    replies_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumPost
        fields = ['id', 'category', 'category_name', 'title', 'content', 'image',
                  'author', 'author_name', 'author_username', 'parent_post', 
                  'is_pinned', 'is_locked', 'views_count', 'likes_count', 
                  'user_has_liked', 'replies_count',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'views_count', 'likes_count', 'author']
    
    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username
    
    def get_replies_count(self, obj):
        return obj.replies.count()
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.liked_by.filter(id=request.user.id).exists()
        return False
