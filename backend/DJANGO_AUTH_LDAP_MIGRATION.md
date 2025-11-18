# Migration from django-python3-ldap to django-auth-ldap

This document describes the migration from `django-python3-ldap` to `django-auth-ldap` for Active Directory authentication.

## Why the Change?

**django-auth-ldap** is the standard, widely-adopted LDAP authentication backend for Django with several advantages:

✅ **Industry Standard**: More widely used and trusted in production environments  
✅ **Better Maintained**: Active development and regular updates  
✅ **Built-in Features**: Native group mirroring and permission management  
✅ **Simpler Configuration**: Less boilerplate code required  
✅ **Better Documentation**: Extensive documentation and community support  
✅ **Django Native**: Tighter integration with Django's authentication system  

## What Changed?

### 1. Dependencies (requirements.txt)

**Before:**
```
django-python3-ldap
ldap3
```

**After:**
```
django-auth-ldap==5.0.0
python-ldap==3.4.4
```

### 2. System Requirements

**New Requirement:** System LDAP libraries must be installed:

```bash
# Ubuntu/Debian
sudo apt-get install -y libldap2-dev libsasl2-dev

# RHEL/CentOS
sudo yum install python-devel openldap-devel
```

### 3. Configuration (settings.py)

**Before (django-python3-ldap):**
- Required custom functions in `ldap_sync.py`:
  - `sync_user_relations()`
  - `clean_user_data()`
  - `format_search_filters()`
  - `format_username_active_directory()`
- Configuration spread across multiple variables
- Manual group synchronization logic

**After (django-auth-ldap):**
- Built-in group mirroring with `AUTH_LDAP_MIRROR_GROUPS = True`
- Built-in user attribute mapping with `AUTH_LDAP_USER_ATTR_MAP`
- Built-in group search with `AUTH_LDAP_GROUP_SEARCH`
- Simpler and more maintainable configuration

### 4. Environment Variables

**Simplified Variables:**

Only these are needed now:
```bash
AUTH_LDAP_SERVER_URI=ldap://172.16.101.106:389
AUTH_LDAP_BIND_DN=CN=administrator,CN=Users,DC=imcp-intranet,DC=local
AUTH_LDAP_BIND_PASSWORD=your_password_here
AUTH_LDAP_USER_SEARCH_BASE=DC=imcp-intranet,DC=local
AUTH_LDAP_USER_SEARCH_FILTER=(sAMAccountName=%(user)s)  # Optional
```

**Removed Variables** (no longer needed):
- `AUTH_LDAP_START_TLS` - Configured in settings.py if needed
- `AUTH_LDAP_OBJECT_CLASS` - Handled by search filter
- `AUTH_LDAP_ATTR_USERNAME` - Handled by user search filter
- `AUTH_LDAP_ATTR_FIRST_NAME` - Hardcoded in settings.py
- `AUTH_LDAP_ATTR_LAST_NAME` - Hardcoded in settings.py
- `AUTH_LDAP_ATTR_EMAIL` - Hardcoded in settings.py

## Features Preserved

All existing functionality is maintained:

✅ **User Authentication**: Users can still log in with AD credentials  
✅ **Group Synchronization**: AD groups are still synced to Django groups  
✅ **Custom Group Mappings**: Spanish→English mappings still work via `ldap_sync.py`  
✅ **Role-Based Authorization**: Permissions based on groups still work  
✅ **Fallback Authentication**: Local Django users still work  
✅ **User Profile Creation**: Automatic profile creation via signals  
✅ **All Tests Pass**: 30/30 tests passing  

## Testing

### Verify Installation

Run the new test script:
```bash
cd backend
python test_django_auth_ldap.py
```

### Verify Configuration with LDAP

```bash
cd backend
export AUTH_LDAP_SERVER_URI=ldap://172.16.101.106:389
export AUTH_LDAP_BIND_DN="CN=administrator,CN=Users,DC=imcp-intranet,DC=local"
export AUTH_LDAP_BIND_PASSWORD="your_password"
export AUTH_LDAP_USER_SEARCH_BASE="DC=imcp-intranet,DC=local"
python test_django_auth_ldap.py
```

### Run Tests

```bash
cd backend
python manage.py test
```

Expected result: **30 tests pass**

### Test Server

```bash
cd backend
python manage.py runserver
```

Test the API:
```bash
curl http://localhost:8000/api/health/
```

## Migration Checklist

When deploying to production:

- [ ] Install system LDAP dependencies (`libldap2-dev`, `libsasl2-dev`)
- [ ] Install new Python dependencies (`pip install -r requirements.txt`)
- [ ] Update `.env` file (remove old variables, keep essential ones)
- [ ] Run `python test_django_auth_ldap.py` to verify configuration
- [ ] Run `python manage.py test` to verify all tests pass
- [ ] Test login with an AD user
- [ ] Verify groups are synchronized correctly
- [ ] Check that role-based permissions still work

## Rollback Plan

If you need to rollback to `django-python3-ldap`:

1. Checkout the previous commit: `git checkout 315c237`
2. Reinstall old dependencies: `pip install -r requirements.txt`
3. Restart the Django server

## Support

For issues or questions:

1. Check the documentation: `backend/ACTIVE_DIRECTORY_SETUP.md`
2. Run the test script: `python test_django_auth_ldap.py`
3. Check Django logs for authentication errors
4. Verify LDAP connectivity: `python test_ldap_bind.py`

## Additional Resources

- [django-auth-ldap Documentation](https://django-auth-ldap.readthedocs.io/)
- [Active Directory with Django](https://django-auth-ldap.readthedocs.io/en/latest/authentication.html)
- [Python LDAP Documentation](https://www.python-ldap.org/)

---

**Migration completed on**: 2025-11-18  
**Django version**: 5.2.8  
**django-auth-ldap version**: 5.0.0  
**python-ldap version**: 3.4.4
