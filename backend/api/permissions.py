"""
Custom permissions for role-based authorization.
Roles are extracted from Active Directory groups and mapped to Django groups.
"""
from rest_framework import permissions
from django.contrib.auth.models import Group


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin users have full access.
    Other authenticated users have read-only access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_staff or request.user.is_superuser


class IsDepartmentManager(permissions.BasePermission):
    """
    Department managers can manage resources in their department.
    Checks if user belongs to 'Department_Managers' AD group.
    Allows read access for authenticated users.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow read operations for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'Department_Managers',
            'Gerentes_Departamento'
        ]).exists()


class IsHRManager(permissions.BasePermission):
    """
    HR managers can manage employee-related resources.
    Checks if user belongs to 'HR_Managers' AD group.
    Allows read access for authenticated users.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow read operations for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'HR_Managers',
            'Gerentes_RH'
        ]).exists()


class CanManageAnnouncements(permissions.BasePermission):
    """
    Users who can create and manage announcements.
    Checks if user belongs to 'Communications' or 'Department_Managers' AD groups.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'Communications',
            'Department_Managers',
            'Comunicaciones',
            'Gerentes_Departamento'
        ]).exists()


class CanManageDocuments(permissions.BasePermission):
    """
    Users who can upload and manage documents.
    Checks if user belongs to 'Document_Managers' or 'Department_Managers' AD groups.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'Document_Managers',
            'Department_Managers',
            'Administradores_Documentos',
            'Gerentes_Departamento'
        ]).exists()


class CanApproveLeaveRequests(permissions.BasePermission):
    """
    Users who can approve leave requests.
    Checks if user belongs to 'HR_Managers' or 'Department_Managers' AD groups.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Only check for specific approval actions
        if view.action in ['approve', 'reject']:
            return request.user.groups.filter(name__in=[
                'HR_Managers',
                'Department_Managers',
                'Gerentes_RH',
                'Gerentes_Departamento'
            ]).exists()
        
        return True


class CanManageResources(permissions.BasePermission):
    """
    Users who can manage bookable resources.
    Checks if user belongs to 'Resource_Managers' or 'Facilities' AD groups.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'Resource_Managers',
            'Facilities',
            'Administradores_Recursos',
            'Instalaciones'
        ]).exists()


class CanManageCourses(permissions.BasePermission):
    """
    Users who can create and manage training courses.
    Checks if user belongs to 'Training_Managers' or 'HR_Managers' AD groups.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'Training_Managers',
            'HR_Managers',
            'Administradores_Capacitacion',
            'Gerentes_RH'
        ]).exists()


class CanManageProjects(permissions.BasePermission):
    """
    Users who can create and manage projects.
    Checks if user belongs to 'Project_Managers' or 'Department_Managers' AD groups.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'Project_Managers',
            'Department_Managers',
            'Gerentes_Proyecto',
            'Gerentes_Departamento'
        ]).exists()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Check various possible owner fields
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'uploaded_by'):
            return obj.uploaded_by == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'employee'):
            return obj.employee == request.user
        
        return False


class IsOwnerOrManager(permissions.BasePermission):
    """
    Object-level permission for owners and managers.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Check if user is owner
        is_owner = False
        if hasattr(obj, 'author'):
            is_owner = obj.author == request.user
        elif hasattr(obj, 'uploaded_by'):
            is_owner = obj.uploaded_by == request.user
        elif hasattr(obj, 'created_by'):
            is_owner = obj.created_by == request.user
        elif hasattr(obj, 'user'):
            is_owner = obj.user == request.user
        elif hasattr(obj, 'employee'):
            is_owner = obj.employee == request.user
        
        if is_owner:
            return True
        
        # Check if user is a manager
        is_manager = request.user.groups.filter(name__in=[
            'Department_Managers',
            'HR_Managers',
            'Project_Managers',
            'Gerentes_Departamento',
            'Gerentes_RH',
            'Gerentes_Proyecto'
        ]).exists()
        
        return is_manager
