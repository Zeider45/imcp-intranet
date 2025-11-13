from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'announcements', views.AnnouncementViewSet, basename='announcement')
router.register(r'documents', views.DocumentViewSet, basename='document')

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('welcome/', views.welcome, name='welcome'),
    path('', include(router.urls)),
]
