from django.test import TestCase, Client
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Department, LibraryDocument


class DepartmentModelTest(TestCase):
    """Test cases for Department model"""
    
    def setUp(self):
        self.department = Department.objects.create(
            name="IT Department",
            description="Information Technology Department"
        )
    
    def test_department_creation(self):
        """Test department is created correctly"""
        self.assertEqual(self.department.name, "IT Department")
        self.assertEqual(str(self.department), "IT Department")
    
    def test_department_ordering(self):
        """Test departments are ordered by name"""
        dept2 = Department.objects.create(name="HR Department")
        departments = Department.objects.all()
        self.assertEqual(departments[0].name, "HR Department")
        self.assertEqual(departments[1].name, "IT Department")


class LibraryDocumentModelTest(TestCase):
    """Test cases for LibraryDocument model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        self.department = Department.objects.create(name="IT Department")
        self.document = LibraryDocument.objects.create(
            title="Test Document",
            code="DOC-001",
            description="Test document description",
            content="Test content",
            document_type="manual",
            author=self.user,
            department=self.department
        )
    
    def test_document_creation(self):
        """Test library document is created correctly"""
        self.assertEqual(self.document.title, "Test Document")
        self.assertEqual(self.document.code, "DOC-001")
        self.assertEqual(self.document.author, self.user)
        self.assertEqual(self.document.status, "draft")
    
    def test_document_str(self):
        """Test document string representation"""
        self.assertEqual(str(self.document), "DOC-001 - Test Document")
    
    def test_document_default_status(self):
        """Test document default status is draft"""
        self.assertEqual(self.document.status, "draft")
        self.assertEqual(self.document.approval_decision, "pending")


class AuthenticationEndpointsTest(TestCase):
    """Test cases for authentication endpoints"""
    
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
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="ldapuser",
            email="ldapuser@example.com",
            password="ldappass123",
            first_name="LDAP",
            last_name="User"
        )
        self.department = Department.objects.create(name="IT Department")
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = self.client.post('/api/auth/login/', {
            'username': 'ldapuser',
            'password': 'ldappass123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'ldapuser')
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post('/api/auth/login/', {
            'username': 'ldapuser',
            'password': 'wrongpassword'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_login_missing_credentials(self):
        """Test login with missing credentials"""
        response = self.client.post('/api/auth/login/', {
            'username': 'ldapuser'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_current_user_authenticated(self):
        """Test getting current user when authenticated"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['authenticated'])
        self.assertEqual(response.data['user']['username'], 'ldapuser')
    
    def test_current_user_not_authenticated(self):
        """Test getting current user when not authenticated"""
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['authenticated'])
    
    def test_logout(self):
        """Test logout functionality"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
    
    def test_logout_without_csrf_token(self):
        """Test logout works without CSRF token (should not return 403)"""
        # Use Django's test client to simulate a real HTTP request without CSRF token
        django_client = Client(enforce_csrf_checks=True)
        
        # Login first
        django_client.force_login(self.user)
        
        # Try to logout without CSRF token - should succeed (no 403)
        response = django_client.post(
            '/api/auth/logout/',
            content_type='application/json'
        )
        
        # Should succeed without CSRF token
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data['success'])


class APIEndpointsTest(TestCase):
    """Test cases for API endpoints"""
    
    def setUp(self):
        from django.contrib.auth.models import Group
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        # Add user to HR_Managers group so they can create departments
        hr_group = Group.objects.create(name='HR_Managers')
        self.user.groups.add(hr_group)
        
        self.department = Department.objects.create(
            name="Test Department",
            description="Test Description"
        )
        
        # Authenticate the client
        self.client.force_authenticate(user=self.user)
    
    def test_health_check_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'ok')
    
    def test_welcome_endpoint(self):
        """Test welcome endpoint"""
        response = self.client.get('/api/welcome/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
    
    def test_department_list_endpoint(self):
        """Test department list endpoint"""
        response = self.client.get('/api/departments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
    
    def test_department_create_endpoint(self):
        """Test department creation endpoint"""
        data = {
            'name': 'New Department',
            'description': 'New Description'
        }
        response = self.client.post('/api/departments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Department')


class LibraryDocumentEndpointsTest(TestCase):
    """Test cases for Library Document API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        self.department = Department.objects.create(
            name="Test Department",
            description="Test Description"
        )
        
        # Authenticate the client
        self.client.force_authenticate(user=self.user)
    
    def test_library_document_list_endpoint(self):
        """Test library document list endpoint"""
        response = self.client.get('/api/library-documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_library_document_create_endpoint(self):
        """Test library document creation endpoint"""
        data = {
            'title': 'New Document',
            'code': 'DOC-TEST-001',
            'description': 'Test description',
            'content': 'Test content',
            'document_type': 'manual',
            'version': '1.0',
            'author': self.user.id
        }
        response = self.client.post('/api/library-documents/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Document')
        self.assertEqual(response.data['status'], 'draft')
    
    def test_library_document_submit_for_approval(self):
        """Test submitting document for approval"""
        document = LibraryDocument.objects.create(
            title="Test Document",
            code="DOC-TEST-002",
            content="Test content",
            document_type="manual",
            author=self.user,
            status="draft"
        )
        response = self.client.post(f'/api/library-documents/{document.id}/submit_for_approval/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'pending_approval')
    
    def test_library_document_approve(self):
        """Test approving document"""
        document = LibraryDocument.objects.create(
            title="Test Document",
            code="DOC-TEST-003",
            content="Test content",
            document_type="manual",
            author=self.user,
            status="pending_approval"
        )
        response = self.client.post(f'/api/library-documents/{document.id}/approve/', {
            'observations': 'Approved successfully'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')
        self.assertEqual(response.data['approval_decision'], 'approved')
    
    def test_library_document_reject(self):
        """Test rejecting document"""
        document = LibraryDocument.objects.create(
            title="Test Document",
            code="DOC-TEST-004",
            content="Test content",
            document_type="manual",
            author=self.user,
            status="pending_approval"
        )
        response = self.client.post(f'/api/library-documents/{document.id}/reject/', {
            'reason': 'Needs more work'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'rejected')
        self.assertEqual(response.data['approval_decision'], 'rejected')
    
    def test_library_document_publish(self):
        """Test publishing approved document"""
        document = LibraryDocument.objects.create(
            title="Test Document",
            code="DOC-TEST-005",
            content="Test content",
            document_type="manual",
            author=self.user,
            status="approved"
        )
        response = self.client.post(f'/api/library-documents/{document.id}/publish/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'published')
    
    def test_library_document_published_endpoint(self):
        """Test published documents endpoint"""
        LibraryDocument.objects.create(
            title="Published Document",
            code="DOC-TEST-006",
            content="Test content",
            document_type="manual",
            author=self.user,
            status="published"
        )
        response = self.client.get('/api/library-documents/published/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LibraryDocumentGroupFilteringTest(TestCase):
    """Test cases for group-based document filtering"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create groups
        self.group_hr = Group.objects.create(name='HR_Managers')
        self.group_it = Group.objects.create(name='IT_Department')
        
        # Create users
        self.user_hr = User.objects.create_user(
            username="hr_user",
            email="hr@example.com",
            password="testpass123"
        )
        self.user_hr.groups.add(self.group_hr)
        
        self.user_it = User.objects.create_user(
            username="it_user",
            email="it@example.com",
            password="testpass123"
        )
        self.user_it.groups.add(self.group_it)
        
        self.user_no_groups = User.objects.create_user(
            username="no_group_user",
            email="nogroup@example.com",
            password="testpass123"
        )
        
        # Create documents
        self.doc_public = LibraryDocument.objects.create(
            title="Public Document",
            code="DOC-PUBLIC-001",
            content="Available to everyone",
            document_type="manual",
            author=self.user_hr,
            status="published"
        )
        # No groups assigned - accessible to all
        
        self.doc_hr = LibraryDocument.objects.create(
            title="HR Document",
            code="DOC-HR-001",
            content="Only for HR",
            document_type="policy",
            author=self.user_hr,
            status="published"
        )
        self.doc_hr.groups.add(self.group_hr)
        
        self.doc_it = LibraryDocument.objects.create(
            title="IT Document",
            code="DOC-IT-001",
            content="Only for IT",
            document_type="manual",
            author=self.user_it,
            status="published"
        )
        self.doc_it.groups.add(self.group_it)
        
        self.doc_both = LibraryDocument.objects.create(
            title="HR and IT Document",
            code="DOC-BOTH-001",
            content="For HR and IT",
            document_type="guide",
            author=self.user_hr,
            status="published"
        )
        self.doc_both.groups.add(self.group_hr, self.group_it)
    
    def test_hr_user_sees_correct_documents(self):
        """Test HR user can see public, HR, and shared documents"""
        self.client.force_authenticate(user=self.user_hr)
        response = self.client.get('/api/library-documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # HR user should see: public, HR-only, and HR+IT documents
        doc_codes = [doc['code'] for doc in response.data['results']]
        self.assertIn('DOC-PUBLIC-001', doc_codes)
        self.assertIn('DOC-HR-001', doc_codes)
        self.assertIn('DOC-BOTH-001', doc_codes)
        self.assertNotIn('DOC-IT-001', doc_codes)  # Should not see IT-only
    
    def test_it_user_sees_correct_documents(self):
        """Test IT user can see public, IT, and shared documents"""
        self.client.force_authenticate(user=self.user_it)
        response = self.client.get('/api/library-documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # IT user should see: public, IT-only, and HR+IT documents
        doc_codes = [doc['code'] for doc in response.data['results']]
        self.assertIn('DOC-PUBLIC-001', doc_codes)
        self.assertIn('DOC-IT-001', doc_codes)
        self.assertIn('DOC-BOTH-001', doc_codes)
        self.assertNotIn('DOC-HR-001', doc_codes)  # Should not see HR-only
    
    def test_user_no_groups_sees_only_public(self):
        """Test user with no groups can only see public documents"""
        self.client.force_authenticate(user=self.user_no_groups)
        response = self.client.get('/api/library-documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # User with no groups should only see public documents
        doc_codes = [doc['code'] for doc in response.data['results']]
        self.assertIn('DOC-PUBLIC-001', doc_codes)
        self.assertNotIn('DOC-HR-001', doc_codes)
        self.assertNotIn('DOC-IT-001', doc_codes)
        self.assertNotIn('DOC-BOTH-001', doc_codes)
    
    def test_unauthenticated_user_sees_only_public(self):
        """Test unauthenticated user can only see public documents"""
        # No authentication
        response = self.client.get('/api/library-documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Unauthenticated user should only see public documents
        doc_codes = [doc['code'] for doc in response.data['results']]
        self.assertIn('DOC-PUBLIC-001', doc_codes)
        self.assertNotIn('DOC-HR-001', doc_codes)
        self.assertNotIn('DOC-IT-001', doc_codes)
        self.assertNotIn('DOC-BOTH-001', doc_codes)
    
    def test_documents_count_filtered_by_groups(self):
        """Test documents count endpoint filters by user groups"""
        # HR user
        self.client.force_authenticate(user=self.user_hr)
        response = self.client.get('/api/metrics/documents-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)  # Public, HR, and Both
        
        # IT user
        self.client.force_authenticate(user=self.user_it)
        response = self.client.get('/api/metrics/documents-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)  # Public, IT, and Both
        
        # User with no groups
        self.client.force_authenticate(user=self.user_no_groups)
        response = self.client.get('/api/metrics/documents-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)  # Only Public
        
        # Unauthenticated user
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/metrics/documents-count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)  # Only Public
