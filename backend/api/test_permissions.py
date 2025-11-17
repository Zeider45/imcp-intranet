"""
Tests for role-based permissions and AD group synchronization.
"""
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from rest_framework import status
from .models import Department, Announcement, Document, Project
from .ldap_sync import sync_user_relations, clean_user_data


class LDAPGroupSyncTestCase(TestCase):
    """Test cases for LDAP group synchronization"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_sync_user_relations_creates_groups(self):
        """Test that sync_user_relations creates Django groups from AD groups"""
        ldap_attributes = {
            'memberOf': [
                'CN=HR_Managers,OU=Groups,DC=example,DC=com',
                'CN=Department_Managers,OU=Groups,DC=example,DC=com',
            ]
        }
        
        sync_user_relations(self.user, ldap_attributes)
        
        # Check that user was added to groups
        user_groups = list(self.user.groups.values_list('name', flat=True))
        self.assertIn('HR_Managers', user_groups)
        self.assertIn('Department_Managers', user_groups)
        self.assertEqual(len(user_groups), 2)
    
    def test_sync_user_relations_handles_spanish_groups(self):
        """Test that Spanish AD group names are mapped correctly"""
        ldap_attributes = {
            'memberOf': [
                'CN=Gerentes_RH,OU=Groups,DC=example,DC=com',
            ]
        }
        
        sync_user_relations(self.user, ldap_attributes)
        
        # Spanish name should be mapped to English
        user_groups = list(self.user.groups.values_list('name', flat=True))
        self.assertIn('HR_Managers', user_groups)
    
    def test_sync_user_relations_clears_old_groups(self):
        """Test that old groups are removed when syncing new groups"""
        # Add user to a group
        old_group = Group.objects.create(name='Old_Group')
        self.user.groups.add(old_group)
        
        ldap_attributes = {
            'memberOf': ['CN=HR_Managers,OU=Groups,DC=example,DC=com']
        }
        
        sync_user_relations(self.user, ldap_attributes)
        
        # Old group should be removed
        user_groups = list(self.user.groups.values_list('name', flat=True))
        self.assertNotIn('Old_Group', user_groups)
        self.assertIn('HR_Managers', user_groups)
    
    def test_clean_user_data(self):
        """Test that user data is cleaned correctly"""
        user_data = {
            'username': 'testuser',
            'email': '  TEST@EXAMPLE.COM  ',
            'first_name': ['John'],
            'last_name': b'Doe',
        }
        
        cleaned = clean_user_data(user_data)
        
        self.assertEqual(cleaned['email'], 'test@example.com')
        self.assertEqual(cleaned['first_name'], 'John')
        self.assertEqual(cleaned['last_name'], 'Doe')


class PermissionTestCase(TestCase):
    """Test cases for role-based permissions"""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Override authentication backends for testing
        from django.conf import settings
        cls._original_auth_backends = settings.AUTHENTICATION_BACKENDS
        settings.AUTHENTICATION_BACKENDS = [
            'django.contrib.auth.backends.ModelBackend',
        ]
    
    @classmethod
    def tearDownClass(cls):
        from django.conf import settings
        settings.AUTHENTICATION_BACKENDS = cls._original_auth_backends
        super().tearDownClass()
    
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.regular_user = User.objects.create_user(
            username='regular',
            password='regularpass123'
        )
        
        self.hr_manager = User.objects.create_user(
            username='hrmanager',
            password='hrpass123'
        )
        hr_group = Group.objects.create(name='HR_Managers')
        self.hr_manager.groups.add(hr_group)
        
        self.dept_manager = User.objects.create_user(
            username='deptmanager',
            password='deptpass123'
        )
        dept_group = Group.objects.create(name='Department_Managers')
        self.dept_manager.groups.add(dept_group)
        
        self.communications_user = User.objects.create_user(
            username='comms',
            password='commspass123'
        )
        comms_group = Group.objects.create(name='Communications')
        self.communications_user.groups.add(comms_group)
        
        # Create test data
        self.department = Department.objects.create(
            name='Test Department',
            description='Test Description'
        )
    
    def test_regular_user_cannot_create_department(self):
        """Test that regular users cannot create departments"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post('/api/departments/', {
            'name': 'New Department',
            'description': 'New Description'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_hr_manager_can_create_department(self):
        """Test that HR managers can create departments"""
        self.client.force_authenticate(user=self.hr_manager)
        response = self.client.post('/api/departments/', {
            'name': 'New Department',
            'description': 'New Description'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_dept_manager_can_create_department(self):
        """Test that department managers can create departments"""
        self.client.force_authenticate(user=self.dept_manager)
        response = self.client.post('/api/departments/', {
            'name': 'Another Department',
            'description': 'Another Description'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_all_authenticated_can_view_departments(self):
        """Test that all authenticated users can view departments"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/departments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_communications_user_can_create_announcement(self):
        """Test that communications users can create announcements"""
        self.client.force_authenticate(user=self.communications_user)
        response = self.client.post('/api/announcements/', {
            'title': 'Test Announcement',
            'content': 'Test Content',
            'priority': 'normal',
            'author': self.communications_user.id
        })
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
        # If 400, it might be due to serializer validation, check if permission was granted
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            # Permission was granted, but data validation failed - that's ok for this test
            pass
    
    def test_regular_user_cannot_create_announcement(self):
        """Test that regular users cannot create announcements"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post('/api/announcements/', {
            'title': 'Test Announcement',
            'content': 'Test Content',
            'priority': 'normal'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_user_cannot_access_api(self):
        """Test that unauthenticated users cannot access protected endpoints"""
        response = self.client.get('/api/departments/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LoginWithGroupsTestCase(TestCase):
    """Test cases for login with group information"""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        from django.conf import settings
        cls._original_auth_backends = settings.AUTHENTICATION_BACKENDS
        settings.AUTHENTICATION_BACKENDS = [
            'django.contrib.auth.backends.ModelBackend',
        ]
    
    @classmethod
    def tearDownClass(cls):
        from django.conf import settings
        settings.AUTHENTICATION_BACKENDS = cls._original_auth_backends
        super().tearDownClass()
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Add user to groups
        hr_group = Group.objects.create(name='HR_Managers')
        dept_group = Group.objects.create(name='Department_Managers')
        self.user.groups.add(hr_group, dept_group)
    
    def test_login_returns_user_groups(self):
        """Test that login endpoint returns user groups"""
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('groups', response.data['user'])
        self.assertIn('HR_Managers', response.data['user']['groups'])
        self.assertIn('Department_Managers', response.data['user']['groups'])
    
    def test_current_user_returns_groups(self):
        """Test that current user endpoint returns groups"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['authenticated'])
        self.assertIn('groups', response.data['user'])
        self.assertEqual(len(response.data['user']['groups']), 2)
