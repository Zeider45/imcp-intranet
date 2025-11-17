"""
LDAP sync functions for synchronizing Active Directory groups to Django groups.
"""
from django.contrib.auth.models import Group
from django_python3_ldap.utils import format_search_filters as default_format_search_filters
import logging

logger = logging.getLogger(__name__)


def sync_user_relations(user, ldap_attributes):
    """
    Sync Active Directory groups to Django groups.
    This function is called after user authentication to update group memberships.
    
    Args:
        user: Django User object
        ldap_attributes: Dictionary of LDAP attributes from Active Directory
    """
    # Get memberOf attribute (AD groups the user belongs to)
    member_of = ldap_attributes.get('memberOf', [])
    
    if not isinstance(member_of, list):
        member_of = [member_of] if member_of else []
    
    # Extract group names from DN format
    # Example: CN=HR_Managers,OU=Groups,DC=example,DC=com -> HR_Managers
    ad_groups = []
    for group_dn in member_of:
        if isinstance(group_dn, bytes):
            group_dn = group_dn.decode('utf-8')
        
        # Extract CN (Common Name) from DN
        if group_dn.startswith('CN='):
            group_name = group_dn.split(',')[0].replace('CN=', '')
            ad_groups.append(group_name)
    
    logger.info(f"User {user.username} AD groups: {ad_groups}")
    
    # Map of AD groups to Django groups (can be customized)
    # This allows mapping AD group names to different Django group names if needed
    group_mapping = {
        # HR and Management
        'HR_Managers': 'HR_Managers',
        'Gerentes_RH': 'HR_Managers',
        'Department_Managers': 'Department_Managers',
        'Gerentes_Departamento': 'Department_Managers',
        
        # Communications
        'Communications': 'Communications',
        'Comunicaciones': 'Communications',
        
        # Document Management
        'Document_Managers': 'Document_Managers',
        'Administradores_Documentos': 'Document_Managers',
        
        # Resource Management
        'Resource_Managers': 'Resource_Managers',
        'Administradores_Recursos': 'Resource_Managers',
        'Facilities': 'Facilities',
        'Instalaciones': 'Facilities',
        
        # Training
        'Training_Managers': 'Training_Managers',
        'Administradores_Capacitacion': 'Training_Managers',
        
        # Project Management
        'Project_Managers': 'Project_Managers',
        'Gerentes_Proyecto': 'Project_Managers',
    }
    
    # Get Django groups to assign
    django_groups = set()
    for ad_group in ad_groups:
        if ad_group in group_mapping:
            django_groups.add(group_mapping[ad_group])
        else:
            # If not in mapping, use the AD group name directly
            django_groups.add(ad_group)
    
    # Clear existing groups and add new ones
    user.groups.clear()
    
    for group_name in django_groups:
        # Get or create the Django group
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            logger.info(f"Created new Django group: {group_name}")
        user.groups.add(group)
        logger.info(f"Added user {user.username} to group {group_name}")
    
    logger.info(f"Synced {len(django_groups)} groups for user {user.username}")


def clean_user_data(user_data):
    """
    Clean and validate user data from LDAP before creating/updating Django user.
    
    Args:
        user_data: Dictionary of user data from LDAP
        
    Returns:
        Cleaned user data dictionary
    """
    # Ensure required fields have values
    if not user_data.get('username'):
        raise ValueError("Username is required from LDAP")
    
    # Clean email
    email = user_data.get('email', '')
    if isinstance(email, list):
        email = email[0] if email else ''
    if isinstance(email, bytes):
        email = email.decode('utf-8')
    user_data['email'] = email.lower().strip() if email else ''
    
    # Clean first name
    first_name = user_data.get('first_name', '')
    if isinstance(first_name, list):
        first_name = first_name[0] if first_name else ''
    if isinstance(first_name, bytes):
        first_name = first_name.decode('utf-8')
    user_data['first_name'] = first_name.strip() if first_name else ''
    
    # Clean last name
    last_name = user_data.get('last_name', '')
    if isinstance(last_name, list):
        last_name = last_name[0] if last_name else ''
    if isinstance(last_name, bytes):
        last_name = last_name.decode('utf-8')
    user_data['last_name'] = last_name.strip() if last_name else ''
    
    logger.info(f"Cleaned user data for: {user_data.get('username')}")
    
    return user_data


def format_search_filters(ldap_fields):
    """
    Format LDAP search filters to include memberOf attribute for group sync.
    
    Args:
        ldap_fields: Dictionary of LDAP field mappings
        
    Returns:
        Formatted search filter string
    """
    # Get default filters
    filters = default_format_search_filters(ldap_fields)
    
    # Ensure we request memberOf attribute for group synchronization
    # Note: This is handled by the LDAP library, but we can customize if needed
    
    return filters
