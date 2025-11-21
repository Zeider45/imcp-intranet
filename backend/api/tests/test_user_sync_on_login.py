"""
Test cases for user synchronization on login.

This module tests that users are properly created and updated
in the database when they log in, including their profiles.
"""
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from rest_framework import status
from api.models import UserProfile


class UserSyncOnLoginTest(TestCase):
    """Test cases for user creation and update on login"""
    
    @classmethod
    def setUpClass(cls):
        """Override authentication backends for testing"""
        super().setUpClass()
        from django.conf import settings
        # Only use ModelBackend for tests to avoid LDAP connection attempts
        cls._original_auth_backends = settings.AUTHENTICATION_BACKENDS
        settings.AUTHENTICATION_BACKENDS = [
            'django.contrib.auth.backends.ModelBackend',
        ]
    
    @classmethod
    def tearDownClass(cls):
        """Restore original authentication backends"""
        from django.conf import settings
        settings.AUTHENTICATION_BACKENDS = cls._original_auth_backends
        super().tearDownClass()
    
    def setUp(self):
        """Set up test client and initial data"""
        self.client = APIClient()
    
    def test_new_user_created_on_first_login(self):
        """Test that a new user is created when they log in for the first time"""
        # Create a user that will be authenticated
        User.objects.create_user(
            username='newuser',
            email='newuser@example.com',
            password='password123',
            first_name='New',
            last_name='User'
        )
        
        # Verify user exists before login
        user = User.objects.get(username='newuser')
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')
        
        # Verify profile was created by signal
        profile = UserProfile.objects.get(user=user)
        self.assertIsNotNone(profile)
        
        # Login
        response = self.client.post('/api/auth/login/', {
            'username': 'newuser',
            'password': 'password123'
        }, format='json')
        
        # Verify successful login
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertEqual(response.data['user']['first_name'], 'New')
        self.assertEqual(response.data['user']['last_name'], 'User')
    
    def test_existing_user_profile_ensured_on_login(self):
        """Test that user profile is ensured to exist on login"""
        # Create user without profile (simulate edge case)
        user = User.objects.create_user(
            username='noprofileuser',
            email='noprofile@example.com',
            password='password123'
        )
        
        # Delete the profile that was auto-created by signal
        UserProfile.objects.filter(user=user).delete()
        
        # Verify no profile exists
        self.assertFalse(UserProfile.objects.filter(user=user).exists())
        
        # Login - this should create the profile
        response = self.client.post('/api/auth/login/', {
            'username': 'noprofileuser',
            'password': 'password123'
        }, format='json')
        
        # Verify successful login
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify profile now exists
        self.assertTrue(UserProfile.objects.filter(user=user).exists())
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.user, user)
    
    def test_user_data_persisted_on_login(self):
        """Test that user data is properly persisted on each login"""
        # Create a user
        user = User.objects.create_user(
            username='persistuser',
            email='original@example.com',
            password='password123',
            first_name='Original',
            last_name='Name'
        )
        
        # First login
        response = self.client.post('/api/auth/login/', {
            'username': 'persistuser',
            'password': 'password123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify user data is returned correctly
        self.assertEqual(response.data['user']['email'], 'original@example.com')
        self.assertEqual(response.data['user']['first_name'], 'Original')
        self.assertEqual(response.data['user']['last_name'], 'Name')
        
        # Refresh user from database to ensure data persisted
        user.refresh_from_db()
        self.assertEqual(user.email, 'original@example.com')
        self.assertEqual(user.first_name, 'Original')
        self.assertEqual(user.last_name, 'Name')
    
    def test_user_groups_returned_on_login(self):
        """Test that user groups are properly returned on login"""
        # Create user and groups
        user = User.objects.create_user(
            username='groupuser',
            email='groupuser@example.com',
            password='password123'
        )
        
        # Create and assign groups
        hr_group = Group.objects.create(name='HR_Managers')
        dept_group = Group.objects.create(name='Department_Managers')
        user.groups.add(hr_group, dept_group)
        
        # Login
        response = self.client.post('/api/auth/login/', {
            'username': 'groupuser',
            'password': 'password123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify groups are returned
        user_groups = response.data['user']['groups']
        self.assertEqual(len(user_groups), 2)
        self.assertIn('HR_Managers', user_groups)
        self.assertIn('Department_Managers', user_groups)
    
    def test_login_with_different_username_formats(self):
        """Test that login works with different username formats (domain\\user, user@domain)"""
        # Create a user
        User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123'
        )
        
        # Test DOMAIN\username format
        response = self.client.post('/api/auth/login/', {
            'username': r'DOMAIN\testuser',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testuser')
        
        # Test username@domain format
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser@domain.com',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testuser')
        
        # Test plain username
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'password123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_profile_data_returned_on_login(self):
        """Test that profile data is returned on successful login"""
        from api.models import Department
        
        # Create user with profile
        user = User.objects.create_user(
            username='profileuser',
            email='profileuser@example.com',
            password='password123'
        )
        
        # Create department and update profile
        dept = Department.objects.create(name='IT Department')
        profile = UserProfile.objects.get(user=user)
        profile.department = dept
        profile.position = 'Software Developer'
        profile.phone = '555-1234'
        profile.save()
        
        # Login
        response = self.client.post('/api/auth/login/', {
            'username': 'profileuser',
            'password': 'password123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify profile data is returned
        profile_data = response.data['profile']
        self.assertIsNotNone(profile_data)
        self.assertEqual(profile_data['department'], 'IT Department')
        self.assertEqual(profile_data['position'], 'Software Developer')
        self.assertEqual(profile_data['phone'], '555-1234')
