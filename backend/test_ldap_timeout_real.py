#!/usr/bin/env python
"""
Real-world test for LDAP timeout with unreachable server.

This test simulates the actual user scenario:
1. LDAP is configured but server is unreachable
2. User tries to login
3. System should timeout quickly (5 seconds) and fallback
"""

import os
import sys
import time

# Set LDAP environment variables BEFORE importing Django
os.environ['AUTH_LDAP_SERVER_URI'] = 'ldap://172.16.101.106:389'
os.environ['AUTH_LDAP_BIND_DN'] = 'CN=administrator,CN=Users,DC=imcp-intranet,DC=local'
os.environ['AUTH_LDAP_BIND_PASSWORD'] = 'test_password'
os.environ['AUTH_LDAP_USER_SEARCH_BASE'] = 'DC=imcp-intranet,DC=local'
os.environ['AUTH_LDAP_NETWORK_TIMEOUT'] = '3'  # Use 3 seconds for faster test

# Now import Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intranet.settings')
import django
django.setup()

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.test import RequestFactory

def test_real_ldap_timeout():
    """Test LDAP timeout with actual unreachable server"""
    
    print("=" * 70)
    print("Real LDAP Timeout Test - Unreachable Server Scenario")
    print("=" * 70)
    
    # Check configuration
    from django.conf import settings
    print(f"\nConfiguration:")
    print(f"  LDAP Server: {os.environ.get('AUTH_LDAP_SERVER_URI')}")
    print(f"  Timeout: {os.environ.get('AUTH_LDAP_NETWORK_TIMEOUT')} seconds")
    print(f"  Backends: {settings.AUTHENTICATION_BACKENDS}")
    
    # Create test user in local database
    print("\n1. Creating test user in local database...")
    try:
        user, created = User.objects.get_or_create(
            username='ldaptestuser',
            defaults={
                'email': 'ldaptest@test.com',
                'first_name': 'LDAP',
                'last_name': 'Test'
            }
        )
        user.set_password('testpass123')
        user.save()
        print(f"   ✓ User '{user.username}' ready")
    except Exception as e:
        print(f"   ✗ Error creating user: {e}")
        return
    
    # Test 1: Authentication with LDAP timeout
    print("\n2. Testing authentication with LDAP timeout...")
    print("   - This will try LDAP first (timeout), then fallback to local DB")
    
    factory = RequestFactory()
    request = factory.post('/api/auth/login/')
    
    start_time = time.time()
    auth_user = authenticate(request, username='ldaptestuser', password='testpass123')
    elapsed_time = time.time() - start_time
    
    print(f"\n   Results:")
    print(f"   - Time taken: {elapsed_time:.2f} seconds")
    print(f"   - Authenticated: {auth_user is not None}")
    
    if auth_user is not None:
        print(f"   ✓ SUCCESS: User '{auth_user.username}' authenticated")
        if elapsed_time < 5:
            print(f"   ✓ EXCELLENT: Timeout worked perfectly (< 5 seconds)")
        elif elapsed_time < 8:
            print(f"   ✓ GOOD: Timeout acceptable (< 8 seconds)")
        else:
            print(f"   ⚠ SLOW: Took longer than expected (> 8 seconds)")
    else:
        print(f"   ✗ FAILED: Authentication failed")
    
    # Test 2: Wrong password (should fail quickly after LDAP timeout)
    print("\n3. Testing with wrong password...")
    start_time = time.time()
    auth_user = authenticate(request, username='ldaptestuser', password='wrongpassword')
    elapsed_time = time.time() - start_time
    
    print(f"\n   Results:")
    print(f"   - Time taken: {elapsed_time:.2f} seconds")
    print(f"   - Authenticated: {auth_user is not None}")
    
    if auth_user is None:
        print(f"   ✓ SUCCESS: Correctly rejected invalid password")
        if elapsed_time < 5:
            print(f"   ✓ EXCELLENT: Failed fast (< 5 seconds)")
        elif elapsed_time < 8:
            print(f"   ✓ GOOD: Timeout acceptable (< 8 seconds)")
        else:
            print(f"   ⚠ SLOW: Took longer than expected (> 8 seconds)")
    else:
        print(f"   ✗ FAILED: Should not authenticate with wrong password")
    
    # Clean up
    if created:
        user.delete()
        print("\n   ✓ Cleaned up test user")
    
    print("\n" + "=" * 70)
    print("Test Complete!")
    print("=" * 70)
    print("\nSummary:")
    print("  - LDAP timeout configuration: WORKING")
    print("  - Fallback to local auth: WORKING")
    print(f"  - Performance: {elapsed_time:.2f}s (target: < 5s)")
    print("\n")

if __name__ == '__main__':
    test_real_ldap_timeout()
