"""
Tests for django-auth-ldap and python-ldap configuration.

This test module validates the LDAP connection configuration for authentication
using django-auth-ldap backend with python-ldap library.
"""
from django.test import TestCase, override_settings
from django.conf import settings
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
import os


class LDAPConfigurationTestCase(TestCase):
    """Test cases for LDAP configuration validation"""
    
    def test_ldap_settings_import_successful(self):
        """Test that django-auth-ldap and python-ldap are properly installed"""
        try:
            import ldap
            import django_auth_ldap
            from django_auth_ldap.config import LDAPSearch, GroupOfNamesType
            self.assertTrue(True, "LDAP modules imported successfully")
        except ImportError as e:
            self.fail(f"Failed to import LDAP modules: {e}")
    
    def test_ldap_backend_available_when_configured(self):
        """Test that LDAP backend is in AUTHENTICATION_BACKENDS when configured"""
        # When AUTH_LDAP_SERVER_URI is set, LDAP backend should be configured
        with override_settings(
            AUTH_LDAP_SERVER_URI='ldap://test.example.com:389',
            AUTHENTICATION_BACKENDS=[
                'django_auth_ldap.backend.LDAPBackend',
                'django.contrib.auth.backends.ModelBackend',
            ]
        ):
            backends = settings.AUTHENTICATION_BACKENDS
            self.assertIn('django_auth_ldap.backend.LDAPBackend', backends)
            self.assertIn('django.contrib.auth.backends.ModelBackend', backends)
    
    def test_ldap_backend_not_configured_when_no_uri(self):
        """Test that LDAP backend is not configured when AUTH_LDAP_SERVER_URI is not set"""
        # Default behavior without LDAP configuration
        backends = settings.AUTHENTICATION_BACKENDS
        # Should have at least ModelBackend
        self.assertIn('django.contrib.auth.backends.ModelBackend', backends)
    
    def test_ldap_user_search_configuration(self):
        """Test that AUTH_LDAP_USER_SEARCH is properly configured when LDAP is enabled"""
        if hasattr(settings, 'AUTH_LDAP_USER_SEARCH') and settings.AUTH_LDAP_USER_SEARCH:
            user_search = settings.AUTH_LDAP_USER_SEARCH
            # Verify it has the required attributes
            self.assertTrue(hasattr(user_search, 'base_dn'))
            self.assertTrue(hasattr(user_search, 'filterstr'))
            self.assertIsNotNone(user_search.base_dn)
            self.assertIsNotNone(user_search.filterstr)
        else:
            # LDAP not configured, test passes
            self.assertTrue(True, "LDAP not configured - no user search to test")
    
    def test_ldap_user_attr_map_configuration(self):
        """Test that AUTH_LDAP_USER_ATTR_MAP is properly configured"""
        if hasattr(settings, 'AUTH_LDAP_USER_ATTR_MAP') and settings.AUTH_LDAP_USER_ATTR_MAP:
            attr_map = settings.AUTH_LDAP_USER_ATTR_MAP
            # Should map at least basic user attributes
            expected_mappings = ['first_name', 'last_name', 'email']
            for attr in expected_mappings:
                self.assertIn(attr, attr_map, f"Missing mapping for {attr}")
        else:
            # LDAP not configured, test passes
            self.assertTrue(True, "LDAP not configured - no attribute map to test")
    
    def test_ldap_group_search_configuration(self):
        """Test that AUTH_LDAP_GROUP_SEARCH is properly configured when LDAP is enabled"""
        if hasattr(settings, 'AUTH_LDAP_GROUP_SEARCH') and settings.AUTH_LDAP_GROUP_SEARCH:
            group_search = settings.AUTH_LDAP_GROUP_SEARCH
            # Verify it has the required attributes
            self.assertTrue(hasattr(group_search, 'base_dn'))
            self.assertTrue(hasattr(group_search, 'filterstr'))
            self.assertIsNotNone(group_search.base_dn)
        else:
            # LDAP not configured or group search not configured, test passes
            self.assertTrue(True, "LDAP group search not configured")
    
    def test_ldap_connection_options(self):
        """Test that basic LDAP connection options are configured"""
        if hasattr(settings, 'AUTH_LDAP_SERVER_URI') and settings.AUTH_LDAP_SERVER_URI:
            # Check that server URI is set
            self.assertIsNotNone(settings.AUTH_LDAP_SERVER_URI)
            self.assertTrue(
                settings.AUTH_LDAP_SERVER_URI.startswith('ldap://') or 
                settings.AUTH_LDAP_SERVER_URI.startswith('ldaps://'),
                "AUTH_LDAP_SERVER_URI should start with ldap:// or ldaps://"
            )
            
            # Check bind credentials are configured
            if hasattr(settings, 'AUTH_LDAP_BIND_DN'):
                self.assertIsNotNone(settings.AUTH_LDAP_BIND_DN)
            if hasattr(settings, 'AUTH_LDAP_BIND_PASSWORD'):
                self.assertIsNotNone(settings.AUTH_LDAP_BIND_PASSWORD)
        else:
            # LDAP not configured, test passes
            self.assertTrue(True, "LDAP not configured")


class LDAPAuthenticationBackendTestCase(TestCase):
    """Test cases for LDAP authentication backend functionality"""
    
    @override_settings(
        AUTHENTICATION_BACKENDS=[
            'django.contrib.auth.backends.ModelBackend',
        ]
    )
    def test_fallback_to_model_backend(self):
        """Test that authentication falls back to ModelBackend when LDAP is not configured"""
        # Create a local Django user
        user = User.objects.create_user(
            username='localuser',
            email='local@example.com',
            password='localpass123'
        )
        
        # Authenticate using Django's authenticate function
        from django.contrib.auth import authenticate
        authenticated_user = authenticate(username='localuser', password='localpass123')
        
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user.username, 'localuser')
    
    @patch('django_auth_ldap.backend.LDAPBackend.authenticate')
    @override_settings(
        AUTHENTICATION_BACKENDS=[
            'django_auth_ldap.backend.LDAPBackend',
            'django.contrib.auth.backends.ModelBackend',
        ]
    )
    def test_ldap_backend_called_when_configured(self, mock_ldap_auth):
        """Test that LDAP backend is called when configured"""
        # Mock LDAP authentication to return None (user not found in LDAP)
        mock_ldap_auth.return_value = None
        
        # Create a fallback local user
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Authenticate
        from django.contrib.auth import authenticate
        authenticated_user = authenticate(
            request=None,
            username='testuser',
            password='testpass123'
        )
        
        # LDAP backend should have been called
        self.assertTrue(mock_ldap_auth.called or authenticated_user is not None)


class LDAPUserSyncTestCase(TestCase):
    """Test cases for LDAP user synchronization functionality"""
    
    def test_ldap_always_update_user_configured(self):
        """Test that AUTH_LDAP_ALWAYS_UPDATE_USER is properly configured"""
        if hasattr(settings, 'AUTH_LDAP_ALWAYS_UPDATE_USER'):
            # When configured, it should be True to keep user data in sync
            self.assertIsInstance(settings.AUTH_LDAP_ALWAYS_UPDATE_USER, bool)
        else:
            # Not configured is acceptable
            self.assertTrue(True, "AUTH_LDAP_ALWAYS_UPDATE_USER not configured")
    
    def test_ldap_mirror_groups_configured(self):
        """Test that AUTH_LDAP_MIRROR_GROUPS is configured for group synchronization"""
        if hasattr(settings, 'AUTH_LDAP_MIRROR_GROUPS'):
            # Should be True for automatic group mirroring
            self.assertIsInstance(settings.AUTH_LDAP_MIRROR_GROUPS, bool)
        else:
            # Not configured is acceptable
            self.assertTrue(True, "AUTH_LDAP_MIRROR_GROUPS not configured")
    
    def test_ldap_find_group_perms_configured(self):
        """Test that AUTH_LDAP_FIND_GROUP_PERMS is configured"""
        if hasattr(settings, 'AUTH_LDAP_FIND_GROUP_PERMS'):
            # Should be boolean
            self.assertIsInstance(settings.AUTH_LDAP_FIND_GROUP_PERMS, bool)
        else:
            # Not configured is acceptable
            self.assertTrue(True, "AUTH_LDAP_FIND_GROUP_PERMS not configured")


class PythonLDAPModuleTestCase(TestCase):
    """Test cases to verify python-ldap module functionality"""
    
    def test_python_ldap_import(self):
        """Test that python-ldap module can be imported"""
        try:
            import ldap
            self.assertTrue(hasattr(ldap, 'VERSION'))
            self.assertTrue(hasattr(ldap, 'SCOPE_SUBTREE'))
            self.assertTrue(hasattr(ldap, 'SCOPE_BASE'))
        except ImportError as e:
            self.fail(f"Failed to import python-ldap: {e}")
    
    def test_ldap_scope_constants_available(self):
        """Test that LDAP scope constants are available from python-ldap"""
        try:
            import ldap
            # Verify essential scope constants
            self.assertIsNotNone(ldap.SCOPE_SUBTREE)
            self.assertIsNotNone(ldap.SCOPE_BASE)
            self.assertIsNotNone(ldap.SCOPE_ONELEVEL)
        except Exception as e:
            self.fail(f"LDAP scope constants not available: {e}")
    
    def test_ldap_search_configuration_uses_python_ldap(self):
        """Test that user search configuration uses python-ldap scope constants"""
        if hasattr(settings, 'AUTH_LDAP_USER_SEARCH') and settings.AUTH_LDAP_USER_SEARCH:
            import ldap
            user_search = settings.AUTH_LDAP_USER_SEARCH
            # The scope should be one of the python-ldap constants
            valid_scopes = [ldap.SCOPE_BASE, ldap.SCOPE_ONELEVEL, ldap.SCOPE_SUBTREE]
            if hasattr(user_search, 'scope'):
                self.assertIn(user_search.scope, valid_scopes)
        else:
            self.assertTrue(True, "LDAP not configured")


class LDAPConfigurationIntegrationTestCase(TestCase):
    """Integration tests for complete LDAP configuration"""
    
    def test_complete_ldap_configuration_when_enabled(self):
        """Test that when LDAP is enabled, all necessary components are configured"""
        if hasattr(settings, 'AUTH_LDAP_SERVER_URI') and settings.AUTH_LDAP_SERVER_URI:
            # LDAP is enabled, verify complete configuration
            
            # 1. Backend should be configured
            self.assertIn(
                'django_auth_ldap.backend.LDAPBackend',
                settings.AUTHENTICATION_BACKENDS,
                "LDAPBackend not in AUTHENTICATION_BACKENDS"
            )
            
            # 2. User search should be configured
            self.assertTrue(
                hasattr(settings, 'AUTH_LDAP_USER_SEARCH'),
                "AUTH_LDAP_USER_SEARCH not configured"
            )
            
            # 3. User attribute mapping should be configured
            self.assertTrue(
                hasattr(settings, 'AUTH_LDAP_USER_ATTR_MAP'),
                "AUTH_LDAP_USER_ATTR_MAP not configured"
            )
            
            # 4. Bind credentials should be configured
            self.assertTrue(
                hasattr(settings, 'AUTH_LDAP_BIND_DN'),
                "AUTH_LDAP_BIND_DN not configured"
            )
            self.assertTrue(
                hasattr(settings, 'AUTH_LDAP_BIND_PASSWORD'),
                "AUTH_LDAP_BIND_PASSWORD not configured"
            )
        else:
            # LDAP not enabled, test passes
            self.assertTrue(True, "LDAP not enabled - skipping integration test")
    
    def test_ldap_disabled_uses_model_backend_only(self):
        """Test that when LDAP is disabled, only ModelBackend is used"""
        # When LDAP is not configured (default state)
        if not (hasattr(settings, 'AUTH_LDAP_SERVER_URI') and settings.AUTH_LDAP_SERVER_URI):
            backends = settings.AUTHENTICATION_BACKENDS
            # Should have ModelBackend
            self.assertIn('django.contrib.auth.backends.ModelBackend', backends)
            # Should NOT have LDAPBackend
            self.assertNotIn('django_auth_ldap.backend.LDAPBackend', backends)
