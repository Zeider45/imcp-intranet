# LDAP "Strong(er) authentication required" Error - Fix Documentation

## Problem

When attempting to connect to Active Directory using plain LDAP (port 389), you may encounter the following error:

```
LDAP error: Strong(er) authentication required
```

This error occurs because modern Active Directory servers require encrypted LDAP connections for security reasons. Plain LDAP connections without encryption are rejected by the AD server.

## What Changed

This fix implements **automatic START_TLS support** for plain LDAP connections to satisfy Active Directory's secure authentication requirements.

### Files Modified

1. **backend/test_ldap_bind.py**
   - Added automatic START_TLS before binding to LDAP server
   - Gracefully falls back if START_TLS is not supported
   - Handles certificate validation for self-signed certificates

2. **backend/intranet/settings.py**
   - Added `AUTH_LDAP_CONNECTION_OPTIONS` with TLS settings
   - Automatically enables `AUTH_LDAP_START_TLS = True` for plain LDAP URIs
   - Disables referrals (recommended for Active Directory)

3. **Documentation Updates**
   - backend/.env.example
   - backend/ACTIVE_DIRECTORY_SETUP.md
   - backend/LDAP_TESTING.md
   - ACTIVE_DIRECTORY_CONFIGURED.md

## How It Works

### Plain LDAP with START_TLS (Automatic)

When you use `ldap://` protocol in your configuration:

```bash
AUTH_LDAP_SERVER_URI=ldap://172.16.101.106:389
```

The system now automatically:
1. Connects to the LDAP server on port 389
2. Initiates START_TLS to upgrade the connection to encrypted
3. Performs the bind operation over the encrypted connection

### LDAPS (Secure LDAP)

Alternatively, you can use LDAPS which uses TLS/SSL from the start:

```bash
AUTH_LDAP_SERVER_URI=ldaps://172.16.101.106:636
```

## Testing the Fix

Run the LDAP connection test script:

```bash
cd backend
export AUTH_LDAP_SERVER_URI=ldap://172.16.101.106:389
export AUTH_LDAP_BIND_DN=CN=administrator,CN=Users,DC=imcp-intranet,DC=local
export AUTH_LDAP_BIND_PASSWORD=your_password_here
export AUTH_LDAP_USER_SEARCH_BASE=DC=imcp-intranet,DC=local
python test_ldap_bind.py
```

Expected output:
```
======================================================================
LDAP Connection Test (python-ldap)
======================================================================

Servidor LDAP: ldap://172.16.101.106:389
Base de búsqueda: DC=imcp-intranet,DC=local

Intentando diferentes métodos de autenticación...

----------------------------------------------------------------------
Intento: bind_dn
  Bind DN: CN=administrator,CN=Users,DC=imcp-intranet,DC=local
  ✓ Bind exitoso!
    Descripción: success
    Mensaje: Bind successful
    Prueba de búsqueda: success

======================================================================
✓ 1 de 1 intentos fueron exitosos
```

## Configuration Options

### Option 1: Plain LDAP with START_TLS (Recommended for testing)
```bash
AUTH_LDAP_SERVER_URI=ldap://your-server:389
```
- Connects on port 389
- Automatically upgrades to encrypted connection with START_TLS
- Works with self-signed certificates in test environments

### Option 2: LDAPS (Recommended for production)
```bash
AUTH_LDAP_SERVER_URI=ldaps://your-server:636
```
- Uses TLS/SSL from the beginning on port 636
- More secure than START_TLS
- Recommended for production environments

## What This Doesn't Fix

This fix does **NOT** address:
- Invalid credentials (wrong username/password)
- Network connectivity issues (firewall blocking ports)
- Invalid DN format in configuration
- Server down or unreachable

For other LDAP connection issues, see [ACTIVE_DIRECTORY_SETUP.md](ACTIVE_DIRECTORY_SETUP.md#troubleshooting)

## Production Considerations

For production environments:

1. **Use LDAPS instead of START_TLS:**
   ```bash
   AUTH_LDAP_SERVER_URI=ldaps://your-server:636
   ```

2. **Enable certificate validation:**
   - Remove or modify `ldap.OPT_X_TLS_REQUIRE_CERT: ldap.OPT_X_TLS_NEVER` in settings.py
   - Install proper CA certificates
   - Use proper certificate validation for security

3. **Use a dedicated service account:**
   - Create a service account with minimal permissions
   - Only grant read access to the directory
   - Regularly rotate credentials

4. **Monitor LDAP connections:**
   - Check Django logs for authentication errors
   - Monitor AD logs for failed bind attempts
   - Set up alerts for repeated failures

## Backward Compatibility

This fix is **fully backward compatible**:
- Existing LDAPS configurations continue to work unchanged
- Plain LDAP configurations that already work are not affected
- Only adds START_TLS for plain LDAP when connecting to servers that require it
- Falls back gracefully if START_TLS is not supported

## Security Impact

✅ **Positive Security Impact:**
- Encrypts LDAP traffic that was previously sent in plain text
- Protects credentials during transmission
- Satisfies Active Directory security requirements
- No new vulnerabilities introduced (verified with CodeQL)

## Support

If you still experience issues after applying this fix:

1. **Check firewall rules:**
   ```bash
   telnet your-ad-server 389
   telnet your-ad-server 636
   ```

2. **Verify credentials:**
   ```bash
   python test_ldap_bind.py
   ```

3. **Check Django logs:**
   Look for detailed LDAP error messages

4. **Try LDAPS explicitly:**
   Change to `ldaps://` protocol and test on port 636

5. **Review documentation:**
   - [ACTIVE_DIRECTORY_SETUP.md](ACTIVE_DIRECTORY_SETUP.md)
   - [LDAP_TESTING.md](LDAP_TESTING.md)

## References

- Django-auth-ldap documentation: https://django-auth-ldap.readthedocs.io/
- Python-ldap documentation: https://www.python-ldap.org/
- Active Directory LDAP requirements: https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/ldap-channel-binding-and-signing

---

**Fix Version:** 1.0  
**Date:** 2025-11-19  
**Issue:** LDAP error: Strong(er) authentication required  
**Solution:** Automatic START_TLS for plain LDAP connections
