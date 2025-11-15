from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Department, UserProfile, Announcement, Document,
    CalendarEvent, LeaveRequest, Resource, ResourceReservation,
    Course, CourseEnrollment, KnowledgeArticle,
    ForumCategory, ForumPost, Suggestion,
    KPIDashboard, QuickLink, Project, Task
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
