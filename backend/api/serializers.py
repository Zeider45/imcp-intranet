from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department, UserProfile, Announcement, Document,
    CalendarEvent, LeaveRequest, Resource, ResourceReservation,
    Course, CourseEnrollment, KnowledgeArticle,
    ForumCategory, ForumPost, Suggestion,
    KPIDashboard, QuickLink, Project, Task,
    # Business Process Models
    TechnicalDocument, DocumentLoan, DocumentDraft, DocumentApproval,
    Policy, PolicyDistribution, TrainingPlan, TrainingProvider,
    TrainingQuotation, TrainingSession, TrainingAttendance,
    InternalVacancy, VacancyApplication, VacancyTransition
)


class HealthCheckSerializer(serializers.Serializer):
    """Serializer for health check endpoint"""
    status = serializers.CharField()
    message = serializers.CharField()


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'employee_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_count(self, obj):
        return obj.employees.count()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'department', 'department_name', 'phone', 'position', 
                  'bio', 'avatar', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for Announcement model"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'author', 'author_name', 'author_username',
                  'priority', 'is_active', 'published_at', 'updated_at']
        read_only_fields = ['published_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'file_url', 'file_size',
                  'category', 'department', 'department_name', 'uploaded_by', 
                  'uploaded_by_name', 'uploaded_at', 'updated_at']
        read_only_fields = ['uploaded_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None


# ========================================
# TIME AND RESOURCE MANAGEMENT SERIALIZERS
# ========================================

class CalendarEventSerializer(serializers.ModelSerializer):
    """Serializer for CalendarEvent model"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    attendee_names = serializers.SerializerMethodField()
    
    class Meta:
        model = CalendarEvent
        fields = ['id', 'title', 'description', 'event_type', 'start_date', 'end_date',
                  'all_day', 'location', 'created_by', 'created_by_name', 'attendees',
                  'attendee_names', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_attendee_names(self, obj):
        return [attendee.get_full_name() or attendee.username for attendee in obj.attendees.all()]


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Serializer for LeaveRequest model"""
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = ['id', 'employee', 'employee_name', 'leave_type', 'start_date', 'end_date',
                  'reason', 'status', 'approver', 'approver_name', 'approval_comment',
                  'approved_at', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for Resource model"""
    
    class Meta:
        model = Resource
        fields = ['id', 'name', 'resource_type', 'description', 'capacity', 'location',
                  'is_available', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ResourceReservationSerializer(serializers.ModelSerializer):
    """Serializer for ResourceReservation model"""
    resource_name = serializers.CharField(source='resource.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ResourceReservation
        fields = ['id', 'resource', 'resource_name', 'user', 'user_name', 'start_time',
                  'end_time', 'purpose', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ========================================
# TRAINING AND DEVELOPMENT SERIALIZERS
# ========================================

class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'content', 'instructor', 'instructor_name',
                  'duration_hours', 'status', 'is_mandatory', 'department', 'department_name',
                  'certificate_available', 'enrollment_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_enrollment_count(self, obj):
        return obj.enrollments.count()


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for CourseEnrollment model"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = CourseEnrollment
        fields = ['id', 'course', 'course_title', 'student', 'student_name', 'enrolled_at',
                  'status', 'progress_percentage', 'completed_at', 'certificate_issued',
                  'certificate_issued_at']
        read_only_fields = ['enrolled_at']


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    """Serializer for KnowledgeArticle model"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = KnowledgeArticle
        fields = ['id', 'title', 'content', 'category', 'author', 'author_name',
                  'department', 'department_name', 'tags', 'is_published', 'views_count',
                  'helpful_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'views_count', 'helpful_count']


# ========================================
# INTERACTION AND COLLABORATION SERIALIZERS
# ========================================

class ForumCategorySerializer(serializers.ModelSerializer):
    """Serializer for ForumCategory model"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumCategory
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'post_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_post_count(self, obj):
        return obj.posts.filter(parent_post__isnull=True).count()


class ForumPostSerializer(serializers.ModelSerializer):
    """Serializer for ForumPost model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumPost
        fields = ['id', 'category', 'category_name', 'title', 'content', 'author',
                  'author_name', 'parent_post', 'is_pinned', 'is_locked', 'views_count',
                  'reply_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'views_count']
    
    def get_reply_count(self, obj):
        return obj.replies.count()


class SuggestionSerializer(serializers.ModelSerializer):
    """Serializer for Suggestion model"""
    author_name = serializers.SerializerMethodField()
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = Suggestion
        fields = ['id', 'title', 'description', 'author', 'author_name', 'is_anonymous',
                  'status', 'category', 'reviewer', 'reviewer_name', 'review_comment',
                  'reviewed_at', 'upvotes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'upvotes']
    
    def get_author_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.author.get_full_name() if obj.author else "Unknown"


# ========================================
# TOOLS AND DATA SERIALIZERS
# ========================================

class KPIDashboardSerializer(serializers.ModelSerializer):
    """Serializer for KPIDashboard model"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    achievement_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = KPIDashboard
        fields = ['id', 'name', 'description', 'metric_name', 'current_value', 'target_value',
                  'unit', 'department', 'department_name', 'period', 'is_active',
                  'achievement_percentage', 'last_updated', 'created_at']
        read_only_fields = ['last_updated', 'created_at']
    
    def get_achievement_percentage(self, obj):
        if obj.target_value and obj.target_value > 0:
            return round((float(obj.current_value) / float(obj.target_value)) * 100, 2)
        return None


class QuickLinkSerializer(serializers.ModelSerializer):
    """Serializer for QuickLink model"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = QuickLink
        fields = ['id', 'title', 'url', 'description', 'category', 'icon', 'is_active',
                  'order', 'department', 'department_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    project_manager_name = serializers.CharField(source='project_manager.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    team_member_names = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'priority', 'project_manager',
                  'project_manager_name', 'team_members', 'team_member_names', 'department',
                  'department_name', 'start_date', 'end_date', 'progress_percentage',
                  'task_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_team_member_names(self, obj):
        return [member.get_full_name() or member.username for member in obj.team_members.all()]
    
    def get_task_count(self, obj):
        return obj.tasks.count()


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    project_name = serializers.CharField(source='project.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'project_name', 'assigned_to',
                  'assigned_to_name', 'created_by', 'created_by_name', 'status', 'priority',
                  'due_date', 'completed_at', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ========================================
# BUSINESS PROCESS SERIALIZERS - IMCP USE CASES
# ========================================

class TechnicalDocumentSerializer(serializers.ModelSerializer):
    """Serializer for TechnicalDocument model - Consulta Documentación"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    authorized_user_names = serializers.SerializerMethodField()
    loan_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TechnicalDocument
        fields = ['id', 'title', 'code', 'description', 'document_type', 'physical_location',
                  'department', 'department_name', 'version', 'status', 'authorized_users',
                  'authorized_user_names', 'file', 'created_by', 'created_by_name',
                  'loan_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_authorized_user_names(self, obj):
        return [user.get_full_name() or user.username for user in obj.authorized_users.all()]
    
    def get_loan_count(self, obj):
        return obj.loans.count()


class DocumentLoanSerializer(serializers.ModelSerializer):
    """Serializer for DocumentLoan model - Bitácora de Préstamos"""
    document_code = serializers.CharField(source='document.code', read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)
    analyst_name = serializers.CharField(source='analyst.get_full_name', read_only=True)
    assistant_name = serializers.CharField(source='assistant.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentLoan
        fields = ['id', 'document', 'document_code', 'document_title', 'analyst', 'analyst_name',
                  'assistant', 'assistant_name', 'status', 'request_date', 'delivery_date',
                  'expected_return_date', 'actual_return_date', 'purpose', 'notes',
                  'analyst_signature', 'return_verified']
        read_only_fields = ['request_date']


class DocumentDraftSerializer(serializers.ModelSerializer):
    """Serializer for DocumentDraft model - Realiza Documentación"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    approval_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentDraft
        fields = ['id', 'title', 'document_type', 'content', 'system_or_functionality',
                  'author', 'author_name', 'status', 'version', 'department', 'department_name',
                  'file', 'submitted_at', 'manager', 'manager_name', 'approval_count',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_approval_count(self, obj):
        return obj.approvals.count()


class DocumentApprovalSerializer(serializers.ModelSerializer):
    """Serializer for DocumentApproval model - Aprobación de Documentación"""
    document_draft_title = serializers.CharField(source='document_draft.title', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    assistant_name = serializers.CharField(source='assistant.get_full_name', read_only=True)
    
    class Meta:
        model = DocumentApproval
        fields = ['id', 'document_draft', 'document_draft_title', 'reviewer', 'reviewer_name',
                  'assistant', 'assistant_name', 'decision', 'technical_observations',
                  'corrections_required', 'correction_deadline', 'rejection_reason',
                  'approved_at', 'validity_date', 'requires_board_approval', 'board_approved',
                  'reviewer_signature', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


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
