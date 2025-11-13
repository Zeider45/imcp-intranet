from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Department, UserProfile, Announcement, Document


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


class UserProfileModelTest(TestCase):
    """Test cases for UserProfile model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        self.department = Department.objects.create(name="IT Department")
        self.profile = UserProfile.objects.create(
            user=self.user,
            department=self.department,
            phone="123-456-7890",
            position="Developer"
        )
    
    def test_profile_creation(self):
        """Test user profile is created correctly"""
        self.assertEqual(self.profile.user, self.user)
        self.assertEqual(self.profile.department, self.department)
        self.assertEqual(self.profile.position, "Developer")


class AnnouncementModelTest(TestCase):
    """Test cases for Announcement model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username="admin", email="admin@example.com")
        self.announcement = Announcement.objects.create(
            title="Test Announcement",
            content="This is a test announcement",
            author=self.user,
            priority="high"
        )
    
    def test_announcement_creation(self):
        """Test announcement is created correctly"""
        self.assertEqual(self.announcement.title, "Test Announcement")
        self.assertEqual(self.announcement.priority, "high")
        self.assertTrue(self.announcement.is_active)


class DocumentModelTest(TestCase):
    """Test cases for Document model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username="uploader", email="uploader@example.com")
        self.department = Department.objects.create(name="HR Department")
    
    def test_document_str(self):
        """Test document string representation"""
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test.txt", b"file content", content_type="text/plain")
        document = Document.objects.create(
            title="Test Document",
            file=file,
            category="policy",
            uploaded_by=self.user
        )
        self.assertEqual(str(document), "Test Document")


class APIEndpointsTest(TestCase):
    """Test cases for API endpoints"""
    
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
    
    def test_announcement_list_endpoint(self):
        """Test announcement list endpoint"""
        Announcement.objects.create(
            title="Test Announcement",
            content="Test Content",
            author=self.user
        )
        response = self.client.get('/api/announcements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_announcement_active_endpoint(self):
        """Test active announcements endpoint"""
        Announcement.objects.create(
            title="Active Announcement",
            content="Active Content",
            author=self.user,
            is_active=True
        )
        Announcement.objects.create(
            title="Inactive Announcement",
            content="Inactive Content",
            author=self.user,
            is_active=False
        )
        response = self.client.get('/api/announcements/active/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned announcements should be active
        for announcement in response.data.get('results', response.data):
            if isinstance(announcement, dict):
                self.assertTrue(announcement.get('is_active', True))
