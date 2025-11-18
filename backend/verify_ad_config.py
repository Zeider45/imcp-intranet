#!/usr/bin/env python3
"""
Script to verify Active Directory configuration is properly set up.
This script checks the Django settings and confirms all LDAP parameters are configured.
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intranet.settings')
django.setup()

from django.conf import settings

def check_config():
    """Verify Active Directory configuration"""
    
    print("=" * 70)
    print("Active Directory Configuration Verification")
    print("=" * 70)
    
    issues = []
    warnings = []
    
    # Check if LDAP is enabled
    print("\n1. Checking if LDAP authentication is enabled...")
    if hasattr(settings, 'LDAP_AUTH_URL') and settings.LDAP_AUTH_URL:
        print(f"   ✓ LDAP enabled: {settings.LDAP_AUTH_URL}")
    else:
        issues.append("LDAP is not enabled. AUTH_LDAP_SERVER_URI not set.")
        print("   ✗ LDAP is NOT enabled")
    
    # Check authentication backends
    print("\n2. Checking authentication backends...")
    if 'django_python3_ldap.auth.LDAPBackend' in settings.AUTHENTICATION_BACKENDS:
        print("   ✓ LDAP backend is configured")
        print(f"   Backends order:")
        for i, backend in enumerate(settings.AUTHENTICATION_BACKENDS, 1):
            print(f"     {i}. {backend}")
    else:
        issues.append("LDAP backend not in AUTHENTICATION_BACKENDS")
        print("   ✗ LDAP backend is NOT configured")
    
    # Check required LDAP settings
    print("\n3. Checking required LDAP settings...")
    
    required_settings = {
        'LDAP_AUTH_URL': 'Server URI',
        'LDAP_AUTH_CONNECTION_USERNAME': 'Bind DN',
        'LDAP_AUTH_CONNECTION_PASSWORD': 'Bind Password',
        'LDAP_AUTH_SEARCH_BASE': 'Search Base',
    }
    
    for setting, description in required_settings.items():
        value = getattr(settings, setting, None)
        if value:
            # Mask password
            if 'PASSWORD' in setting:
                display_value = '*' * 8
            else:
                display_value = value
            print(f"   ✓ {description}: {display_value}")
        else:
            issues.append(f"{description} ({setting}) is not set")
            print(f"   ✗ {description} is NOT set")
    
    # Check optional settings
    print("\n4. Checking optional LDAP settings...")
    
    optional_settings = {
        'LDAP_AUTH_USE_TLS': 'Use TLS',
        'LDAP_AUTH_OBJECT_CLASS': 'Object Class',
    }
    
    for setting, description in optional_settings.items():
        value = getattr(settings, setting, None)
        if value is not None:
            print(f"   ✓ {description}: {value}")
        else:
            warnings.append(f"{description} not set, using default")
            print(f"   ⚠ {description}: Using default")
    
    # Check user attribute mapping
    print("\n5. Checking user attribute mapping...")
    if hasattr(settings, 'LDAP_AUTH_USER_FIELDS'):
        print("   ✓ User attribute mapping configured:")
        for django_field, ldap_attr in settings.LDAP_AUTH_USER_FIELDS.items():
            print(f"     Django '{django_field}' ← LDAP '{ldap_attr}'")
    else:
        warnings.append("User attribute mapping not configured")
        print("   ⚠ User attribute mapping not configured")
    
    # Check custom LDAP functions
    print("\n6. Checking custom LDAP functions...")
    
    custom_functions = {
        'LDAP_AUTH_SYNC_USER_RELATIONS': 'Sync User Relations',
        'LDAP_AUTH_CLEAN_USER_DATA': 'Clean User Data',
        'LDAP_AUTH_FORMAT_SEARCH_FILTERS': 'Format Search Filters',
        'LDAP_AUTH_FORMAT_USERNAME': 'Format Username',
    }
    
    for setting, description in custom_functions.items():
        value = getattr(settings, setting, None)
        if value:
            print(f"   ✓ {description}: {value}")
        else:
            warnings.append(f"{description} not configured")
            print(f"   ⚠ {description}: Not configured (using default)")
    
    # Check if django_python3_ldap is installed
    print("\n7. Checking LDAP packages...")
    try:
        import django_python3_ldap
        print(f"   ✓ django-python3-ldap is installed")
    except ImportError:
        issues.append("django-python3-ldap package not installed")
        print("   ✗ django-python3-ldap is NOT installed")
    
    try:
        import ldap3
        print(f"   ✓ ldap3 is installed")
    except ImportError:
        issues.append("ldap3 package not installed")
        print("   ✗ ldap3 is NOT installed")
    
    # Check environment variables
    print("\n8. Checking environment variables...")
    env_vars = [
        'AUTH_LDAP_SERVER_URI',
        'AUTH_LDAP_BIND_DN',
        'AUTH_LDAP_BIND_PASSWORD',
        'AUTH_LDAP_USER_SEARCH_BASE',
    ]
    
    for var in env_vars:
        value = os.environ.get(var)
        if value:
            if 'PASSWORD' in var:
                display_value = '*' * 8
            else:
                display_value = value
            print(f"   ✓ {var}: {display_value}")
        else:
            print(f"   ⚠ {var}: Not set in environment")
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    if not issues and not warnings:
        print("✓ All checks passed! Active Directory authentication is properly configured.")
        print("\nNext steps:")
        print("1. Ensure the AD server is accessible from this machine")
        print("2. Test authentication with: POST /api/auth/login/")
        print("3. Start the server: python manage.py runserver")
        return 0
    
    if issues:
        print(f"\n✗ {len(issues)} CRITICAL ISSUE(S) FOUND:")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
    
    if warnings:
        print(f"\n⚠ {len(warnings)} WARNING(S):")
        for i, warning in enumerate(warnings, 1):
            print(f"   {i}. {warning}")
    
    if issues:
        print("\n✗ Configuration is INCOMPLETE. Please fix the issues above.")
        return 1
    else:
        print("\n✓ Configuration is OK with minor warnings (safe to proceed).")
        return 0


if __name__ == '__main__':
    sys.exit(check_config())
