from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django_filters.rest_framework import DjangoFilterBackend
import logging
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from .permissions import (
    IsAdminOrReadOnly,
    IsDepartmentManager,
    IsHRManager,
    CanManageDocuments,
    CanManageProjects,
    IsOwnerOrReadOnly,
    IsOwnerOrManager
)
from .models import (
    Department,
    # Business Process Models
    LibraryDocument,
    Policy, PolicyDistribution, TrainingPlan, TrainingProvider,
    TrainingQuotation, TrainingSession, TrainingAttendance,
    InternalVacancy, VacancyApplication, VacancyTransition,
    # Forum Models
    ForumCategory, ForumPost
)
from .serializers import (
    HealthCheckSerializer,
    DepartmentSerializer,
    # Business Process Serializers
    LibraryDocumentSerializer,
    PolicySerializer,
    PolicyDistributionSerializer,
    TrainingPlanSerializer,
    TrainingProviderSerializer,
    TrainingQuotationSerializer,
    TrainingSessionSerializer,
    TrainingAttendanceSerializer,
    InternalVacancySerializer,
    VacancyApplicationSerializer,
    VacancyTransitionSerializer,
    # Forum Serializers
    ForumCategorySerializer,
    ForumPostSerializer
)

# Constants
POSITION_FILLED_REJECTION_REASON = 'Puesto cubierto por otro candidato'

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

        # Build response payload
        user_groups = list(user.groups.values_list('name', flat=True))
        response_payload = {
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
        }

        # Prepare DRF Response so we can set cookie headers
        response = Response(response_payload, status=status.HTTP_200_OK)

        # Set HttpOnly cookie for the token. Use secure flag when configured.
        import os
        secure = os.environ.get('DJANGO_SECURE_COOKIE', '').lower() == 'true'
        max_age = 14 * 24 * 60 * 60  # 14 days
        response.set_cookie(
            key='auth_token',
            value=token.key,
            httponly=True,
            secure=secure,
            samesite='Lax',
            max_age=max_age,
        )

        return response
    else:
        # Authentication failed
        logger.warning(f"Authentication failed for user: {username}")
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@csrf_exempt
@api_view(['POST'])
def ldap_logout(request):
    """
    Logout current user
    """
    # Attempt to remove any server-side token and session, and always clear the cookie
    token_deleted = False

    # If the user is authenticated via session, remove their token and logout
    if request.user.is_authenticated:
        try:
            request.user.auth_token.delete()
            token_deleted = True
        except Exception:
            # ignore if no token or deletion fails
            pass

        # Terminate the session
        logout(request)

    # If not authenticated via session, try to delete token referenced in the HttpOnly cookie
    # This handles clients that authenticate solely via the cookie token (no session)
    token_key = request.COOKIES.get('auth_token')
    if token_key:
        try:
            token_obj = Token.objects.filter(key=token_key).first()
            if token_obj:
                token_obj.delete()
                token_deleted = True
        except Exception:
            # ignore any errors deleting token
            pass

    # Always return success and ensure the cookie is removed on the client
    response = Response({
        'success': True,
        'message': 'Logout successful',
        'token_deleted': token_deleted,
    }, status=status.HTTP_200_OK)
    # Remove cookie from client
    response.delete_cookie('auth_token')
    return response


@api_view(['GET'])
def current_user(request):
    """
    Get current authenticated user information
    """
    # If user is authenticated via session, return that
    if request.user.is_authenticated:
        user = request.user
    else:
        # Try to authenticate via token in HttpOnly cookie
        token_key = request.COOKIES.get('auth_token')
        user = None
        if token_key:
            try:
                token_obj = Token.objects.get(key=token_key)
                user = token_obj.user
            except Token.DoesNotExist:
                user = None

    if user:
        user_groups = list(user.groups.values_list('name', flat=True))
        return Response({
            'authenticated': True,
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
        }, status=status.HTTP_200_OK)

    return Response({'authenticated': False}, status=status.HTTP_200_OK)


@api_view(['GET'])
def active_employees_count(request):
    """
    Returns the count of active employees that belong to the
    'GG_INTRANET_TODOS_USUARIOS' group. If the group doesn't exist,
    the count will be 0.

    Response shape: { "count": number }
    """
    group_name = 'GG_INTRANET_TODOS_USUARIOS'
    now = timezone.now()
    try:
        group = Group.objects.get(name=group_name)
        # Current active employees in the group
        current_count = User.objects.filter(is_active=True, groups=group).count()

        # Calculate end of previous month: first day of this month minus 1 second
        first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        from datetime import timedelta
        last_month_end = first_of_month - timedelta(seconds=1)

        # Approximate previous month's active employees by counting users
        # who had joined on or before the end of last month and belong to the group.
        # Note: if users were deactivated after joining, historic active status is not tracked
        # in this schema; this is a reasonable approximation.
        previous_count = User.objects.filter(groups=group, is_active=True, date_joined__lte=last_month_end).count()
    except Group.DoesNotExist:
        current_count = 0
        previous_count = 0

    # Compute percent change and whether it's positive
    percent_change = None
    is_positive = None
    if previous_count == 0:
        if current_count == 0:
            percent_change = 0.0
            is_positive = False
        else:
            # From 0 to some number -> treat as 100% increase
            percent_change = 100.0
            is_positive = True
    else:
        diff = current_count - previous_count
        percent_change = round((diff / previous_count) * 100.0, 2)
        is_positive = diff > 0

    return Response({
        'count': current_count,
        'previous_count': previous_count,
        'percent_change': percent_change,
        'is_positive': is_positive,
        'group': group_name,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def documents_count(request):
    """
    Returns the total count of library documents.

    Response shape: { "count": number }
    """
    try:
        count = LibraryDocument.objects.count()
    except Exception:
        count = 0

    return Response({
        'count': count,
    }, status=status.HTTP_200_OK)


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


# ========================================
# BUSINESS PROCESS VIEWSETS - IMCP USE CASES
# ========================================

class LibraryDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for LibraryDocument model
    Biblioteca de Documentos Unificada
    Unifica: Documentación Técnica, Elaboración de Docs y Aprobación de Docs
    Permite subir, ver, descargar archivos, y realizar elaboración y aprobación
    
    IMPORTANT: Permissions are set to AllowAny for testing purposes.
    In production, set the LIBRARY_DOCS_PRODUCTION environment variable to 'true'
    to enable proper permission checking (CanManageDocuments).
    """
    queryset = LibraryDocument.objects.select_related('department', 'author', 'approver').all()
    serializer_class = LibraryDocumentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['document_type', 'status', 'department', 'author', 'approval_decision']
    search_fields = ['title', 'code', 'description', 'content', 'tags']
    ordering_fields = ['code', 'title', 'created_at', 'updated_at', 'download_count', 'view_count']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Return permissions based on environment.
        For testing: AllowAny
        For production: CanManageDocuments (set LIBRARY_DOCS_PRODUCTION=true)
        """
        import os
        if os.environ.get('LIBRARY_DOCS_PRODUCTION', '').lower() == 'true':
            return [CanManageDocuments()]
        return [AllowAny()]
    
    @action(detail=False, methods=['get'])
    def published(self, request):
        """Get published documents available for viewing/downloading"""
        published_docs = self.queryset.filter(status='published')
        page = self.paginate_queryset(published_docs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(published_docs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_documents(self, request):
        """Get documents authored by current user"""
        if request.user.is_authenticated:
            my_docs = self.queryset.filter(author=request.user)
            page = self.paginate_queryset(my_docs)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(my_docs, many=True)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['get'])
    def pending_approval(self, request):
        """Get documents pending approval"""
        pending = self.queryset.filter(status='pending_approval')
        page = self.paginate_queryset(pending)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent documents (last 10)"""
        recent_docs = self.queryset.filter(status='published').order_by('-created_at')[:10]
        serializer = self.get_serializer(recent_docs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit document for approval"""
        document = self.get_object()
        if document.status != 'draft':
            return Response(
                {'error': 'Solo se pueden enviar borradores para aprobación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        document.status = 'pending_approval'
        from django.utils import timezone
        document.submitted_at = timezone.now()
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve document
        Note: For testing, this is open to everyone. In production, only managers should approve.
        """
        document = self.get_object()
        if document.status != 'pending_approval':
            return Response(
                {'error': 'Solo se pueden aprobar documentos pendientes de aprobación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        document.status = 'approved'
        document.approval_decision = 'approved'
        from django.utils import timezone
        document.approved_at = timezone.now()
        if request.user.is_authenticated:
            document.approver = request.user
        document.approval_observations = request.data.get('observations', '')
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve_with_observations(self, request, pk=None):
        """
        Approve document with observations
        Note: For testing, this is open to everyone. In production, only managers should approve.
        """
        document = self.get_object()
        if document.status != 'pending_approval':
            return Response(
                {'error': 'Solo se pueden aprobar documentos pendientes de aprobación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        document.status = 'approved_with_observations'
        document.approval_decision = 'approved_with_observations'
        from django.utils import timezone
        document.approved_at = timezone.now()
        if request.user.is_authenticated:
            document.approver = request.user
        document.approval_observations = request.data.get('observations', '')
        document.corrections_required = request.data.get('corrections', '')
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject document
        Note: For testing, this is open to everyone. In production, only managers should reject.
        """
        document = self.get_object()
        if document.status != 'pending_approval':
            return Response(
                {'error': 'Solo se pueden rechazar documentos pendientes de aprobación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        document.status = 'rejected'
        document.approval_decision = 'rejected'
        if request.user.is_authenticated:
            document.approver = request.user
        document.rejection_reason = request.data.get('reason', '')
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish an approved document"""
        document = self.get_object()
        if document.status not in ['approved', 'approved_with_observations']:
            return Response(
                {'error': 'Solo se pueden publicar documentos aprobados'},
                status=status.HTTP_400_BAD_REQUEST
            )
        document.status = 'published'
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a document"""
        document = self.get_object()
        document.status = 'archived'
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment view count"""
        document = self.get_object()
        document.view_count += 1
        document.save()
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_download(self, request, pk=None):
        """Increment download count"""
        document = self.get_object()
        document.download_count += 1
        document.save()
        serializer = self.get_serializer(document)
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
        from django.contrib.auth.models import User
        from django.shortcuts import get_object_or_404
        if 'peer_reviewer' in request.data:
            policy.peer_reviewer = get_object_or_404(User, pk=request.data['peer_reviewer'])
        if 'auditor_reviewer' in request.data:
            policy.auditor_reviewer = get_object_or_404(User, pk=request.data['auditor_reviewer'])
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
            from django.shortcuts import get_object_or_404
            plan.assigned_manager = get_object_or_404(User, pk=request.data['manager_id'])
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
        ).exclude(pk=pk).update(status='rejected', rejection_reason=POSITION_FILLED_REJECTION_REASON)
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


# ========================================
# FORUM VIEWSETS
# ========================================

class ForumCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ForumCategory model
    Gestión de categorías de foro
    """
    queryset = ForumCategory.objects.all()
    serializer_class = ForumCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active forum categories"""
        active_categories = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(active_categories, many=True)
        return Response(serializer.data)


class ForumPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ForumPost model
    Gestión de posts de foro
    """
    queryset = ForumPost.objects.select_related('category', 'author', 'parent_post').all()
    serializer_class = ForumPostSerializer
    permission_classes = [IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'is_pinned', 'is_locked', 'parent_post']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'views_count', 'is_pinned']
    ordering = ['-is_pinned', '-created_at']
    
    def get_queryset(self):
        """
        Optionally filter to only main posts (not replies)
        """
        queryset = super().get_queryset()
        main_posts_only = self.request.query_params.get('main_posts_only', None)
        if main_posts_only and main_posts_only.lower() == 'true':
            queryset = queryset.filter(parent_post__isnull=True)
        return queryset
    
    def perform_create(self, serializer):
        """Set the author to the current user"""
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user)
        else:
            raise PermissionError("Authentication required to create posts")
    
    @action(detail=False, methods=['get'])
    def pinned(self, request):
        """Get pinned posts"""
        pinned_posts = self.queryset.filter(is_pinned=True, parent_post__isnull=True)
        serializer = self.get_serializer(pinned_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent posts (last 10)"""
        recent_posts = self.queryset.filter(parent_post__isnull=True).order_by('-created_at')[:10]
        serializer = self.get_serializer(recent_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most viewed posts"""
        popular_posts = self.queryset.filter(parent_post__isnull=True).order_by('-views_count')[:10]
        serializer = self.get_serializer(popular_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get replies for a post"""
        post = self.get_object()
        replies = ForumPost.objects.filter(parent_post=post).order_by('created_at')
        page = self.paginate_queryset(replies)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(replies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count"""
        post = self.get_object()
        post.views_count += 1
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle pinned status"""
        post = self.get_object()
        post.is_pinned = not post.is_pinned
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_lock(self, request, pk=None):
        """Toggle locked status"""
        post = self.get_object()
        post.is_locked = not post.is_locked
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_like(self, request, pk=None):
        """Toggle like status for current user"""
        post = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'error': 'Authentication required to like posts'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if post.liked_by.filter(id=user.id).exists():
            # Unlike
            post.liked_by.remove(user)
        else:
            # Like
            post.liked_by.add(user)
        
        # Update likes count based on actual count
        post.likes_count = post.liked_by.count()
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)

