"""
Tests for the sync_ldap_users management command.

This test module validates that the LDAP synchronization command correctly
handles different LDAP filter configurations, especially the distinction between
authentication filters (with %(user)s placeholder) and sync filters.
"""
from django.test import TestCase
from django.core.management import call_command
from django.core.management.base import CommandError
from io import StringIO
from unittest.mock import patch, MagicMock
import os


class SyncLDAPUsersFilterTestCase(TestCase):
    """Test cases for LDAP filter handling in sync_ldap_users command"""

    @patch.dict(os.environ, {
        'AUTH_LDAP_SERVER_URI': 'ldap://test.example.com:389',
        'AUTH_LDAP_BIND_DN': 'CN=test,DC=example,DC=com',
        'AUTH_LDAP_BIND_PASSWORD': 'testpass',
        'AUTH_LDAP_USER_SEARCH_BASE': 'DC=example,DC=com',
        'AUTH_LDAP_USER_SEARCH_FILTER': '(sAMAccountName=%(user)s)',
    })
    @patch('api.management.commands.sync_ldap_users.Connection')
    @patch('api.management.commands.sync_ldap_users.Server')
    def test_sync_command_ignores_auth_filter_with_placeholder(self, mock_server, mock_connection):
        """
        Test that sync_ldap_users command doesn't use AUTH_LDAP_USER_SEARCH_FILTER
        when it contains the %(user)s placeholder (meant for authentication).
        
        This test verifies the fix for the "malformed filter" error that occurred
        when AUTH_LDAP_USER_SEARCH_FILTER contained %(user)s placeholder.
        """
        # Setup mock connection
        mock_conn_instance = MagicMock()
        mock_conn_instance.entries = []
        mock_connection.return_value = mock_conn_instance
        
        out = StringIO()
        
        # Run the sync command
        call_command('sync_ldap_users', '--dry-run', stdout=out)
        
        # Verify that search was called
        self.assertTrue(mock_conn_instance.search.called)
        
        # Get the filter argument from the search call
        search_call_args = mock_conn_instance.search.call_args
        search_filter = search_call_args[0][1]  # Second positional argument is the filter
        
        # The filter should NOT contain %(user)s placeholder
        self.assertNotIn('%(user)s', search_filter)
        
        # The filter should be the default sync filter
        expected_default = '(&(objectClass=user)(sAMAccountName=*)(!(objectClass=computer)))'
        self.assertEqual(search_filter, expected_default)

    @patch.dict(os.environ, {
        'AUTH_LDAP_SERVER_URI': 'ldap://test.example.com:389',
        'AUTH_LDAP_BIND_DN': 'CN=test,DC=example,DC=com',
        'AUTH_LDAP_BIND_PASSWORD': 'testpass',
        'AUTH_LDAP_USER_SEARCH_BASE': 'DC=example,DC=com',
        'AUTH_LDAP_SYNC_FILTER': '(&(objectClass=person)(cn=*))',
    })
    @patch('api.management.commands.sync_ldap_users.Connection')
    @patch('api.management.commands.sync_ldap_users.Server')
    def test_sync_command_uses_dedicated_sync_filter(self, mock_server, mock_connection):
        """
        Test that sync_ldap_users command uses AUTH_LDAP_SYNC_FILTER
        when provided.
        """
        # Setup mock connection
        mock_conn_instance = MagicMock()
        mock_conn_instance.entries = []
        mock_connection.return_value = mock_conn_instance
        
        out = StringIO()
        
        # Run the sync command
        call_command('sync_ldap_users', '--dry-run', stdout=out)
        
        # Verify that search was called
        self.assertTrue(mock_conn_instance.search.called)
        
        # Get the filter argument from the search call
        search_call_args = mock_conn_instance.search.call_args
        search_filter = search_call_args[0][1]  # Second positional argument is the filter
        
        # The filter should be the custom sync filter
        self.assertEqual(search_filter, '(&(objectClass=person)(cn=*))')

    @patch.dict(os.environ, {
        'AUTH_LDAP_SERVER_URI': 'ldap://test.example.com:389',
        'AUTH_LDAP_BIND_DN': 'CN=test,DC=example,DC=com',
        'AUTH_LDAP_BIND_PASSWORD': 'testpass',
        'AUTH_LDAP_USER_SEARCH_BASE': 'DC=example,DC=com',
    })
    @patch('api.management.commands.sync_ldap_users.Connection')
    @patch('api.management.commands.sync_ldap_users.Server')
    def test_sync_command_uses_default_filter_when_no_env_set(self, mock_server, mock_connection):
        """
        Test that sync_ldap_users command uses default filter
        when no environment variables are set.
        """
        # Setup mock connection
        mock_conn_instance = MagicMock()
        mock_conn_instance.entries = []
        mock_connection.return_value = mock_conn_instance
        
        out = StringIO()
        
        # Run the sync command
        call_command('sync_ldap_users', '--dry-run', stdout=out)
        
        # Verify that search was called
        self.assertTrue(mock_conn_instance.search.called)
        
        # Get the filter argument from the search call
        search_call_args = mock_conn_instance.search.call_args
        search_filter = search_call_args[0][1]  # Second positional argument is the filter
        
        # The filter should be the default sync filter
        expected_default = '(&(objectClass=user)(sAMAccountName=*)(!(objectClass=computer)))'
        self.assertEqual(search_filter, expected_default)

    @patch.dict(os.environ, {
        'AUTH_LDAP_SERVER_URI': 'ldap://test.example.com:389',
        'AUTH_LDAP_BIND_DN': 'CN=test,DC=example,DC=com',
        'AUTH_LDAP_BIND_PASSWORD': 'testpass',
        'AUTH_LDAP_USER_SEARCH_BASE': 'DC=example,DC=com',
    })
    @patch('api.management.commands.sync_ldap_users.Connection')
    @patch('api.management.commands.sync_ldap_users.Server')
    def test_sync_command_uses_cli_filter_override(self, mock_server, mock_connection):
        """
        Test that sync_ldap_users command uses --filter CLI argument
        when provided, overriding all other sources.
        """
        # Setup mock connection
        mock_conn_instance = MagicMock()
        mock_conn_instance.entries = []
        mock_connection.return_value = mock_conn_instance
        
        out = StringIO()
        custom_filter = '(&(objectClass=user)(department=IT))'
        
        # Run the sync command with custom filter
        call_command('sync_ldap_users', '--dry-run', f'--filter={custom_filter}', stdout=out)
        
        # Verify that search was called
        self.assertTrue(mock_conn_instance.search.called)
        
        # Get the filter argument from the search call
        search_call_args = mock_conn_instance.search.call_args
        search_filter = search_call_args[0][1]  # Second positional argument is the filter
        
        # The filter should be the CLI-provided filter
        self.assertEqual(search_filter, custom_filter)

    @patch.dict(os.environ, {})
    def test_sync_command_requires_server_uri(self):
        """
        Test that sync_ldap_users command raises error when
        AUTH_LDAP_SERVER_URI is not set.
        """
        out = StringIO()
        
        with self.assertRaises(CommandError) as cm:
            call_command('sync_ldap_users', '--dry-run', stdout=out)
        
        self.assertIn('AUTH_LDAP_SERVER_URI', str(cm.exception))

    @patch.dict(os.environ, {
        'AUTH_LDAP_SERVER_URI': 'ldap://test.example.com:389',
    })
    def test_sync_command_requires_search_base(self):
        """
        Test that sync_ldap_users command raises error when
        AUTH_LDAP_USER_SEARCH_BASE is not set and --base is not provided.
        """
        out = StringIO()
        
        with self.assertRaises(CommandError) as cm:
            call_command('sync_ldap_users', '--dry-run', stdout=out)
        
        self.assertIn('AUTH_LDAP_USER_SEARCH_BASE', str(cm.exception))
