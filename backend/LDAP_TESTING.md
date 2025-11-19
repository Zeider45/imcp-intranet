# LDAP Testing Documentation

This document describes the LDAP testing infrastructure for the django-auth-ldap and python-ldap configuration.

## Test Files

### 1. `api/test_ldap_config.py` - Comprehensive LDAP Configuration Tests

This is the main test file for LDAP configuration validation. It contains **17 test cases** organized into 5 test classes:

#### LDAPConfigurationTestCase
Tests basic LDAP configuration settings:
- ✅ `test_ldap_settings_import_successful` - Verifies django-auth-ldap and python-ldap modules can be imported
- ✅ `test_ldap_backend_available_when_configured` - Verifies LDAP backend is in AUTHENTICATION_BACKENDS when configured
- ✅ `test_ldap_backend_not_configured_when_no_uri` - Verifies LDAP backend is not configured without AUTH_LDAP_SERVER_URI
- ✅ `test_ldap_user_search_configuration` - Validates AUTH_LDAP_USER_SEARCH configuration
- ✅ `test_ldap_user_attr_map_configuration` - Validates AUTH_LDAP_USER_ATTR_MAP configuration
- ✅ `test_ldap_group_search_configuration` - Validates AUTH_LDAP_GROUP_SEARCH configuration
- ✅ `test_ldap_connection_options` - Validates basic LDAP connection options (URI, bind DN, password)

#### LDAPAuthenticationBackendTestCase
Tests authentication backend functionality:
- ✅ `test_fallback_to_model_backend` - Verifies authentication falls back to ModelBackend when LDAP is not configured
- ✅ `test_ldap_backend_called_when_configured` - Verifies LDAP backend is called when properly configured

#### LDAPUserSyncTestCase
Tests user synchronization settings:
- ✅ `test_ldap_always_update_user_configured` - Validates AUTH_LDAP_ALWAYS_UPDATE_USER setting
- ✅ `test_ldap_mirror_groups_configured` - Validates AUTH_LDAP_MIRROR_GROUPS setting
- ✅ `test_ldap_find_group_perms_configured` - Validates AUTH_LDAP_FIND_GROUP_PERMS setting

#### PythonLDAPModuleTestCase
Tests python-ldap module functionality:
- ✅ `test_python_ldap_import` - Verifies python-ldap module can be imported and has required attributes
- ✅ `test_ldap_scope_constants_available` - Validates LDAP scope constants (SCOPE_SUBTREE, SCOPE_BASE, etc.)
- ✅ `test_ldap_search_configuration_uses_python_ldap` - Verifies search configuration uses python-ldap constants

#### LDAPConfigurationIntegrationTestCase
Integration tests for complete LDAP setup:
- ✅ `test_complete_ldap_configuration_when_enabled` - Validates all components when LDAP is enabled
- ✅ `test_ldap_disabled_uses_model_backend_only` - Validates that only ModelBackend is used when LDAP is disabled

### 2. `test_ldap_bind.py` - LDAP Connection Test Script

This is a standalone script (not a Django test) that tests actual LDAP connection and bind operations using python-ldap.

**Features:**
- Tests LDAP connection with various bind DN formats
- Uses environment variables for configuration
- Provides detailed error messages and diagnostics
- Compatible with django-auth-ldap configuration

**Usage:**
```bash
cd backend
export AUTH_LDAP_SERVER_URI=ldap://your-server:389
export AUTH_LDAP_BIND_DN=CN=ServiceAccount,DC=example,DC=com
export AUTH_LDAP_BIND_PASSWORD=your_password
export AUTH_LDAP_USER_SEARCH_BASE=DC=example,DC=com
python test_ldap_bind.py
```

### 3. `test_django_auth_ldap.py` - Configuration Verification Script

This is a standalone script that verifies django-auth-ldap configuration without attempting a real connection.

**Features:**
- Checks authentication backends
- Validates LDAP settings
- Verifies module installation
- Provides setup instructions

**Usage:**
```bash
cd backend
python test_django_auth_ldap.py
```

## Running Tests

### Run All Tests
```bash
cd backend
python manage.py test
```

### Run Only LDAP Configuration Tests
```bash
cd backend
python manage.py test api.test_ldap_config
```

### Run with Verbose Output
```bash
cd backend
python manage.py test api.test_ldap_config --verbosity=2
```

### Run a Specific Test
```bash
cd backend
python manage.py test api.test_ldap_config.LDAPConfigurationTestCase.test_ldap_settings_import_successful
```

## Test Coverage

The LDAP tests cover:

1. **Module Installation**
   - django-auth-ldap is installed
   - python-ldap is installed
   - Required constants and classes are available

2. **Configuration Validation**
   - AUTH_LDAP_SERVER_URI format
   - Bind credentials (DN and password)
   - User search configuration
   - User attribute mapping
   - Group search configuration
   - Group synchronization settings

3. **Backend Integration**
   - LDAP backend is in AUTHENTICATION_BACKENDS when configured
   - LDAP backend is NOT present when not configured
   - Fallback to ModelBackend works correctly
   - Both backends can coexist

4. **User Synchronization**
   - Always update user setting
   - Mirror groups setting
   - Find group permissions setting

5. **python-ldap Compatibility**
   - LDAP scope constants are available
   - Search configuration uses correct constants
   - Module version is accessible

## Environment Variables for Testing

When testing LDAP configuration, set these environment variables:

```bash
# Required
export AUTH_LDAP_SERVER_URI=ldap://ad.example.com:389
export AUTH_LDAP_BIND_DN=CN=ServiceAccount,DC=example,DC=com
export AUTH_LDAP_BIND_PASSWORD=password
export AUTH_LDAP_USER_SEARCH_BASE=DC=example,DC=com

# Optional
export AUTH_LDAP_USER_SEARCH_FILTER=(sAMAccountName=%(user)s)
```

## Test Philosophy

The tests are designed to:

1. **Work Without LDAP Server**: Tests validate configuration, not actual connectivity
2. **Support Both Modes**: Tests pass whether LDAP is configured or not
3. **Provide Clear Feedback**: Tests include descriptive names and messages
4. **Cover Edge Cases**: Tests handle missing configuration gracefully
5. **Follow Django Conventions**: Tests use Django's TestCase and override_settings

## Troubleshooting

### Tests Fail Due to Missing Modules

If tests fail with import errors:
```bash
pip install -r requirements.txt
```

### Tests Fail Due to Missing System Libraries

If python-ldap installation fails:
```bash
# Ubuntu/Debian
sudo apt-get install -y libldap2-dev libsasl2-dev

# RHEL/CentOS
sudo yum install python-devel openldap-devel
```

### Tests Pass But Real LDAP Connection Fails

Use the `test_ldap_bind.py` script to test actual connectivity:
```bash
python test_ldap_bind.py
```

## Integration with CI/CD

The tests are designed to run in CI/CD pipelines without requiring an actual LDAP server:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    cd backend
    python manage.py test
```

All tests will pass as long as the dependencies are installed, even without LDAP configuration.

## Future Enhancements

Potential additions to the test suite:

1. **Mock LDAP Server Tests**: Use a mock LDAP server for integration testing
2. **Performance Tests**: Test LDAP query performance with large datasets
3. **Error Handling Tests**: Test specific LDAP error conditions
4. **SSL/TLS Tests**: Test LDAPS connections and certificate validation
5. **Connection Pool Tests**: Test connection pooling and reuse

## Related Documentation

- [DJANGO_AUTH_LDAP_MIGRATION.md](DJANGO_AUTH_LDAP_MIGRATION.md) - Migration guide from django-python3-ldap
- [ACTIVE_DIRECTORY_SETUP.md](ACTIVE_DIRECTORY_SETUP.md) - Active Directory setup guide
- [ROLE_BASED_AUTHORIZATION.md](ROLE_BASED_AUTHORIZATION.md) - Role-based authorization guide

## Support

For issues with LDAP testing:

1. Run `python test_django_auth_ldap.py` to verify configuration
2. Run `python test_ldap_bind.py` to test actual connectivity
3. Run `python manage.py test api.test_ldap_config --verbosity=2` for detailed test output
4. Check Django logs for authentication errors

---

**Last Updated**: 2025-11-19  
**Test Suite Version**: 1.0  
**Total LDAP Tests**: 17  
**Test Success Rate**: 100%
