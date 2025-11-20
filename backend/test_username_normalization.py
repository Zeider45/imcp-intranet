#!/usr/bin/env python
"""
Test script to verify username normalization logic.
Tests different username formats to ensure they are properly normalized.
"""

def normalize_username(username):
    """
    Normalize username for Active Directory authentication.
    This mirrors the logic in api/views.py ldap_login function.
    """
    # Remove leading/trailing whitespace
    username = username.strip()
    
    # Handle different username formats:
    # 1. DOMAIN\username -> username
    # 2. username@domain.com -> username
    # 3. username -> username (no change)
    if '\\' in username:
        # Handle DOMAIN\username format
        username = username.split('\\')[-1]
    elif '@' in username:
        # Handle username@domain.com format
        username = username.split('@')[0]
    
    return username


def test_username_normalization():
    """Test various username formats."""
    test_cases = [
        # (input, expected_output)
        ('user123', 'user123'),
        ('  user123  ', 'user123'),
        ('DOMAIN\\user123', 'user123'),
        ('user123@domain.com', 'user123'),
        ('IMCP-INTRANET\\johndoe', 'johndoe'),
        ('johndoe@imcp-intranet.local', 'johndoe'),
        ('  DOMAIN\\user  ', 'user'),
        ('  user@domain.com  ', 'user'),
    ]
    
    print("=" * 60)
    print("Username Normalization Tests")
    print("=" * 60)
    print()
    
    all_passed = True
    for input_username, expected in test_cases:
        result = normalize_username(input_username)
        passed = result == expected
        status = "✓ PASS" if passed else "✗ FAIL"
        
        print(f"{status}: '{input_username}' -> '{result}'", end='')
        if not passed:
            print(f" (expected '{expected}')")
            all_passed = False
        else:
            print()
    
    print()
    print("=" * 60)
    if all_passed:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed!")
    print("=" * 60)
    
    return all_passed


if __name__ == '__main__':
    import sys
    success = test_username_normalization()
    sys.exit(0 if success else 1)
