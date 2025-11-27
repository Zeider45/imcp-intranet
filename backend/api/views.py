from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django_filters.rest_framework import DjangoFilterBackend
import logging
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
    KPIDashboard, QuickLink, Project, Task,
    # Business Process Models
    TechnicalDocument, DocumentLoan, DocumentDraft, DocumentApproval,
    Policy, PolicyDistribution, TrainingPlan, TrainingProvider,
    TrainingQuotation, TrainingSession, TrainingAttendance,
    InternalVacancy, VacancyApplication, VacancyTransition
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
    TaskSerializer,
    # Business Process Serializers
    TechnicalDocumentSerializer,
    DocumentLoanSerializer,
    DocumentDraftSerializer,
    DocumentApprovalSerializer,
    PolicySerializer,
    PolicyDistributionSerializer,
    TrainingPlanSerializer,
    TrainingProviderSerializer,
    TrainingQuotationSerializer,
    TrainingSessionSerializer,
    TrainingAttendanceSerializer,
    InternalVacancySerializer,
    VacancyApplicationSerializer,
    VacancyTransitionSerializer
)

# Logger for authentication
logger = logging.getLogger(__name__)


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
    
    # Store original username for logging
    original_username = username
    
    # Normalize username for Active Directory authentication
    # Remove leading/trailing whitespace
    username = username.strip()
    
    # Handle different username formats:
    # 1. DOMAIN\username -> username
    # 2. username@domain.com -> username
    # 3. username -> username (no change)
    if '\\' in username:
        # Handle DOMAIN\username format
        username = username.split('\\')[-1]
    elif '@' in username:
        # Handle username@domain.com format
        username = username.split('@')[0]
    
    # Log authentication attempt (without password)
    if original_username != username:
        logger.info(f"Login attempt: normalized '{original_username}' to '{username}'")
    else:
        logger.info(f"Login attempt for user: {username}")
    
    # Authenticate against configured backends (including LDAP)
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        # User authenticated successfully
        logger.info(f"User '{username}' authenticated successfully")
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
        logger.warning(f"Authentication failed for user: {username}")
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


# ========================================
# BUSINESS PROCESS VIEWSETS - IMCP USE CASES
# ========================================

class TechnicalDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TechnicalDocument model
    Caso de Uso: CONSULTA DOCUMENTACIÓN
    Gestión de documentación técnica del IMCP
    """
    queryset = TechnicalDocument.objects.select_related('department', 'created_by').prefetch_related('authorized_users').all()
    serializer_class = TechnicalDocumentSerializer
    permission_classes = [CanManageDocuments]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['document_type', 'status', 'department', 'created_by']
    search_fields = ['title', 'code', 'description', 'physical_location']
    ordering_fields = ['code', 'title', 'created_at']
    ordering = ['code']
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available documents for consultation"""
        available_docs = self.queryset.filter(status='available')
        page = self.paginate_queryset(available_docs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(available_docs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def catalog(self, request):
        """Get document catalog (index master)"""
        catalog = self.queryset.values('id', 'code', 'title', 'document_type', 'physical_location', 'status')
        return Response(list(catalog))


class DocumentLoanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DocumentLoan model
    Caso de Uso: CONSULTA DOCUMENTACIÓN
    Bitácora de préstamos de documentos
    """
    queryset = DocumentLoan.objects.select_related('document', 'analyst', 'assistant').all()
    serializer_class = DocumentLoanSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'document', 'analyst', 'assistant']
    search_fields = ['document__title', 'document__code', 'analyst__username', 'purpose']
    ordering_fields = ['request_date', 'delivery_date', 'expected_return_date']
    ordering = ['-request_date']
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending loan requests"""
        pending_loans = self.queryset.filter(status__in=['requested', 'approved'])
        page = self.paginate_queryset(pending_loans)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(pending_loans, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue loans"""
        from django.utils import timezone
        overdue_loans = self.queryset.filter(
            status='delivered',
            expected_return_date__lt=timezone.now().date()
        )
        serializer = self.get_serializer(overdue_loans, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a loan request"""
        loan = self.get_object()
        loan.status = 'approved'
        loan.assistant = request.user if request.user.is_authenticated else None
        loan.save()
        serializer = self.get_serializer(loan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """Mark document as delivered"""
        loan = self.get_object()
        loan.status = 'delivered'
        from django.utils import timezone
        loan.delivery_date = timezone.now()
        loan.analyst_signature = True
        loan.save()
        # Update document status
        loan.document.status = 'on_loan'
        loan.document.save()
        serializer = self.get_serializer(loan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def return_document(self, request, pk=None):
        """Mark document as returned"""
        loan = self.get_object()
        loan.status = 'returned'
        from django.utils import timezone
        loan.actual_return_date = timezone.now()
        loan.return_verified = True
        loan.save()
        # Update document status
        loan.document.status = 'available'
        loan.document.save()
        serializer = self.get_serializer(loan)
        return Response(serializer.data)


class DocumentDraftViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DocumentDraft model
    Caso de Uso: REALIZA DOCUMENTACIÓN SOBRE UNA FUNCIONALIDAD O SISTEMA
    Borradores de documentación técnica
    """
    queryset = DocumentDraft.objects.select_related('author', 'manager', 'department').all()
    serializer_class = DocumentDraftSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['document_type', 'status', 'author', 'manager', 'department']
    search_fields = ['title', 'content', 'system_or_functionality']
    ordering_fields = ['created_at', 'submitted_at', 'title']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def my_drafts(self, request):
        """Get drafts authored by current user"""
        if request.user.is_authenticated:
            my_drafts = self.queryset.filter(author=request.user)
            page = self.paginate_queryset(my_drafts)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(my_drafts, many=True)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['get'])
    def pending_review(self, request):
        """Get drafts pending review for managers"""
        pending = self.queryset.filter(status='pending_approval')
        if request.user.is_authenticated:
            pending = pending.filter(manager=request.user)
        page = self.paginate_queryset(pending)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit draft for manager review"""
        draft = self.get_object()
        draft.status = 'pending_approval'
        from django.utils import timezone
        draft.submitted_at = timezone.now()
        if 'manager' in request.data:
            from django.contrib.auth.models import User
            draft.manager = User.objects.get(pk=request.data['manager'])
        draft.save()
        serializer = self.get_serializer(draft)
        return Response(serializer.data)


class DocumentApprovalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DocumentApproval model
    Caso de Uso: APROBACIÓN DE LA DOCUMENTACIÓN
    Proceso de aprobación de documentación
    """
    queryset = DocumentApproval.objects.select_related('document_draft', 'reviewer', 'assistant').all()
    serializer_class = DocumentApprovalSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['decision', 'reviewer', 'document_draft', 'requires_board_approval', 'board_approved']
    search_fields = ['document_draft__title', 'technical_observations', 'corrections_required']
    ordering_fields = ['created_at', 'approved_at']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending approvals"""
        pending = self.queryset.filter(decision='pending')
        page = self.paginate_queryset(pending)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve document"""
        approval = self.get_object()
        approval.decision = 'approved'
        from django.utils import timezone
        approval.approved_at = timezone.now()
        approval.reviewer_signature = True
        approval.technical_observations = request.data.get('observations', '')
        approval.save()
        # Update draft status
        approval.document_draft.status = 'approved'
        approval.document_draft.save()
        serializer = self.get_serializer(approval)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_with_observations(self, request, pk=None):
        """Approve document with observations"""
        approval = self.get_object()
        approval.decision = 'approved_with_observations'
        from django.utils import timezone
        approval.approved_at = timezone.now()
        approval.reviewer_signature = True
        approval.technical_observations = request.data.get('observations', '')
        approval.corrections_required = request.data.get('corrections', '')
        approval.correction_deadline = request.data.get('deadline')
        approval.save()
        # Update draft status
        approval.document_draft.status = 'approved_with_observations'
        approval.document_draft.save()
        serializer = self.get_serializer(approval)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject document"""
        approval = self.get_object()
        approval.decision = 'rejected'
        approval.rejection_reason = request.data.get('reason', '')
        approval.save()
        # Update draft status
        approval.document_draft.status = 'rejected'
        approval.document_draft.save()
        serializer = self.get_serializer(approval)
        return Response(serializer.data)


class PolicyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Policy model
    Caso de Uso: ESTABLECER POLÍTICAS
    Políticas institucionales del IMCP
    """
    queryset = Policy.objects.select_related('department', 'created_by', 'auditor_reviewer', 'peer_reviewer', 'replaces_policy').all()
    serializer_class = PolicySerializer
    permission_classes = [IsDepartmentManager | IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'origin', 'department', 'created_by', 'board_approved']
    search_fields = ['title', 'code', 'description', 'content']
    ordering_fields = ['created_at', 'effective_date', 'code']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get published and active policies"""
        published = self.queryset.filter(status='published')
        page = self.paginate_queryset(published)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(published, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get policies pending board approval"""
        pending = self.queryset.filter(status='pending_signatures', board_approved=False)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit policy for peer and auditor review"""
        policy = self.get_object()
        policy.status = 'under_review'
        if 'peer_reviewer' in request.data:
            from django.contrib.auth.models import User
            policy.peer_reviewer = User.objects.get(pk=request.data['peer_reviewer'])
        if 'auditor_reviewer' in request.data:
            from django.contrib.auth.models import User
            policy.auditor_reviewer = User.objects.get(pk=request.data['auditor_reviewer'])
        policy.save()
        serializer = self.get_serializer(policy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_board(self, request, pk=None):
        """Register board approval"""
        policy = self.get_object()
        policy.board_approved = True
        policy.board_approval_date = request.data.get('approval_date')
        policy.status = 'approved'
        policy.save()
        serializer = self.get_serializer(policy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish policy officially"""
        policy = self.get_object()
        from django.utils import timezone
        policy.status = 'published'
        policy.published_at = timezone.now()
        policy.effective_date = request.data.get('effective_date', timezone.now().date())
        policy.save()
        serializer = self.get_serializer(policy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_obsolete(self, request, pk=None):
        """Mark policy as obsolete"""
        policy = self.get_object()
        policy.status = 'obsolete'
        policy.save()
        serializer = self.get_serializer(policy)
        return Response(serializer.data)


class PolicyDistributionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PolicyDistribution model
    Distribución de políticas a personal
    """
    queryset = PolicyDistribution.objects.select_related('policy', 'recipient', 'distributed_by').all()
    serializer_class = PolicyDistributionSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['policy', 'recipient', 'acknowledged']
    search_fields = ['policy__title', 'policy__code', 'recipient__username']
    ordering_fields = ['distributed_at', 'acknowledged_at']
    ordering = ['-distributed_at']
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge receipt of policy"""
        distribution = self.get_object()
        distribution.acknowledged = True
        from django.utils import timezone
        distribution.acknowledged_at = timezone.now()
        distribution.save()
        serializer = self.get_serializer(distribution)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_acknowledgment(self, request):
        """Get distributions pending acknowledgment"""
        if request.user.is_authenticated:
            pending = self.queryset.filter(recipient=request.user, acknowledged=False)
            serializer = self.get_serializer(pending, many=True)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


class TrainingPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TrainingPlan model
    Caso de Uso: PLANIFICAR CAPACITACIONES PARA LOS ANALISTAS
    Planes de capacitación
    """
    queryset = TrainingPlan.objects.select_related('department', 'created_by', 'assigned_manager').all()
    serializer_class = TrainingPlanSerializer
    permission_classes = [IsDepartmentManager | IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'origin', 'scope', 'modality', 'department', 'budget_approved']
    search_fields = ['title', 'description', 'topics']
    ordering_fields = ['created_at', 'planned_start_date', 'title']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get training plans for calendar view"""
        scheduled = self.queryset.filter(status__in=['scheduled', 'in_progress'])
        serializer = self.get_serializer(scheduled, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_budget(self, request, pk=None):
        """Approve training budget"""
        plan = self.get_object()
        plan.budget_approved = True
        plan.status = 'approved'
        plan.save()
        serializer = self.get_serializer(plan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_manager(self, request, pk=None):
        """Assign manager to handle participant selection"""
        plan = self.get_object()
        if 'manager_id' in request.data:
            from django.contrib.auth.models import User
            plan.assigned_manager = User.objects.get(pk=request.data['manager_id'])
            plan.save()
        serializer = self.get_serializer(plan)
        return Response(serializer.data)


class TrainingProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TrainingProvider model
    Proveedores de capacitación
    """
    queryset = TrainingProvider.objects.all()
    serializer_class = TrainingProviderSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'rating']
    search_fields = ['name', 'contact_name', 'specialties']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active providers"""
        active = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)


class TrainingQuotationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TrainingQuotation model
    Cotizaciones de capacitación
    """
    queryset = TrainingQuotation.objects.select_related('training_plan', 'provider').all()
    serializer_class = TrainingQuotationSerializer
    permission_classes = [IsDepartmentManager | IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'training_plan', 'provider']
    search_fields = ['training_plan__title', 'provider__name', 'temario', 'instructor_name']
    ordering_fields = ['received_at', 'cost']
    ordering = ['-received_at']
    
    @action(detail=True, methods=['post'])
    def select(self, request, pk=None):
        """Select quotation for training"""
        quotation = self.get_object()
        quotation.status = 'selected'
        quotation.save()
        # Reject other quotations for same plan
        TrainingQuotation.objects.filter(
            training_plan=quotation.training_plan
        ).exclude(pk=pk).update(status='rejected')
        serializer = self.get_serializer(quotation)
        return Response(serializer.data)


class TrainingSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TrainingSession model
    Caso de Uso: ASISTEN A CAPACITACIONES DE LA GERENCIA
    Sesiones de capacitación
    """
    queryset = TrainingSession.objects.select_related('training_plan', 'provider').all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [IsDepartmentManager | IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'training_plan', 'provider']
    search_fields = ['title', 'description', 'instructor_name', 'location']
    ordering_fields = ['start_datetime', 'created_at']
    ordering = ['start_datetime']
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming training sessions"""
        from django.utils import timezone
        upcoming = self.queryset.filter(
            start_datetime__gte=timezone.now(),
            status__in=['scheduled', 'confirmed']
        )
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm training session"""
        session = self.get_object()
        session.status = 'confirmed'
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark session as completed"""
        session = self.get_object()
        session.status = 'completed'
        session.save()
        serializer = self.get_serializer(session)
        return Response(serializer.data)


class TrainingAttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TrainingAttendance model
    Asistencia a capacitaciones
    """
    queryset = TrainingAttendance.objects.select_related('session', 'analyst', 'invited_by').all()
    serializer_class = TrainingAttendanceSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['confirmation_status', 'attendance_status', 'session', 'analyst', 'certificate_issued']
    search_fields = ['session__title', 'analyst__username', 'analyst__first_name', 'analyst__last_name']
    ordering_fields = ['created_at', 'session__start_datetime']
    ordering = ['-session__start_datetime']
    
    @action(detail=False, methods=['get'])
    def my_invitations(self, request):
        """Get current user's training invitations"""
        if request.user.is_authenticated:
            invitations = self.queryset.filter(analyst=request.user)
            serializer = self.get_serializer(invitations, many=True)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=True, methods=['post'])
    def confirm_attendance(self, request, pk=None):
        """Confirm attendance to training"""
        attendance = self.get_object()
        attendance.confirmation_status = 'confirmed'
        from django.utils import timezone
        attendance.confirmation_date = timezone.now()
        attendance.save()
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def decline_attendance(self, request, pk=None):
        """Decline attendance to training"""
        attendance = self.get_object()
        attendance.confirmation_status = 'declined'
        attendance.decline_reason = request.data.get('reason', '')
        attendance.save()
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_attendance(self, request, pk=None):
        """Record actual attendance"""
        attendance = self.get_object()
        attendance.attendance_status = request.data.get('status', 'present')
        attendance.arrival_time = request.data.get('arrival_time')
        attendance.departure_time = request.data.get('departure_time')
        attendance.attendance_signature = True
        attendance.save()
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        """Issue certificate for training completion"""
        attendance = self.get_object()
        if attendance.attendance_status == 'present':
            attendance.certificate_issued = True
            attendance.evaluation_score = request.data.get('score')
            attendance.save()
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)


class InternalVacancyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for InternalVacancy model
    Caso de Uso: DISPONIBILIDAD DE VACANTE INTERNA
    Vacantes internas
    """
    queryset = InternalVacancy.objects.select_related('department', 'requested_by', 'hr_manager').all()
    serializer_class = InternalVacancySerializer
    permission_classes = [IsHRManager | IsDepartmentManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'requested_by', 'budget_approved']
    search_fields = ['title', 'description', 'responsibilities', 'technical_requirements']
    ordering_fields = ['created_at', 'application_deadline', 'required_date']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get published vacancies"""
        published = self.queryset.filter(status='published')
        page = self.paginate_queryset(published)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(published, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_budget(self, request, pk=None):
        """Approve vacancy budget"""
        vacancy = self.get_object()
        vacancy.budget_approved = True
        vacancy.save()
        serializer = self.get_serializer(vacancy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish vacancy"""
        vacancy = self.get_object()
        from django.utils import timezone
        vacancy.status = 'published'
        vacancy.published_at = timezone.now()
        vacancy.save()
        serializer = self.get_serializer(vacancy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close vacancy"""
        vacancy = self.get_object()
        vacancy.status = 'closed'
        vacancy.save()
        serializer = self.get_serializer(vacancy)
        return Response(serializer.data)


class VacancyApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for VacancyApplication model
    Aplicaciones a vacantes internas
    """
    queryset = VacancyApplication.objects.select_related('vacancy', 'applicant', 'current_manager').all()
    serializer_class = VacancyApplicationSerializer
    permission_classes = [IsOwnerOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'vacancy', 'applicant', 'current_manager_authorization']
    search_fields = ['vacancy__title', 'applicant__username', 'applicant__first_name', 'applicant__last_name']
    ordering_fields = ['applied_at', 'overall_ranking', 'interview_date']
    ordering = ['-applied_at']
    
    @action(detail=False, methods=['get'])
    def my_applications(self, request):
        """Get current user's applications"""
        if request.user.is_authenticated:
            apps = self.queryset.filter(applicant=request.user)
            serializer = self.get_serializer(apps, many=True)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=True, methods=['post'])
    def shortlist(self, request, pk=None):
        """Shortlist application"""
        application = self.get_object()
        application.status = 'shortlisted'
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        """Schedule interview for application"""
        application = self.get_object()
        application.status = 'interview_scheduled'
        application.interview_date = request.data.get('interview_date')
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_interview(self, request, pk=None):
        """Record interview results"""
        application = self.get_object()
        application.status = 'interviewed'
        application.interview_notes = request.data.get('notes', '')
        application.technical_score = request.data.get('technical_score')
        application.experience_score = request.data.get('experience_score')
        application.performance_score = request.data.get('performance_score')
        application.potential_score = request.data.get('potential_score')
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def select(self, request, pk=None):
        """Select application (hire candidate)"""
        application = self.get_object()
        application.status = 'selected'
        application.save()
        # Mark vacancy as filled
        application.vacancy.status = 'filled'
        application.vacancy.save()
        # Reject other applications
        VacancyApplication.objects.filter(
            vacancy=application.vacancy
        ).exclude(pk=pk).update(status='rejected', rejection_reason='Position filled by another candidate')
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject application"""
        application = self.get_object()
        application.status = 'rejected'
        application.rejection_reason = request.data.get('reason', '')
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)


class VacancyTransitionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for VacancyTransition model
    Transiciones de puesto
    """
    queryset = VacancyTransition.objects.select_related(
        'application', 'previous_department', 'new_department', 'hr_coordinator'
    ).all()
    serializer_class = VacancyTransitionSerializer
    permission_classes = [IsHRManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'previous_department', 'new_department', 'hr_coordinator']
    search_fields = ['application__applicant__username', 'previous_position', 'new_position']
    ordering_fields = ['created_at', 'transition_date']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['post'])
    def start_transition(self, request, pk=None):
        """Start transition process"""
        transition = self.get_object()
        transition.status = 'in_progress'
        transition.save()
        serializer = self.get_serializer(transition)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_transition(self, request, pk=None):
        """Complete transition process"""
        transition = self.get_object()
        transition.status = 'completed'
        transition.directory_updated = request.data.get('directory_updated', True)
        transition.system_permissions_updated = request.data.get('permissions_updated', True)
        transition.file_updated = request.data.get('file_updated', True)
        transition.save()
        serializer = self.get_serializer(transition)
        return Response(serializer.data)

