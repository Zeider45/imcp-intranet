# LDAPS Connection Fix - Summary

## Latest Fix (2025-11-20)

### Issue
LDAPS connections were failing with SSL/TLS initialization error:
```
UNAVAILABLE({'result': 52, 'desc': 'Server is unavailable', 'info': '00000000: LdapErr: DSID-0C0915EA, comment: Error initializing SSL/TLS, data 0, v4563'})
```

### Solution
Added `ldap.set_option(ldap.OPT_X_TLS_NEWCTX, 0)` after setting global TLS options. This forces the LDAP library to refresh the TLS context, ensuring that the global options take effect before the connection is initialized.

**Critical:** The `OPT_X_TLS_NEWCTX` option must be set **after** all other TLS options but **before** calling `ldap.initialize()`.

---

## Original Problem (Historical)

When using `ldaps://` (LDAP over SSL) for Active Directory authentication, the connection failed with the following error:

```
Intento: bind_dn
Bind DN: CN=Administrator,CN=Users,DC=IMCP,DC=BDC
✗ Bind falló
Error: Server down or unreachable: Can't contact LDAP server
```

## Root Cause

The issue occurred because SSL/TLS options for LDAPS connections need to be set **globally before** initializing the LDAP connection using `ldap.initialize()`. 

Previously, the code was:
1. Initializing the connection with `ldap.initialize(uri)`
2. Then setting TLS options on the connection object

For LDAPS (which uses SSL/TLS from the start), this order is incorrect. The TLS options must be set globally before initialization, and the TLS context must be refreshed after setting options.

## Solution

The fix involves two key changes:

### 1. Updated `test_ldap_bind.py`

**Before:**
```python
# Initialize LDAP connection
conn = ldap.initialize(uri)

# For LDAPS, configure certificate validation
if uri.startswith('ldaps://'):
    conn.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)
```

**After:**
```python
# For LDAPS, configure TLS options globally BEFORE initializing
if uri.startswith('ldaps://'):
    ldap.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)
    # Force refresh of TLS context after setting options
    ldap.set_option(ldap.OPT_X_TLS_NEWCTX, 0)

# Initialize LDAP connection
conn = ldap.initialize(uri)
```

### 2. Updated `intranet/settings.py`

Added LDAPS-specific configuration:

```python
# For LDAPS (ldaps://), set global TLS options
if AUTH_LDAP_SERVER_URI.startswith('ldaps://'):
    # Set global TLS options for LDAPS
    ldap.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)
    # Force refresh of TLS context after setting options
    # This is critical for the options to take effect
    ldap.set_option(ldap.OPT_X_TLS_NEWCTX, 0)
    # For production with valid certificates, use:
    # ldap.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_DEMAND)
    # ldap.set_option(ldap.OPT_X_TLS_CACERTFILE, '/path/to/ca-cert.pem')
    # ldap.set_option(ldap.OPT_X_TLS_NEWCTX, 0)
```

Also added network timeout configuration for better error detection:

```python
AUTH_LDAP_CONNECTION_OPTIONS = {
    ldap.OPT_X_TLS_REQUIRE_CERT: ldap.OPT_X_TLS_NEVER,
    ldap.OPT_REFERRALS: 0,
    ldap.OPT_NETWORK_TIMEOUT: 10,  # NEW: Connection timeout in seconds
}
```

## How to Use

### For Development (Self-Signed Certificates)

The system is now configured to accept self-signed certificates by default. Simply use LDAPS in your `.env`:

```bash
AUTH_LDAP_SERVER_URI=ldaps://172.16.101.106:636
AUTH_LDAP_BIND_DN=CN=Administrator,CN=Users,DC=IMCP,DC=BDC
AUTH_LDAP_BIND_PASSWORD=your_password
AUTH_LDAP_USER_SEARCH_BASE=DC=IMCP,DC=BDC
```

### For Production (Valid Certificates)

For production environments with valid SSL certificates, update `backend/intranet/settings.py`:

```python
if AUTH_LDAP_SERVER_URI.startswith('ldaps://'):
    ldap.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_DEMAND)
    ldap.set_option(ldap.OPT_X_TLS_CACERTFILE, '/path/to/ca-cert.pem')
```

## Testing

### Test the Connection

Run the test script to verify LDAPS connectivity:

```bash
cd backend
python test_ldap_bind.py
```

Expected behavior:
- If the AD server is reachable on port 636 and LDAPS is enabled, the bind will succeed
- If the AD server is not reachable, you'll see: "Server down or unreachable: Can't contact LDAP server"
- The test will complete within 10 seconds (due to network timeout)

### Run Django Tests

All existing tests should pass:

```bash
cd backend
python manage.py test
```

## Checklist for LDAPS Setup

- [ ] Ensure AD server has LDAPS enabled (typically port 636)
- [ ] Verify firewall allows connections to port 636
- [ ] Update `.env` with `ldaps://` URI
- [ ] Test connection with `python test_ldap_bind.py`
- [ ] For production, configure proper certificate validation
- [ ] Test authentication through Django: `POST /api/auth/login/`

## Technical Details

### Why Global Options are Required

LDAPS (LDAP over SSL/TLS) establishes an encrypted connection immediately upon initialization. The TLS handshake happens during `ldap.initialize()`, not after. Therefore:

1. **For LDAPS:** TLS options must be set globally before `ldap.initialize()`
2. **For LDAP with START_TLS:** TLS options can be set on the connection object before calling `start_tls_s()`

### Connection Options Added

| Option | Value | Purpose |
|--------|-------|---------|
| `OPT_X_TLS_REQUIRE_CERT` | `OPT_X_TLS_NEVER` | Accept self-signed certificates (dev) |
| `OPT_REFERRALS` | `0` | Disable referrals (recommended for AD) |
| `OPT_NETWORK_TIMEOUT` | `10` | Connection timeout in seconds |

## References

- **python-ldap documentation:** https://www.python-ldap.org/
- **django-auth-ldap documentation:** https://django-auth-ldap.readthedocs.io/
- **Microsoft AD LDAPS:** https://docs.microsoft.com/en-us/troubleshoot/windows-server/identity/enable-ldap-over-ssl-3rd-certification-authority

## Additional Notes

- Both `ldap://` (with START_TLS) and `ldaps://` are now fully supported
- The fix handles self-signed certificates by default for development
- Production deployments should use proper certificate validation
- Network timeouts ensure fast failure detection for unreachable servers
- All existing Django tests continue to pass
