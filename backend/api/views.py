from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django_filters.rest_framework import DjangoFilterBackend
from .permissions import (
    IsAdminOrReadOnly,
    IsDepartmentManager,
    IsHRManager,
    CanManageAnnouncements,
    CanManageDocuments,
    CanApproveLeaveRequests,
    CanManageResources,
    CanManageCourses,
    CanManageProjects,
    IsOwnerOrReadOnly,
    IsOwnerOrManager
)
from .models import (
    Department, UserProfile, Announcement, Document,
    CalendarEvent, LeaveRequest, Resource, ResourceReservation,
    Course, CourseEnrollment, KnowledgeArticle,
    ForumCategory, ForumPost, Suggestion,
    KPIDashboard, QuickLink, Project, Task
)
from .serializers import (
    HealthCheckSerializer,
    DepartmentSerializer,
    UserProfileSerializer,
    AnnouncementSerializer,
    DocumentSerializer,
    CalendarEventSerializer,
    LeaveRequestSerializer,
    ResourceSerializer,
    ResourceReservationSerializer,
    CourseSerializer,
    CourseEnrollmentSerializer,
    KnowledgeArticleSerializer,
    ForumCategorySerializer,
    ForumPostSerializer,
    SuggestionSerializer,
    KPIDashboardSerializer,
    QuickLinkSerializer,
    ProjectSerializer,
    TaskSerializer
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


@api_view(['POST'])
def ldap_login(request):
    """
    Authenticate user via Active Directory/LDAP
    Expects: username, password
    Returns: user info and authentication token
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate against configured backends (including LDAP)
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        # User authenticated successfully
        login(request, user)
        
        # Get or create auth token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Get user profile if exists
        try:
            profile = UserProfile.objects.select_related('department').get(user=user)
            profile_data = {
                'department': profile.department.name if profile.department else None,
                'position': profile.position,
                'phone': profile.phone,
            }
        except UserProfile.DoesNotExist:
            profile_data = None
        
        # Get user groups for role-based authorization
        user_groups = list(user.groups.values_list('name', flat=True))
        
        return Response({
            'success': True,
            'message': 'Authentication successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'groups': user_groups,
            },
            'profile': profile_data,
            'token': token.key,
        }, status=status.HTTP_200_OK)
    else:
        # Authentication failed
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
def ldap_logout(request):
    """
    Logout current user
    """
    if request.user.is_authenticated:
        # Delete auth token if exists
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        
        logout(request)
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'error': 'No active session'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
def current_user(request):
    """
    Get current authenticated user information
    """
    if request.user.is_authenticated:
        # Get user profile if exists
        try:
            profile = UserProfile.objects.select_related('department').get(user=request.user)
            profile_data = {
                'department': profile.department.name if profile.department else None,
                'position': profile.position,
                'phone': profile.phone,
                'bio': profile.bio,
            }
        except UserProfile.DoesNotExist:
            profile_data = None
        
        # Get user groups for role-based authorization
        user_groups = list(request.user.groups.values_list('name', flat=True))
        
        return Response({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
                'groups': user_groups,
            },
            'profile': profile_data,
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'authenticated': False},
            status=status.HTTP_200_OK
        )


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department model
    Provides CRUD operations for departments
    Permissions: Authenticated users can view, only HR/Department Managers can modify
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsDepartmentManager | IsHRManager]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserProfile model
    Provides CRUD operations for user profiles
    Permissions: Authenticated users can view, only HR Managers can create/modify others
    """
    queryset = UserProfile.objects.select_related('user', 'department').all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsOwnerOrManager]
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
    Permissions: All can view, Communications/Managers can create/edit
    """
    queryset = Announcement.objects.select_related('author').all()
    serializer_class = AnnouncementSerializer
    permission_classes = [CanManageAnnouncements]
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
    Permissions: All can view, Document Managers can upload/modify
    """
    queryset = Document.objects.select_related('uploaded_by', 'department').all()
    serializer_class = DocumentSerializer
    permission_classes = [CanManageDocuments]
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


# ========================================
# TIME AND RESOURCE MANAGEMENT VIEWSETS
# ========================================

class CalendarEventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CalendarEvent model
    Permissions: All can view, owner and managers can modify
    """
    queryset = CalendarEvent.objects.select_related('created_by').prefetch_related('attendees').all()
    serializer_class = CalendarEventSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'created_by', 'all_day']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['start_date']
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        from django.utils import timezone
        upcoming_events = self.queryset.filter(start_date__gte=timezone.now())[:10]
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LeaveRequest model
    Permissions: Employees can create, HR/Managers can approve
    """
    queryset = LeaveRequest.objects.select_related('employee', 'approver').all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [CanApproveLeaveRequests]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'leave_type', 'employee', 'approver']
    search_fields = ['employee__username', 'employee__first_name', 'employee__last_name', 'reason']
    ordering_fields = ['created_at', 'start_date']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending leave requests"""
        pending_requests = self.queryset.filter(status='pending')
        page = self.paginate_queryset(pending_requests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.approver = request.user if request.user.is_authenticated else None
        leave_request.approval_comment = request.data.get('comment', '')
        from django.utils import timezone
        leave_request.approved_at = timezone.now()
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.approver = request.user if request.user.is_authenticated else None
        leave_request.approval_comment = request.data.get('comment', '')
        from django.utils import timezone
        leave_request.approved_at = timezone.now()
        leave_request.save()
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)


class ResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Resource model
    Permissions: All can view, Resource Managers can create/modify
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [CanManageResources]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['resource_type', 'is_available']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['name', 'resource_type']
    ordering = ['resource_type', 'name']
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available resources"""
        available_resources = self.queryset.filter(is_available=True)
        page = self.paginate_queryset(available_resources)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(available_resources, many=True)
        return Response(serializer.data)


class ResourceReservationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ResourceReservation model
    Permissions: All authenticated users can reserve, owner can modify their reservations
    """
    queryset = ResourceReservation.objects.select_related('resource', 'user').all()
    serializer_class = ResourceReservationSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'resource', 'user']
    search_fields = ['resource__name', 'user__username', 'purpose']
    ordering_fields = ['start_time', 'created_at']
    ordering = ['start_time']


# ========================================
# TRAINING AND DEVELOPMENT VIEWSETS
# ========================================

class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course model
    Permissions: All can view, Training Managers can create/modify
    """
    queryset = Course.objects.select_related('instructor', 'department').all()
    serializer_class = CourseSerializer
    permission_classes = [CanManageCourses]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'is_mandatory', 'department', 'instructor']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get published courses"""
        published_courses = self.queryset.filter(status='published')
        page = self.paginate_queryset(published_courses)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(published_courses, many=True)
        return Response(serializer.data)


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CourseEnrollment model
    Permissions: Students can enroll, owners can view their enrollments
    """
    queryset = CourseEnrollment.objects.select_related('course', 'student').all()
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'course', 'student', 'certificate_issued']
    search_fields = ['course__title', 'student__username']
    ordering_fields = ['enrolled_at', 'progress_percentage']
    ordering = ['-enrolled_at']


class KnowledgeArticleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for KnowledgeArticle model
    Permissions: All can view, author and managers can modify
    """
    queryset = KnowledgeArticle.objects.select_related('author', 'department').all()
    serializer_class = KnowledgeArticleSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_published', 'department', 'author']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'views_count', 'helpful_count']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular articles"""
        popular_articles = self.queryset.filter(is_published=True).order_by('-views_count')[:10]
        serializer = self.get_serializer(popular_articles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark article as helpful"""
        article = self.get_object()
        article.helpful_count += 1
        article.save()
        serializer = self.get_serializer(article)
        return Response(serializer.data)


# ========================================
# INTERACTION AND COLLABORATION VIEWSETS
# ========================================

class ForumCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ForumCategory model
    Permissions: All can view, managers can create/modify
    """
    queryset = ForumCategory.objects.all()
    serializer_class = ForumCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ForumPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ForumPost model
    Permissions: All can view and post, owner can modify their posts
    """
    queryset = ForumPost.objects.select_related('category', 'author', 'parent_post').all()
    serializer_class = ForumPostSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'is_pinned', 'is_locked', 'parent_post']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'views_count']
    ordering = ['-is_pinned', '-created_at']
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count"""
        post = self.get_object()
        post.views_count += 1
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)


class SuggestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Suggestion model
    Permissions: All can create suggestions, managers can review
    """
    queryset = Suggestion.objects.select_related('author', 'reviewer').all()
    serializer_class = SuggestionSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'is_anonymous', 'category', 'author', 'reviewer']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'upvotes']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        """Upvote a suggestion"""
        suggestion = self.get_object()
        suggestion.upvotes += 1
        suggestion.save()
        serializer = self.get_serializer(suggestion)
        return Response(serializer.data)


# ========================================
# TOOLS AND DATA VIEWSETS
# ========================================

class KPIDashboardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for KPIDashboard model
    Permissions: All can view, managers can create/modify
    """
    queryset = KPIDashboard.objects.select_related('department').all()
    serializer_class = KPIDashboardSerializer
    permission_classes = [IsDepartmentManager | IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_active', 'period']
    search_fields = ['name', 'metric_name', 'description']
    ordering_fields = ['name', 'last_updated']
    ordering = ['department', 'name']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active KPIs"""
        active_kpis = self.queryset.filter(is_active=True)
        page = self.paginate_queryset(active_kpis)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(active_kpis, many=True)
        return Response(serializer.data)


class QuickLinkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuickLink model
    Permissions: All can view, admins can create/modify
    """
    queryset = QuickLink.objects.select_related('department').all()
    serializer_class = QuickLinkSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'department']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'title']
    ordering = ['order', 'title']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active quick links"""
        active_links = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(active_links, many=True)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project model
    Permissions: All can view, Project Managers can create/modify
    """
    queryset = Project.objects.select_related('project_manager', 'department').prefetch_related('team_members').all()
    serializer_class = ProjectSerializer
    permission_classes = [CanManageProjects]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project_manager', 'department']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'start_date', 'priority']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active projects"""
        active_projects = self.queryset.filter(status='active')
        page = self.paginate_queryset(active_projects)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(active_projects, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task model
    Permissions: All can view, assigned user and project manager can modify
    """
    queryset = Task.objects.select_related('project', 'assigned_to', 'created_by').all()
    serializer_class = TaskSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority']
    ordering = ['-priority', 'due_date']
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to current user"""
        if request.user.is_authenticated:
            my_tasks = self.queryset.filter(assigned_to=request.user)
            page = self.paginate_queryset(my_tasks)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(my_tasks, many=True)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

