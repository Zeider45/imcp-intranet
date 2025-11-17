# Active Directory / LDAP Configuration Guide

This guide explains how to configure the Django backend to authenticate users against an Active Directory (AD) or LDAP server.

## Overview

The backend is configured to support LDAP/Active Directory authentication using `django-python3-ldap`, which provides pure Python LDAP authentication without requiring native LDAP libraries. The system falls back to standard Django authentication when LDAP is not configured.

**Key Features:**
- ✅ User authentication via Active Directory
- ✅ Automatic group synchronization from AD to Django
- ✅ Role-based authorization using AD groups
- ✅ Support for both English and Spanish group names
- ✅ Automatic user profile creation

> **Note:** For detailed information about role-based authorization and permissions, see [ROLE_BASED_AUTHORIZATION.md](ROLE_BASED_AUTHORIZATION.md)

## Prerequisites

The required packages are already included in `requirements.txt`:
- `django-python3-ldap` - Pure Python LDAP authentication backend
- `ldap3` - Pure Python LDAP client library

## Configuration

### Environment Variables

To enable Active Directory authentication, set the following environment variables:

#### Required Variables

```bash
# LDAP Server URI
AUTH_LDAP_SERVER_URI=ldap://ad.example.com:389
# or for LDAPS (secure)
AUTH_LDAP_SERVER_URI=ldaps://ad.example.com:636

# Bind DN - Service account with read access to AD
AUTH_LDAP_BIND_DN=CN=ServiceAccount,OU=ServiceAccounts,DC=example,DC=com

# Bind Password - Service account password
AUTH_LDAP_BIND_PASSWORD=YourSecurePassword

# Search Base - Where to search for users
AUTH_LDAP_USER_SEARCH_BASE=DC=example,DC=com
```

#### Optional Variables

```bash
# Start TLS (use with ldap://, not ldaps://)
AUTH_LDAP_START_TLS=false

# Object class for user search (default: person)
AUTH_LDAP_OBJECT_CLASS=person

# LDAP Attribute Mappings (defaults shown)
AUTH_LDAP_ATTR_USERNAME=sAMAccountName
AUTH_LDAP_ATTR_FIRST_NAME=givenName
AUTH_LDAP_ATTR_LAST_NAME=sn
AUTH_LDAP_ATTR_EMAIL=mail
```

### Configuration Examples

#### Example 1: Active Directory with Simple Bind

```bash
export AUTH_LDAP_SERVER_URI=ldap://dc01.company.local:389
export AUTH_LDAP_BIND_DN=CN=Django Service,OU=Service Accounts,DC=company,DC=local
export AUTH_LDAP_BIND_PASSWORD=SecurePassword123
export AUTH_LDAP_USER_SEARCH_BASE=DC=company,DC=local
export AUTH_LDAP_OBJECT_CLASS=person
```

#### Example 2: Active Directory with TLS

```bash
export AUTH_LDAP_SERVER_URI=ldap://dc01.company.local:389
export AUTH_LDAP_START_TLS=true
export AUTH_LDAP_BIND_DN=CN=Django Service,OU=Service Accounts,DC=company,DC=local
export AUTH_LDAP_BIND_PASSWORD=SecurePassword123
export AUTH_LDAP_USER_SEARCH_BASE=DC=company,DC=local
```

#### Example 3: Active Directory with LDAPS (Secure LDAP)

```bash
export AUTH_LDAP_SERVER_URI=ldaps://dc01.company.local:636
export AUTH_LDAP_BIND_DN=CN=Django Service,OU=Service Accounts,DC=company,DC=local
export AUTH_LDAP_BIND_PASSWORD=SecurePassword123
export AUTH_LDAP_USER_SEARCH_BASE=DC=company,DC=local
```

## Authentication Flow

1. User submits username and password to `/api/auth/login/`
2. Django tries authentication backends in order:
   - If LDAP is configured: `django_python3_ldap.auth.LDAPBackend`
   - Always tries: `django.contrib.auth.backends.ModelBackend`
3. LDAP backend:
   - Connects to AD server using bind credentials
   - Searches for user by username (sAMAccountName by default)
   - Authenticates user with provided password
   - Creates/updates Django user with LDAP attributes
   - Creates UserProfile automatically via signal
4. On success, returns user info and authentication token

## API Endpoints

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_staff": false,
    "is_superuser": false
  },
  "profile": {
    "department": "IT",
    "position": "Developer",
    "phone": "555-1234"
  },
  "token": "a1b2c3d4e5f6..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

### Get Current User
```http
GET /api/auth/me/
Authorization: Token a1b2c3d4e5f6...
```

**Response (200 OK):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_staff": false,
    "is_superuser": false
  },
  "profile": {
    "department": "IT",
    "position": "Developer",
    "phone": "555-1234",
    "bio": ""
  }
}
```

### Logout
```http
POST /api/auth/logout/
Authorization: Token a1b2c3d4e5f6...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Using Authentication Tokens

After successful login, include the token in the `Authorization` header for authenticated requests:

```bash
curl -H "Authorization: Token a1b2c3d4e5f6..." http://localhost:8000/api/profiles/me/
```

## Testing

### Without Active Directory

If LDAP environment variables are not set, the system uses standard Django authentication with local database users:

```bash
# Create a test user
python manage.py createsuperuser

# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### With Active Directory

Set environment variables and test with an AD user:

```bash
# Set environment variables
export AUTH_LDAP_SERVER_URI=ldap://your-ad-server:389
export AUTH_LDAP_BIND_DN=CN=ServiceAccount,DC=example,DC=com
export AUTH_LDAP_BIND_PASSWORD=password
export AUTH_LDAP_USER_SEARCH_BASE=DC=example,DC=com

# Start server
python manage.py runserver

# Test with AD credentials
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"ad-username","password":"ad-password"}'
```

## Troubleshooting

### LDAP Connection Issues

1. **Connection timeout or refused:**
   - Check firewall rules allow connection to LDAP port (389 or 636)
   - Verify AD server hostname/IP is correct
   - Test with `telnet ad-server 389`

2. **Bind failed:**
   - Verify bind DN format is correct
   - Check service account password
   - Ensure service account has read permissions

3. **User not found:**
   - Verify search base includes user's OU
   - Check username attribute (sAMAccountName vs uid vs cn)
   - Check object class filter

### Debugging

Enable Django debug mode and check logs:

```python
# In settings.py
DEBUG = True

# Check Django logs for LDAP errors
```

### Testing LDAP Connection

Use ldap3 directly to test connection:

```python
from ldap3 import Server, Connection, ALL

server = Server('ldap://ad.example.com:389', get_info=ALL)
conn = Connection(
    server,
    user='CN=ServiceAccount,DC=example,DC=com',
    password='password'
)

if conn.bind():
    print("Connection successful!")
    # Search for a user
    conn.search(
        'DC=example,DC=com',
        '(sAMAccountName=username)',
        attributes=['cn', 'mail', 'givenName', 'sn']
    )
    print(conn.entries)
else:
    print("Connection failed:", conn.result)
```

## Security Recommendations

1. **Use a service account with minimal permissions:**
   - Read-only access to user directory
   - No admin privileges
   - Strong password

2. **Use secure connections:**
   - Prefer LDAPS (port 636) over LDAP (port 389)
   - Or use StartTLS with LDAP

3. **Store credentials securely:**
   - Never commit credentials to version control
   - Use environment variables or secrets manager
   - Rotate service account password regularly

4. **Monitor authentication:**
   - Log authentication attempts
   - Set up alerts for failed binds
   - Regular security audits

## Production Deployment

For production:

1. Use environment variables or secrets manager for credentials
2. Use LDAPS or StartTLS
3. Configure certificate validation
4. Set up monitoring and alerting
5. Use a dedicated service account
6. Document your AD/LDAP configuration
7. Test failover scenarios

## Additional Resources

- [django-python3-ldap documentation](https://github.com/etianen/django-python3-ldap)
- [ldap3 documentation](https://ldap3.readthedocs.io/)
- [Active Directory Schema](https://docs.microsoft.com/en-us/windows/win32/adschema/active-directory-schema)
