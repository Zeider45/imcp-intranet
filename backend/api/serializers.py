from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, UserProfile, Announcement, Document


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
