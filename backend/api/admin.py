from django.contrib import admin
from .models import (
    Department, UserProfile, Announcement, Document,
    CalendarEvent, LeaveRequest, Resource, ResourceReservation,
    Course, CourseEnrollment, KnowledgeArticle,
    ForumCategory, ForumPost, Suggestion,
    KPIDashboard, QuickLink, Project, Task
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin interface for Department model"""
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    ordering = ['name']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model"""
    list_display = ['user', 'department', 'position', 'phone', 'created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'position']
    list_filter = ['department', 'created_at']
    raw_id_fields = ['user']
    ordering = ['user__username']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    """Admin interface for Announcement model"""
    list_display = ['title', 'author', 'priority', 'is_active', 'published_at']
    search_fields = ['title', 'content']
    list_filter = ['priority', 'is_active', 'published_at']
    raw_id_fields = ['author']
    ordering = ['-published_at']
    date_hierarchy = 'published_at'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin interface for Document model"""
    list_display = ['title', 'category', 'department', 'uploaded_by', 'uploaded_at']
    search_fields = ['title', 'description']
    list_filter = ['category', 'department', 'uploaded_at']
    raw_id_fields = ['uploaded_by']
    ordering = ['-uploaded_at']
    date_hierarchy = 'uploaded_at'


# ========================================
# TIME AND RESOURCE MANAGEMENT ADMIN
# ========================================

@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    """Admin interface for CalendarEvent model"""
    list_display = ['title', 'event_type', 'start_date', 'end_date', 'created_by', 'all_day']
    search_fields = ['title', 'description', 'location']
    list_filter = ['event_type', 'all_day', 'start_date']
    raw_id_fields = ['created_by']
    filter_horizontal = ['attendees']
    ordering = ['start_date']
    date_hierarchy = 'start_date'


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    """Admin interface for LeaveRequest model"""
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status', 'approver']
    search_fields = ['employee__username', 'reason']
    list_filter = ['status', 'leave_type', 'start_date']
    raw_id_fields = ['employee', 'approver']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    """Admin interface for Resource model"""
    list_display = ['name', 'resource_type', 'capacity', 'location', 'is_available']
    search_fields = ['name', 'description', 'location']
    list_filter = ['resource_type', 'is_available']
    ordering = ['resource_type', 'name']


@admin.register(ResourceReservation)
class ResourceReservationAdmin(admin.ModelAdmin):
    """Admin interface for ResourceReservation model"""
    list_display = ['resource', 'user', 'start_time', 'end_time', 'status']
    search_fields = ['resource__name', 'user__username', 'purpose']
    list_filter = ['status', 'start_time']
    raw_id_fields = ['resource', 'user']
    ordering = ['start_time']
    date_hierarchy = 'start_time'


# ========================================
# TRAINING AND DEVELOPMENT ADMIN
# ========================================

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin interface for Course model"""
    list_display = ['title', 'instructor', 'duration_hours', 'status', 'is_mandatory', 'department']
    search_fields = ['title', 'description']
    list_filter = ['status', 'is_mandatory', 'department', 'certificate_available']
    raw_id_fields = ['instructor']
    ordering = ['-created_at']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for CourseEnrollment model"""
    list_display = ['student', 'course', 'status', 'progress_percentage', 'certificate_issued']
    search_fields = ['student__username', 'course__title']
    list_filter = ['status', 'certificate_issued', 'enrolled_at']
    raw_id_fields = ['course', 'student']
    ordering = ['-enrolled_at']


@admin.register(KnowledgeArticle)
class KnowledgeArticleAdmin(admin.ModelAdmin):
    """Admin interface for KnowledgeArticle model"""
    list_display = ['title', 'category', 'author', 'department', 'is_published', 'views_count']
    search_fields = ['title', 'content', 'tags']
    list_filter = ['category', 'is_published', 'department', 'created_at']
    raw_id_fields = ['author']
    ordering = ['-created_at']


# ========================================
# INTERACTION AND COLLABORATION ADMIN
# ========================================

@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    """Admin interface for ForumCategory model"""
    list_display = ['name', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['is_active']
    ordering = ['name']


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    """Admin interface for ForumPost model"""
    list_display = ['title', 'category', 'author', 'is_pinned', 'is_locked', 'views_count', 'created_at']
    search_fields = ['title', 'content']
    list_filter = ['category', 'is_pinned', 'is_locked', 'created_at']
    raw_id_fields = ['author', 'parent_post']
    ordering = ['-is_pinned', '-created_at']


@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    """Admin interface for Suggestion model"""
    list_display = ['title', 'author', 'is_anonymous', 'status', 'upvotes', 'created_at']
    search_fields = ['title', 'description']
    list_filter = ['status', 'is_anonymous', 'category', 'created_at']
    raw_id_fields = ['author', 'reviewer']
    ordering = ['-created_at']


# ========================================
# TOOLS AND DATA ADMIN
# ========================================

@admin.register(KPIDashboard)
class KPIDashboardAdmin(admin.ModelAdmin):
    """Admin interface for KPIDashboard model"""
    list_display = ['name', 'metric_name', 'current_value', 'target_value', 'department', 'is_active']
    search_fields = ['name', 'metric_name', 'description']
    list_filter = ['is_active', 'department', 'period']
    ordering = ['department', 'name']


@admin.register(QuickLink)
class QuickLinkAdmin(admin.ModelAdmin):
    """Admin interface for QuickLink model"""
    list_display = ['title', 'category', 'url', 'order', 'is_active', 'department']
    search_fields = ['title', 'description']
    list_filter = ['category', 'is_active', 'department']
    ordering = ['order', 'title']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model"""
    list_display = ['name', 'status', 'priority', 'project_manager', 'department', 'progress_percentage']
    search_fields = ['name', 'description']
    list_filter = ['status', 'priority', 'department', 'created_at']
    raw_id_fields = ['project_manager']
    filter_horizontal = ['team_members']
    ordering = ['-created_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Admin interface for Task model"""
    list_display = ['title', 'project', 'assigned_to', 'status', 'priority', 'due_date']
    search_fields = ['title', 'description']
    list_filter = ['status', 'priority', 'project', 'created_at']
    raw_id_fields = ['project', 'assigned_to', 'created_by']
    ordering = ['-priority', 'due_date']
