from django.contrib import admin
from .models import Department, UserProfile, Announcement, Document


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
