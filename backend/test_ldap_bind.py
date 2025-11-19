#!/usr/bin/env python3
"""
LDAP connection test script using python-ldap.
Tests LDAP connection and bind with various authentication methods.
Compatible with django-auth-ldap configuration.
"""

import os
import sys
import traceback
from dotenv import load_dotenv

try:
    import ldap
    from ldap import modlist
except ImportError:
    print("ERROR: python-ldap is not installed")
    print("Install it with: pip install python-ldap")
    sys.exit(1)

load_dotenv()

# Get LDAP server URI from environment
LDAP_URI = os.environ.get('AUTH_LDAP_SERVER_URI', '')
if not LDAP_URI:
    print('AUTH_LDAP_SERVER_URI no encontrada en el entorno. Usando ldap://172.16.101.106:389 por defecto')
    LDAP_URI = 'ldap://172.16.101.106:389'

PASSWORD = os.environ.get('AUTH_LDAP_BIND_PASSWORD', '')
BIND_DN = os.environ.get('AUTH_LDAP_BIND_DN', '')
USER_SEARCH_BASE = os.environ.get('AUTH_LDAP_USER_SEARCH_BASE', 'DC=imcp-intranet,DC=local')

# Build list of authentication attempts
attempts = []
if BIND_DN:
    attempts.append(('bind_dn', BIND_DN))
else:
    # Try some common formats if BIND_DN is not set
    domain = 'imcp-intranet.local'
    username = os.environ.get('AUTH_LDAP_BIND_USER', 'administrator')
    
    # Try different DN formats
    attempts.append(('cn_users', f'CN={username},CN=Users,{USER_SEARCH_BASE}'))
    attempts.append(('upn', f'{username}@{domain}'))


def try_bind(uri, bind_dn, password):
    """
    Try to bind to LDAP server using python-ldap.
    
    Args:
        uri: LDAP server URI (e.g., 'ldap://server:389' or 'ldaps://server:636')
        bind_dn: Distinguished Name for binding
        password: Password for binding
    
    Returns:
        tuple: (success, error_message, result_dict)
    """
    try:
        # Initialize LDAP connection
        conn = ldap.initialize(uri)
        
        # Set protocol version
        conn.protocol_version = ldap.VERSION3
        
        # Set network timeout
        conn.set_option(ldap.OPT_NETWORK_TIMEOUT, 10.0)
        
        # For LDAPS, you might need to configure certificate validation
        if uri.startswith('ldaps://'):
            # For testing, you can disable certificate verification
            # In production, use proper certificate validation
            conn.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)
        
        # Try to bind
        conn.simple_bind_s(bind_dn, password)
        
        # If we get here, bind was successful
        result = {
            'description': 'success',
            'message': 'Bind successful'
        }
        
        # Try a simple search to verify connection
        try:
            search_result = conn.search_s(
                USER_SEARCH_BASE,
                ldap.SCOPE_BASE,
                '(objectClass=*)',
                ['dn']
            )
            result['search_test'] = 'success'
        except ldap.LDAPError as e:
            result['search_test'] = f'search failed: {e}'
        
        # Unbind
        conn.unbind_s()
        
        return True, None, result
        
    except ldap.INVALID_CREDENTIALS as e:
        return False, f'Invalid credentials: {e.args[0].get("desc", str(e))}', None
    except ldap.SERVER_DOWN as e:
        return False, f'Server down or unreachable: {e.args[0].get("desc", str(e))}', None
    except ldap.INVALID_DN_SYNTAX as e:
        return False, f'Invalid DN syntax: {e.args[0].get("desc", str(e))}', None
    except ldap.LDAPError as e:
        return False, f'LDAP error: {e.args[0].get("desc", str(e))}', None
    except Exception as e:
        return False, f'Unexpected error: {traceback.format_exc()}', None


def main():
    """Main function to test LDAP connection."""
    print("=" * 70)
    print("LDAP Connection Test (python-ldap)")
    print("=" * 70)
    print()
    
    if not PASSWORD:
        print('⚠️  AUTH_LDAP_BIND_PASSWORD no está configurada en el entorno.')
        print('   Algunas pruebas pueden fallar.')
        print()
    
    print(f'Servidor LDAP: {LDAP_URI}')
    print(f'Base de búsqueda: {USER_SEARCH_BASE}')
    print()
    print("Intentando diferentes métodos de autenticación...")
    print()
    
    success_count = 0
    
    for kind, bind_dn in attempts:
        print('-' * 70)
        print(f'Intento: {kind}')
        print(f'  Bind DN: {bind_dn}')
        
        # Try to bind
        ok, err, result = try_bind(LDAP_URI, bind_dn, PASSWORD)
        
        if ok:
            print(f'  ✓ Bind exitoso!')
            if result:
                print(f'    Descripción: {result.get("description", "N/A")}')
                print(f'    Mensaje: {result.get("message", "N/A")}')
                if 'search_test' in result:
                    print(f'    Prueba de búsqueda: {result["search_test"]}')
            success_count += 1
        else:
            print(f'  ✗ Bind falló')
            if err:
                print(f'    Error: {err}')
        print()
    
    print("=" * 70)
    if success_count > 0:
        print(f'✓ {success_count} de {len(attempts)} intentos fueron exitosos')
        print()
        print("La conexión LDAP está funcionando correctamente.")
        print("Puedes usar esta configuración en tu archivo .env:")
        print()
        print(f"  AUTH_LDAP_SERVER_URI={LDAP_URI}")
        if attempts and success_count > 0:
            # Find the first successful attempt
            for kind, bind_dn in attempts:
                ok, _, _ = try_bind(LDAP_URI, bind_dn, PASSWORD)
                if ok:
                    print(f"  AUTH_LDAP_BIND_DN={bind_dn}")
                    break
        print(f"  AUTH_LDAP_USER_SEARCH_BASE={USER_SEARCH_BASE}")
        print()
        sys.exit(0)
    else:
        print(f'✗ Ningún intento fue exitoso')
        print()
        print("Solución de problemas:")
        print("  1. Verifica que el servidor LDAP esté accesible")
        print("  2. Verifica las credenciales de bind")
        print("  3. Verifica el formato del DN")
        print("  4. Verifica la configuración del firewall")
        print()
        sys.exit(1)


if __name__ == '__main__':
    main()
