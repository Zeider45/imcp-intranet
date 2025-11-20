#!/usr/bin/env python
"""
Test script to verify LDAP timeout configuration works correctly.

This script tests that:
1. LDAP timeout is configurable via environment variable
2. Default timeout is 5 seconds
3. Authentication falls back to ModelBackend after LDAP timeout
"""

import os
import sys
import time
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intranet.settings')
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.test import RequestFactory

def test_ldap_timeout():
    """Test that LDAP timeout configuration works"""
    
    print("=" * 70)
    print("Testing LDAP Timeout Configuration")
    print("=" * 70)
    
    # Test 1: Check default timeout
    print("\n1. Testing default timeout (should be 5 seconds)...")
    os.environ['AUTH_LDAP_SERVER_URI'] = 'ldap://172.16.101.106:389'
    os.environ['AUTH_LDAP_BIND_DN'] = 'CN=test,DC=test,DC=local'
    os.environ['AUTH_LDAP_BIND_PASSWORD'] = 'test'
    
    # Remove custom timeout if set
    if 'AUTH_LDAP_NETWORK_TIMEOUT' in os.environ:
        del os.environ['AUTH_LDAP_NETWORK_TIMEOUT']
    
    # Reload settings to pick up env changes
    from importlib import reload
    from intranet import settings
    reload(settings)
    
    # Check the timeout value in settings
    try:
        if hasattr(settings, 'AUTH_LDAP_CONNECTION_OPTIONS'):
            import ldap
            timeout_value = settings.AUTH_LDAP_CONNECTION_OPTIONS.get(ldap.OPT_NETWORK_TIMEOUT, 'Not set')
            print(f"   ✓ LDAP timeout configured: {timeout_value} seconds")
            if timeout_value == 5:
                print("   ✓ Default timeout is correct (5 seconds)")
            else:
                print(f"   ✗ Default timeout is wrong (expected 5, got {timeout_value})")
        else:
            print("   - LDAP not configured (no AUTH_LDAP_CONNECTION_OPTIONS)")
    except Exception as e:
        print(f"   ✗ Error checking timeout: {e}")
    
    # Test 2: Test custom timeout
    print("\n2. Testing custom timeout (3 seconds)...")
    os.environ['AUTH_LDAP_NETWORK_TIMEOUT'] = '3'
    reload(settings)
    
    try:
        if hasattr(settings, 'AUTH_LDAP_CONNECTION_OPTIONS'):
            import ldap
            timeout_value = settings.AUTH_LDAP_CONNECTION_OPTIONS.get(ldap.OPT_NETWORK_TIMEOUT, 'Not set')
            print(f"   ✓ LDAP timeout configured: {timeout_value} seconds")
            if timeout_value == 3:
                print("   ✓ Custom timeout is correct (3 seconds)")
            else:
                print(f"   ✗ Custom timeout is wrong (expected 3, got {timeout_value})")
        else:
            print("   - LDAP not configured")
    except Exception as e:
        print(f"   ✗ Error checking custom timeout: {e}")
    
    # Test 3: Test authentication with timeout and fallback
    print("\n3. Testing authentication fallback after LDAP timeout...")
    
    # Create a test user in local database
    try:
        user, created = User.objects.get_or_create(
            username='timeouttest',
            defaults={
                'email': 'test@test.com',
                'first_name': 'Timeout',
                'last_name': 'Test'
            }
        )
        user.set_password('testpass123')
        user.save()
        
        if created:
            print("   ✓ Created test user 'timeouttest'")
        else:
            print("   ✓ Test user 'timeouttest' already exists")
        
        # Test authentication with LDAP configured but unreachable
        factory = RequestFactory()
        request = factory.post('/api/auth/login/')
        
        print("   - Attempting authentication (will timeout and fallback)...")
        start_time = time.time()
        auth_user = authenticate(request, username='timeouttest', password='testpass123')
        elapsed_time = time.time() - start_time
        
        if auth_user is not None:
            print(f"   ✓ Authentication successful after {elapsed_time:.2f} seconds")
            print(f"   ✓ User: {auth_user.username}")
            if elapsed_time < 6:
                print(f"   ✓ Timeout worked correctly (< 6 seconds)")
            else:
                print(f"   ⚠ Authentication took longer than expected ({elapsed_time:.2f}s > 6s)")
        else:
            print(f"   ✗ Authentication failed after {elapsed_time:.2f} seconds")
        
        # Clean up
        if created:
            user.delete()
            print("   ✓ Cleaned up test user")
            
    except Exception as e:
        print(f"   ✗ Error testing authentication: {e}")
        import traceback
        traceback.print_exc()
    
    # Clean up environment
    for key in ['AUTH_LDAP_SERVER_URI', 'AUTH_LDAP_BIND_DN', 'AUTH_LDAP_BIND_PASSWORD', 'AUTH_LDAP_NETWORK_TIMEOUT']:
        if key in os.environ:
            del os.environ[key]
    
    print("\n" + "=" * 70)
    print("LDAP Timeout Configuration Test Complete")
    print("=" * 70)

if __name__ == '__main__':
    test_ldap_timeout()
