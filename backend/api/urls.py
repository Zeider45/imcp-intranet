from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()

# Core modules
router.register(r'departments', views.DepartmentViewSet, basename='department')

# Business Process Modules - IMCP Use Cases
# Biblioteca de Documentos Unificada (reemplaza Technical Documents, Document Drafts, Document Approvals)
# Note: Document Loans has been removed completely
router.register(r'library-documents', views.LibraryDocumentViewSet, basename='library-document')

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
