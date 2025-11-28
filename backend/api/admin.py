from django.contrib import admin
from .models import (
    Department,
    # Business Process Models
    LibraryDocument,
    Policy, PolicyDistribution, TrainingPlan, TrainingProvider,
    TrainingQuotation, TrainingSession, TrainingAttendance,
    InternalVacancy, VacancyApplication, VacancyTransition
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin interface for Department model"""
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']
    ordering = ['name']


# ========================================
# BUSINESS PROCESS ADMIN - IMCP USE CASES
# ========================================

@admin.register(LibraryDocument)
class LibraryDocumentAdmin(admin.ModelAdmin):
    """Admin interface for LibraryDocument model - Biblioteca de Documentos Unificada"""
    list_display = ['code', 'title', 'document_type', 'status', 'department', 'author', 'approval_decision']
    search_fields = ['code', 'title', 'description', 'content', 'tags']
    list_filter = ['document_type', 'status', 'department', 'approval_decision']
    raw_id_fields = ['author', 'approver']
    ordering = ['-created_at']
    fieldsets = (
        ('Información Básica', {
            'fields': ('title', 'code', 'description', 'content', 'document_type', 'version')
        }),
        ('Archivo y Organización', {
            'fields': ('file', 'department', 'tags')
        }),
        ('Autoría', {
            'fields': ('author',)
        }),
        ('Estado y Workflow', {
            'fields': ('status', 'submitted_at')
        }),
        ('Aprobación', {
            'fields': ('approver', 'approval_decision', 'approval_observations', 
                      'corrections_required', 'rejection_reason', 'approved_at')
        }),
        ('Estadísticas', {
            'fields': ('download_count', 'view_count')
        }),
    )


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    """Admin interface for Policy model"""
    list_display = ['code', 'title', 'status', 'origin', 'created_by', 'board_approved']
    search_fields = ['code', 'title', 'description']
    list_filter = ['status', 'origin', 'board_approved', 'department']
    raw_id_fields = ['created_by', 'auditor_reviewer', 'peer_reviewer']
    ordering = ['-created_at']


@admin.register(PolicyDistribution)
class PolicyDistributionAdmin(admin.ModelAdmin):
    """Admin interface for PolicyDistribution model"""
    list_display = ['policy', 'recipient', 'distributed_by', 'acknowledged', 'distributed_at']
    search_fields = ['policy__code', 'policy__title', 'recipient__username']
    list_filter = ['acknowledged', 'distributed_at']
    raw_id_fields = ['policy', 'recipient', 'distributed_by']
    ordering = ['-distributed_at']


@admin.register(TrainingPlan)
class TrainingPlanAdmin(admin.ModelAdmin):
    """Admin interface for TrainingPlan model"""
    list_display = ['title', 'origin', 'scope', 'status', 'budget_approved', 'created_by']
    search_fields = ['title', 'description', 'topics']
    list_filter = ['status', 'origin', 'scope', 'modality', 'budget_approved']
    raw_id_fields = ['created_by', 'assigned_manager']
    ordering = ['-created_at']


@admin.register(TrainingProvider)
class TrainingProviderAdmin(admin.ModelAdmin):
    """Admin interface for TrainingProvider model"""
    list_display = ['name', 'contact_name', 'email', 'rating', 'is_active']
    search_fields = ['name', 'contact_name', 'specialties']
    list_filter = ['is_active', 'rating']
    ordering = ['name']


@admin.register(TrainingQuotation)
class TrainingQuotationAdmin(admin.ModelAdmin):
    """Admin interface for TrainingQuotation model"""
    list_display = ['training_plan', 'provider', 'status', 'cost', 'received_at']
    search_fields = ['training_plan__title', 'provider__name']
    list_filter = ['status', 'received_at']
    raw_id_fields = ['training_plan', 'provider']
    ordering = ['-received_at']


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    """Admin interface for TrainingSession model"""
    list_display = ['title', 'training_plan', 'instructor_name', 'status', 'start_datetime']
    search_fields = ['title', 'instructor_name', 'training_plan__title']
    list_filter = ['status', 'start_datetime']
    raw_id_fields = ['training_plan', 'provider']
    ordering = ['start_datetime']


@admin.register(TrainingAttendance)
class TrainingAttendanceAdmin(admin.ModelAdmin):
    """Admin interface for TrainingAttendance model"""
    list_display = ['session', 'analyst', 'confirmation_status', 'attendance_status', 'certificate_issued']
    search_fields = ['session__title', 'analyst__username']
    list_filter = ['confirmation_status', 'attendance_status', 'certificate_issued']
    raw_id_fields = ['session', 'analyst', 'invited_by']
    ordering = ['-session__start_datetime']


@admin.register(InternalVacancy)
class InternalVacancyAdmin(admin.ModelAdmin):
    """Admin interface for InternalVacancy model"""
    list_display = ['title', 'department', 'status', 'requested_by', 'budget_approved']
    search_fields = ['title', 'description']
    list_filter = ['status', 'department', 'budget_approved']
    raw_id_fields = ['requested_by', 'hr_manager']
    ordering = ['-created_at']


@admin.register(VacancyApplication)
class VacancyApplicationAdmin(admin.ModelAdmin):
    """Admin interface for VacancyApplication model"""
    list_display = ['vacancy', 'applicant', 'status', 'overall_ranking', 'applied_at']
    search_fields = ['vacancy__title', 'applicant__username']
    list_filter = ['status', 'current_manager_authorization']
    raw_id_fields = ['vacancy', 'applicant', 'current_manager']
    ordering = ['-applied_at']


@admin.register(VacancyTransition)
class VacancyTransitionAdmin(admin.ModelAdmin):
    """Admin interface for VacancyTransition model"""
    list_display = ['application', 'previous_position', 'new_position', 'status', 'transition_date']
    search_fields = ['application__applicant__username', 'previous_position', 'new_position']
    list_filter = ['status', 'directory_updated', 'system_permissions_updated', 'file_updated']
    raw_id_fields = ['application', 'hr_coordinator']
    ordering = ['-created_at']
