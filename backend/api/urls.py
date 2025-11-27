from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()

# Existing modules
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'announcements', views.AnnouncementViewSet, basename='announcement')
router.register(r'documents', views.DocumentViewSet, basename='document')

# Time and Resource Management
router.register(r'calendar-events', views.CalendarEventViewSet, basename='calendar-event')
router.register(r'leave-requests', views.LeaveRequestViewSet, basename='leave-request')
router.register(r'resources', views.ResourceViewSet, basename='resource')
router.register(r'resource-reservations', views.ResourceReservationViewSet, basename='resource-reservation')

# Training and Development
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'course-enrollments', views.CourseEnrollmentViewSet, basename='course-enrollment')
router.register(r'knowledge-articles', views.KnowledgeArticleViewSet, basename='knowledge-article')

# Interaction and Collaboration
router.register(r'forum-categories', views.ForumCategoryViewSet, basename='forum-category')
router.register(r'forum-posts', views.ForumPostViewSet, basename='forum-post')
router.register(r'suggestions', views.SuggestionViewSet, basename='suggestion')

# Tools and Data
router.register(r'kpi-dashboards', views.KPIDashboardViewSet, basename='kpi-dashboard')
router.register(r'quick-links', views.QuickLinkViewSet, basename='quick-link')
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'tasks', views.TaskViewSet, basename='task')

# Business Process Modules - IMCP Use Cases
# Consulta de Documentación
router.register(r'technical-documents', views.TechnicalDocumentViewSet, basename='technical-document')
router.register(r'document-loans', views.DocumentLoanViewSet, basename='document-loan')

# Realiza y Aprueba Documentación
router.register(r'document-drafts', views.DocumentDraftViewSet, basename='document-draft')
router.register(r'document-approvals', views.DocumentApprovalViewSet, basename='document-approval')

# Establecer Políticas
router.register(r'policies', views.PolicyViewSet, basename='policy')
router.register(r'policy-distributions', views.PolicyDistributionViewSet, basename='policy-distribution')

# Planificar y Asistir a Capacitaciones
router.register(r'training-plans', views.TrainingPlanViewSet, basename='training-plan')
router.register(r'training-providers', views.TrainingProviderViewSet, basename='training-provider')
router.register(r'training-quotations', views.TrainingQuotationViewSet, basename='training-quotation')
router.register(r'training-sessions', views.TrainingSessionViewSet, basename='training-session')
router.register(r'training-attendances', views.TrainingAttendanceViewSet, basename='training-attendance')

# Disponibilidad de Vacante Interna
router.register(r'internal-vacancies', views.InternalVacancyViewSet, basename='internal-vacancy')
router.register(r'vacancy-applications', views.VacancyApplicationViewSet, basename='vacancy-application')
router.register(r'vacancy-transitions', views.VacancyTransitionViewSet, basename='vacancy-transition')

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('welcome/', views.welcome, name='welcome'),
    # Authentication endpoints
    path('auth/login/', views.ldap_login, name='ldap_login'),
    path('auth/logout/', views.ldap_logout, name='ldap_logout'),
    path('auth/me/', views.current_user, name='current_user'),
    path('', include(router.urls)),
]
