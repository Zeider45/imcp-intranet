#!/usr/bin/env python3

import os
import sys
import traceback
from dotenv import load_dotenv
from ldap3 import Server, Connection, ALL, NTLM
try:
    # Exceptions live under ldap3.core.exceptions
    from ldap3.core.exceptions import LDAPException, LDAPInvalidServerError
except Exception:
    # Fallback: use generic Exception types so script still runs if imports fail
    LDAPException = Exception
    LDAPInvalidServerError = Exception


load_dotenv()

HOST = os.environ.get('AUTH_LDAP_SERVER_URI') or os.environ.get('LDAP_HOST') or os.environ.get('AUTH_LDAP_HOST')
if HOST and HOST.startswith('ldap://'):
    HOST = HOST.replace('ldap://', '')
if HOST and HOST.startswith('ldaps://'):
    HOST = HOST.replace('ldaps://', '')

if not HOST:
    print('AUTH_LDAP_SERVER_URI no encontrada en el entorno. Usando 172.16.101.106 por defecto')
    HOST = '172.16.101.106'

PASSWORD = os.environ.get('AUTH_LDAP_BIND_PASSWORD', 'Nicyen0302.')
BIND_DN = os.environ.get('AUTH_LDAP_BIND_DN', '')
DOMAIN = 'imcp-intranet.local'
NETBIOS = 'IMCP-INTRANET'

attempts = []
print(BIND_DN)
if BIND_DN:
    attempts.append(('bind_dn', BIND_DN))

# UPN form
attempts.append(('upn', f"{os.environ.get('AUTH_LDAP_BIND_USER','administrator')}@{DOMAIN}"))

# NETBIOS\user form
attempts.append(('netbios', f"{NETBIOS}\\{os.environ.get('AUTH_LDAP_BIND_USER','administrator')}"))

# plain username
attempts.append(('username', os.environ.get('AUTH_LDAP_BIND_USER', 'administrator')))


def try_bind(host, user, password, use_ssl=False, authentication=None):
    # ldap3 Server expects host and optional port separately. Accept host or host:port
    host_only = host
    port_arg = None
    if isinstance(host, str) and ':' in host:
        parts = host.rsplit(':', 1)
        if parts[1].isdigit():
            host_only = parts[0]
            port_arg = int(parts[1])

    try:
        if port_arg:
            server = Server(host_only, port=port_arg, get_info=ALL, use_ssl=use_ssl)
        else:
            server = Server(host_only, get_info=ALL, use_ssl=use_ssl)
    except LDAPInvalidServerError as e:
        return False, f'LDAPInvalidServerError: {e}', None
    except Exception as e:
        return False, f'server init error: {e}', None

    try:
        if authentication == NTLM:
            conn = Connection(server, user=user, password=password, authentication=NTLM, receive_timeout=10)
        else:
            conn = Connection(server, user=user, password=password, receive_timeout=10)

        bound = conn.bind()
        return bound, conn.last_error, conn.result
    except LDAPException as e:
        return False, str(e), None
    except Exception:
        return False, traceback.format_exc(), None


def main():
    if not PASSWORD:
        print('AUTH_LDAP_BIND_PASSWORD no está configurada en el entorno. Salir.')
        sys.exit(2)

    print(f'Intentando conectar con servidor LDAP: {HOST}\n')

    for kind, user in attempts:
        print('---')
        print(f'Intento: {kind} -> {user}')

        # Try plain LDAP (no SSL)
        ok, err, res = try_bind(HOST, user, PASSWORD, use_ssl=False)
        print(f'  LDAP (no SSL) bind ok: {ok}')
        if err:
            print(f'    error: {err}')
        if res:
            print(f'    result: {res}')

        # Try LDAPS (SSL) on 636
        ok2, err2, res2 = try_bind(HOST+':636', user, PASSWORD, use_ssl=True)
        print(f'  LDAPS (SSL) bind ok: {ok2}')
        if err2:
            print(f'    error: {err2}')
        if res2:
            print(f'    result: {res2}')

    print('\nHecho. Interpreta `description`/`result` para diagnosticar: 49/invalidCredentials suele significar contraseña o DN mal.')


if __name__ == '__main__':
    main()
