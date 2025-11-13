from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, UserProfile, Announcement, Document
from .serializers import (
    HealthCheckSerializer,
    DepartmentSerializer,
    UserProfileSerializer,
    AnnouncementSerializer,
    DocumentSerializer
)


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint to verify API is working
    """
    data = {
        'status': 'ok',
        'message': 'API is running successfully'
    }
    serializer = HealthCheckSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def welcome(request):
    """
    Welcome endpoint for the intranet
    """
    return Response({
        'message': 'Bienvenido a la Intranet IMCP',
        'version': '1.0.0',
        'description': 'Sistema de intranet con Django y Next.js'
    }, status=status.HTTP_200_OK)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department model
    Provides CRUD operations for departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserProfile model
    Provides CRUD operations for user profiles
    """
    queryset = UserProfile.objects.select_related('user', 'department').all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'user__is_active']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'position']
    ordering_fields = ['user__username', 'created_at']
    ordering = ['user__username']
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        if request.user.is_authenticated:
            try:
                profile = UserProfile.objects.select_related('user', 'department').get(user=request.user)
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            except UserProfile.DoesNotExist:
                return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Announcement model
    Provides CRUD operations for announcements
    """
    queryset = Announcement.objects.select_related('author').all()
    serializer_class = AnnouncementSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['priority', 'is_active', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['published_at', 'priority']
    ordering = ['-published_at']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active announcements"""
        active_announcements = self.queryset.filter(is_active=True)
        page = self.paginate_queryset(active_announcements)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(active_announcements, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Document model
    Provides CRUD operations for documents
    """
    queryset = Document.objects.select_related('uploaded_by', 'department').all()
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'department', 'uploaded_by']
    search_fields = ['title', 'description']
    ordering_fields = ['uploaded_at', 'title']
    ordering = ['-uploaded_at']
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently uploaded documents"""
        recent_docs = self.queryset[:10]
        serializer = self.get_serializer(recent_docs, many=True)
        return Response(serializer.data)

