#!/usr/bin/env python
"""
Integration test to verify login with different username formats.
Tests that the normalization works correctly with Django authentication.
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intranet.settings')
django.setup()

from django.contrib.auth.models import User
from django.test import Client
from rest_framework import status
import json


def test_login_with_different_formats():
    """Test login with different username formats."""
    
    # Add testserver to ALLOWED_HOSTS for testing
    from django.conf import settings
    original_allowed_hosts = settings.ALLOWED_HOSTS
    settings.ALLOWED_HOSTS = ['testserver', '*']
    
    try:
        # Create a test user
        username = 'testuser'
        password = 'TestPass123!'
        
        # Clean up any existing test user
        User.objects.filter(username=username).delete()
        
        # Create test user
        user = User.objects.create_user(
            username=username,
            email='testuser@example.com',
            password=password,
            first_name='Test',
            last_name='User'
        )
        
        print("=" * 60)
        print("Login Normalization Integration Test")
        print("=" * 60)
        print(f"Created test user: {username}")
        print()
        
        client = Client()
        
        test_cases = [
        ('testuser', password, True, "Plain username"),
        ('  testuser  ', password, True, "Username with spaces"),
        ('DOMAIN\\testuser', password, True, "DOMAIN\\username format"),
        ('testuser@domain.com', password, True, "username@domain format"),
        ('testuser', 'wrongpass', False, "Wrong password"),
        ('wronguser', password, False, "Wrong username"),
        ]
        
        passed = 0
        failed = 0
        
        for test_username, test_password, should_succeed, description in test_cases:
            response = client.post(
                '/api/auth/login/',
                data=json.dumps({
                    'username': test_username,
                    'password': test_password
                }),
                content_type='application/json'
            )
            
            success = response.status_code == status.HTTP_200_OK
            
            if success == should_succeed:
                print(f"✓ PASS: {description}")
                print(f"  Input: '{test_username}'")
                if success:
                    print(f"  Result: Authentication successful")
                else:
                    print(f"  Result: Authentication failed as expected")
                passed += 1
            else:
                print(f"✗ FAIL: {description}")
                print(f"  Input: '{test_username}'")
                print(f"  Expected: {'Success' if should_succeed else 'Failure'}")
                print(f"  Got: {'Success' if success else 'Failure'}")
                print(f"  Status: {response.status_code}")
                print(f"  Response: {response.content.decode()}")
                failed += 1
            print()
    
        # Clean up
        user.delete()
        
        print("=" * 60)
        print(f"Results: {passed} passed, {failed} failed")
        print("=" * 60)
        
        return failed == 0
    finally:
        # Restore original ALLOWED_HOSTS
        settings.ALLOWED_HOSTS = original_allowed_hosts


if __name__ == '__main__':
    try:
        success = test_login_with_different_formats()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
