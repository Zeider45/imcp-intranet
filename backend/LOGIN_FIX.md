# Active Directory Login Fix

## Issue Fixed
Users were unable to log in with valid Active Directory credentials when entering usernames in different formats.

## Root Cause
The LDAP authentication filter expects just the username (sAMAccountName), but users were entering credentials in various formats:
- `DOMAIN\username`
- `username@domain.com`
- Usernames with extra whitespace

The system was passing these strings directly to LDAP without normalization, causing authentication failures.

## Solution
Added automatic username normalization in the login endpoint (`/api/auth/login/`) that handles multiple formats:

### Supported Username Formats
All of these formats now work correctly:

1. **Plain username** (most common)
   ```
   johndoe
   ```

2. **Domain prefix format** (Windows login format)
   ```
   IMCP-INTRANET\johndoe
   DOMAIN\johndoe
   ```

3. **Email format** (UPN format)
   ```
   johndoe@imcp-intranet.local
   johndoe@domain.com
   ```

4. **With whitespace** (automatically trimmed)
   ```
     johndoe  
   ```

All formats are automatically converted to just the username part (`johndoe`) before authentication.

## What Changed
- Modified `backend/api/views.py` - Added username normalization logic
- Modified `backend/intranet/settings.py` - Added logging for debugging
- Reorganized test files for better structure

## For Users
No action required! Simply enter your AD username in any of the supported formats above, along with your password, and the system will authenticate you correctly.

## For Administrators
The system now logs authentication attempts (without passwords) for debugging:
- Successful authentications: `INFO` level
- Failed authentications: `WARNING` level

Check Django logs to troubleshoot any authentication issues.

## Testing
All authentication tests pass:
- ✅ Plain username authentication
- ✅ Domain prefix format (DOMAIN\user)
- ✅ Email format (user@domain)
- ✅ Whitespace handling
- ✅ Invalid credentials rejection
- ✅ Fallback to local Django authentication

## Technical Details
The normalization happens before calling Django's `authenticate()` function:
1. Trim leading/trailing whitespace
2. If username contains `\`, extract the part after the backslash
3. If username contains `@`, extract the part before the @ symbol
4. Pass normalized username to LDAP authentication

This ensures compatibility with Active Directory's sAMAccountName attribute while supporting user-friendly input formats.
