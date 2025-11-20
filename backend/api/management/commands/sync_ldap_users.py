import os
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.db import transaction
from ldap3 import Server, Connection, ALL, NTLM, SUBTREE

from api.models import UserProfile


class Command(BaseCommand):
    help = 'Sync users from Active Directory into Django auth.User and api.UserProfile'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Run without saving changes')
        parser.add_argument('--mark-inactive', action='store_true', help='Mark Django users not found in AD as inactive')
        parser.add_argument('--filter', dest='filter', default=None, help='LDAP filter override (e.g., "(&(objectClass=user)(sAMAccountName=*))")')
        parser.add_argument('--base', dest='base', default=None, help='LDAP search base override')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        mark_inactive = options['mark_inactive']
        ldap_filter = options['filter']
        search_base = options['base']

        server_uri = os.environ.get('AUTH_LDAP_SERVER_URI')
        bind_dn = os.environ.get('AUTH_LDAP_BIND_DN')
        bind_pw = os.environ.get('AUTH_LDAP_BIND_PASSWORD')

        if not server_uri:
            raise CommandError('AUTH_LDAP_SERVER_URI environment variable is required')

        # sensible defaults
        if not ldap_filter:
            # Use a dedicated sync filter or default to all users
            # Don't use AUTH_LDAP_USER_SEARCH_FILTER as it may contain %(user)s placeholder
            ldap_filter = os.environ.get('AUTH_LDAP_SYNC_FILTER', '(&(objectClass=user)(sAMAccountName=*)(!(objectClass=computer)))')
        if not search_base:
            search_base = os.environ.get('AUTH_LDAP_USER_SEARCH_BASE')
            if not search_base:
                raise CommandError('AUTH_LDAP_USER_SEARCH_BASE environment variable is required or use --base')

        self.stdout.write(f'Connecting to LDAP server {server_uri} ...')

        try:
            server = Server(server_uri, get_info=ALL)
            conn = Connection(server, user=bind_dn, password=bind_pw, auto_bind=True)
        except Exception as e:
            raise CommandError(f'Failed to connect/bind to LDAP server: {e}')

        self.stdout.write('Connection established. Searching for users...')

        attributes = ['sAMAccountName', 'mail', 'givenName', 'sn', 'userAccountControl']

        try:
            conn.search(search_base, ldap_filter, SUBTREE, attributes=attributes)
        except Exception as e:
            raise CommandError(f'LDAP search failed: {e}')

        entries = conn.entries
        total = len(entries)
        created = 0
        updated = 0
        skipped = 0

        found_usernames = set()

        for entry in entries:
            # ldap3 entries provide attributes as properties
            try:
                username = str(entry.sAMAccountName) if hasattr(entry, 'sAMAccountName') else None
            except Exception:
                username = None

            if not username:
                self.stdout.write(self.style.WARNING('Skipping entry without sAMAccountName'))
                skipped += 1
                continue

            found_usernames.add(username)

            email = str(entry.mail) if hasattr(entry, 'mail') and entry.mail else ''
            first_name = str(entry.givenName) if hasattr(entry, 'givenName') and entry.givenName else ''
            last_name = str(entry.sn) if hasattr(entry, 'sn') and entry.sn else ''

            # Determine if account is disabled in AD (userAccountControl bit 2)
            disabled = False
            try:
                uac = int(entry.userAccountControl) if hasattr(entry, 'userAccountControl') and entry.userAccountControl else 0
                disabled = bool(uac & 2)
            except Exception:
                disabled = False

            # Create or update Django user
            try:
                user, created_flag = User.objects.get_or_create(username=username)
                changed = False
                if user.email != email:
                    user.email = email
                    changed = True
                if user.first_name != first_name:
                    user.first_name = first_name
                    changed = True
                if user.last_name != last_name:
                    user.last_name = last_name
                    changed = True
                # sync is_active from AD if available
                target_active = not disabled
                if user.is_active != target_active:
                    user.is_active = target_active
                    changed = True

                if dry_run:
                    if created_flag:
                        created += 1
                    elif changed:
                        updated += 1
                    else:
                        skipped += 1
                else:
                    if created_flag:
                        # For created users, set unusable password (they'll authenticate via LDAP)
                        user.set_unusable_password()
                        user.save()
                        created += 1
                    else:
                        if changed:
                            user.save()
                            updated += 1
                        else:
                            skipped += 1

                    # Ensure a UserProfile exists (signals also attempt this)
                    try:
                        UserProfile.objects.get_or_create(user=user)
                    except Exception:
                        # don't fail the entire run for profile issues
                        self.stdout.write(self.style.WARNING(f'Could not create/update profile for {username}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing user {username}: {e}'))

        # Optionally mark Django users not found in AD as inactive
        if mark_inactive and not dry_run:
            qs = User.objects.exclude(username__in=list(found_usernames)).filter(is_active=True)
            count_marked = qs.update(is_active=False)
            self.stdout.write(self.style.SUCCESS(f'Marked {count_marked} users inactive (not found in AD)'))

        # Summary
        self.stdout.write(self.style.SUCCESS('LDAP sync complete'))
        self.stdout.write(f'Total found in LDAP: {total}')
        self.stdout.write(f'Created: {created}, Updated: {updated}, Skipped: {skipped}')
