#!/usr/bin/env python
"""
Simple test script to verify django-auth-ldap configuration.
This script checks the LDAP settings without attempting a real connection.
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intranet.settings')
django.setup()

from django.conf import settings


def test_django_auth_ldap_config():
    """Test that django-auth-ldap is properly configured."""
    
    print("=" * 60)
    print("Django-auth-ldap Configuration Test")
    print("=" * 60)
    print()
    
    # Check if django-auth-ldap backend is configured
    print("✓ Checking authentication backends...")
    auth_backends = getattr(settings, 'AUTHENTICATION_BACKENDS', [])
    print(f"  Configured backends: {len(auth_backends)}")
    for backend in auth_backends:
        print(f"    - {backend}")
    
    ldap_backend_configured = any('ldap' in backend.lower() for backend in auth_backends)
    if ldap_backend_configured:
        print("  ✓ LDAP backend is configured")
    else:
        print("  ℹ LDAP backend not configured (using default Django authentication)")
    
    print()
    
    # Check LDAP settings
    print("✓ Checking LDAP settings...")
    ldap_uri = getattr(settings, 'AUTH_LDAP_SERVER_URI', None)
    ldap_bind_dn = getattr(settings, 'AUTH_LDAP_BIND_DN', None)
    ldap_bind_password = getattr(settings, 'AUTH_LDAP_BIND_PASSWORD', None)
    
    if ldap_uri:
        print(f"  Server URI: {ldap_uri}")
        print(f"  Bind DN: {ldap_bind_dn}")
        print(f"  Bind Password: {'*' * len(ldap_bind_password) if ldap_bind_password else 'Not set'}")
        
        # Check user search configuration
        user_search = getattr(settings, 'AUTH_LDAP_USER_SEARCH', None)
        if user_search:
            print(f"  ✓ User search configured")
            print(f"    Base DN: {user_search.base_dn}")
            print(f"    Filter: {user_search.filterstr}")
        
        # Check user attribute mapping
        user_attr_map = getattr(settings, 'AUTH_LDAP_USER_ATTR_MAP', None)
        if user_attr_map:
            print(f"  ✓ User attribute mapping configured")
            for django_field, ldap_field in user_attr_map.items():
                print(f"    {django_field} -> {ldap_field}")
        
        # Check group settings
        group_search = getattr(settings, 'AUTH_LDAP_GROUP_SEARCH', None)
        if group_search:
            print(f"  ✓ Group search configured")
            print(f"    Base DN: {group_search.base_dn}")
        
        mirror_groups = getattr(settings, 'AUTH_LDAP_MIRROR_GROUPS', False)
        if mirror_groups:
            print(f"  ✓ Group mirroring enabled")
        
        find_group_perms = getattr(settings, 'AUTH_LDAP_FIND_GROUP_PERMS', False)
        if find_group_perms:
            print(f"  ✓ Group permissions enabled")
        
        always_update = getattr(settings, 'AUTH_LDAP_ALWAYS_UPDATE_USER', False)
        if always_update:
            print(f"  ✓ Always update user enabled")
    else:
        print("  ℹ LDAP not configured (AUTH_LDAP_SERVER_URI not set)")
    
    print()
    
    # Try to import django-auth-ldap
    print("✓ Checking django-auth-ldap installation...")
    try:
        import django_auth_ldap
        print(f"  ✓ django-auth-ldap is installed (version {django_auth_ldap.__version__})")
    except ImportError as e:
        print(f"  ✗ django-auth-ldap is not installed: {e}")
        return False
    
    try:
        import ldap
        print(f"  ✓ python-ldap is installed")
    except ImportError as e:
        print(f"  ✗ python-ldap is not installed: {e}")
        return False
    
    print()
    print("=" * 60)
    print("Configuration check complete!")
    print("=" * 60)
    print()
    
    if ldap_backend_configured and ldap_uri:
        print("✓ django-auth-ldap is fully configured and ready to use.")
        print()
        print("To test authentication, try logging in with an AD user:")
        print("  python manage.py shell")
        print("  >>> from django.contrib.auth import authenticate")
        print("  >>> user = authenticate(username='your_ad_username', password='your_password')")
        print("  >>> print(user)")
    else:
        print("ℹ LDAP authentication is not configured.")
        print("  To enable it, set AUTH_LDAP_SERVER_URI in your .env file.")
    
    print()
    return True


if __name__ == '__main__':
    try:
        success = test_django_auth_ldap_config()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
