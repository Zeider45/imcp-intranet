# Role-Based Authorization with Active Directory Groups

This document explains how role-based authorization is configured using Active Directory groups in the IMCP Intranet backend.

## Overview

The system automatically syncs Active Directory groups to Django groups when users authenticate via LDAP. These groups are then used to control access to different modules and operations throughout the application.

## Architecture

### 1. AD Group Synchronization

When a user authenticates via LDAP/Active Directory:

1. The user's AD groups are extracted from the `memberOf` attribute
2. AD groups are mapped to Django groups using the mapping in `api/ldap_sync.py`
3. The user is automatically added to the corresponding Django groups
4. Previous group memberships are cleared to ensure sync accuracy

### 2. Permission Classes

Custom permission classes (in `api/permissions.py`) check group membership to grant or deny access:

```python
from api.permissions import IsHRManager, CanManageAnnouncements

class AnnouncementViewSet(viewsets.ModelViewSet):
    permission_classes = [CanManageAnnouncements]
```

### 3. Permission Evaluation

- **Read Operations**: Most resources allow read access to all authenticated users
- **Write Operations**: Create, update, and delete operations require specific group membership
- **Object-Level Permissions**: Owners can modify their own resources, managers can modify any

## Active Directory Groups

### Management Groups

#### HR_Managers / Gerentes_RH
**Permissions:**
- Manage departments
- Manage user profiles
- Approve leave requests
- Manage training courses

#### Department_Managers / Gerentes_Departamento
**Permissions:**
- Manage departments
- Approve leave requests
- Create announcements
- Upload documents
- Manage projects

#### Project_Managers / Gerentes_Proyecto
**Permissions:**
- Create and manage projects
- Manage tasks
- View team resources

### Functional Groups

#### Communications / Comunicaciones
**Permissions:**
- Create and manage announcements
- Manage company communications

#### Document_Managers / Administradores_Documentos
**Permissions:**
- Upload and manage documents
- Manage document categories

#### Resource_Managers / Administradores_Recursos
**Permissions:**
- Manage bookable resources (rooms, equipment)
- View all reservations

#### Facilities / Instalaciones
**Permissions:**
- Manage physical resources
- Manage facilities

#### Training_Managers / Administradores_Capacitacion
**Permissions:**
- Create and manage training courses
- Issue certificates
- Track employee training progress

## Module Permissions

### Core Modules

| Module | View | Create | Edit | Delete | Required Group |
|--------|------|--------|------|--------|---------------|
| Departments | ✅ All | ❌ | ❌ | ❌ | HR_Managers, Department_Managers |
| User Profiles | ✅ All | ❌ | ⚠️ Own | ❌ | HR_Managers (for others) |
| Announcements | ✅ All | ❌ | ❌ | ❌ | Communications, Department_Managers |
| Documents | ✅ All | ❌ | ❌ | ❌ | Document_Managers, Department_Managers |

### Time & Resource Management

| Module | View | Create | Edit | Delete | Required Group |
|--------|------|--------|------|--------|---------------|
| Calendar Events | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | Department_Managers (for all) |
| Leave Requests | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | - |
| Leave Approvals | - | - | ❌ | - | HR_Managers, Department_Managers |
| Resources | ✅ All | ❌ | ❌ | ❌ | Resource_Managers, Facilities |
| Reservations | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | - |

### Training & Development

| Module | View | Create | Edit | Delete | Required Group |
|--------|------|--------|------|--------|---------------|
| Courses | ✅ All | ❌ | ❌ | ❌ | Training_Managers, HR_Managers |
| Enrollments | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | - |
| Knowledge Articles | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | - |

### Collaboration

| Module | View | Create | Edit | Delete | Required Group |
|--------|------|--------|------|--------|---------------|
| Forum Categories | ✅ All | ❌ | ❌ | ❌ | Admins |
| Forum Posts | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | - |
| Suggestions | ✅ All | ✅ All | ⚠️ Own | ⚠️ Own | - |

### Tools & Data

| Module | View | Create | Edit | Delete | Required Group |
|--------|------|--------|------|--------|---------------|
| KPI Dashboards | ✅ All | ❌ | ❌ | ❌ | Department_Managers, HR_Managers |
| Quick Links | ✅ All | ❌ | ❌ | ❌ | Admins |
| Projects | ✅ All | ❌ | ❌ | ❌ | Project_Managers, Department_Managers |
| Tasks | ✅ All | ✅ All | ⚠️ Own/Assigned | ⚠️ Own | - |

**Legend:**
- ✅ All: All authenticated users
- ❌: Requires specific group
- ⚠️ Own: User can only modify their own items

## Configuration

### AD Group Mapping

Edit `api/ldap_sync.py` to customize the mapping between AD groups and Django groups:

```python
group_mapping = {
    # Map AD group name -> Django group name
    'HR_Managers': 'HR_Managers',
    'Gerentes_RH': 'HR_Managers',  # Spanish -> English
    'Custom_AD_Group': 'Django_Group_Name',
}
```

### Adding New Roles

1. **Create the AD Group** in Active Directory
2. **Add to Group Mapping** in `api/ldap_sync.py`
3. **Create Permission Class** in `api/permissions.py`:

```python
class CanManageNewModule(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        return request.user.groups.filter(name__in=[
            'New_Group_Name',
        ]).exists()
```

4. **Apply to ViewSet** in `api/views.py`:

```python
class NewModuleViewSet(viewsets.ModelViewSet):
    permission_classes = [CanManageNewModule]
    # ... rest of viewset
```

## API Response with Groups

When a user logs in, the API returns their group memberships:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@company.com",
    "first_name": "John",
    "last_name": "Doe",
    "groups": [
      "HR_Managers",
      "Department_Managers"
    ]
  },
  "token": "abc123..."
}
```

The frontend can use this information to:
- Show/hide UI elements based on permissions
- Enable/disable actions based on group membership
- Display appropriate menu items

## Testing

### Unit Tests

The system includes comprehensive tests for permissions:

```bash
python manage.py test api.test_permissions
```

Tests cover:
- AD group synchronization
- Group mapping (English/Spanish)
- Permission checks for each module
- Object-level permissions

### Manual Testing

1. **Create Test Groups** in Django admin or via shell:
```python
from django.contrib.auth.models import Group, User

# Create groups
hr_group = Group.objects.create(name='HR_Managers')
dept_group = Group.objects.create(name='Department_Managers')

# Add user to groups
user = User.objects.get(username='testuser')
user.groups.add(hr_group, dept_group)
```

2. **Test API Endpoints**:
```bash
# Login and get token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'

# Try creating a department (requires HR_Managers or Department_Managers)
curl -X POST http://localhost:8000/api/departments/ \
  -H "Authorization: Token <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Dept","description":"Test"}'
```

## Security Considerations

1. **Principle of Least Privilege**: Users are only granted the minimum permissions needed
2. **Read-Only by Default**: Most resources default to read-only for authenticated users
3. **Group Sync on Login**: Groups are synced on every login to ensure accuracy
4. **No Hardcoded Passwords**: All credentials come from AD/LDAP
5. **Object-Level Security**: Users can only modify their own resources unless they're managers

## Troubleshooting

### Groups Not Syncing

1. **Check LDAP Connection**:
```python
from django_python3_ldap.ldap import Connection
# Test connection in Django shell
```

2. **Verify memberOf Attribute**:
```bash
# In LDAP, verify user has memberOf attribute populated
ldapsearch -x -h ad.example.com -D "CN=user,DC=example,DC=com" \
  -W -b "DC=example,DC=com" "(sAMAccountName=username)" memberOf
```

3. **Check Logs**:
```bash
# Look for group sync messages
tail -f logs/django.log | grep "Synced.*groups"
```

### Permission Denied Errors

1. **Verify User Groups**:
```python
from django.contrib.auth.models import User
user = User.objects.get(username='username')
print(list(user.groups.values_list('name', flat=True)))
```

2. **Check Permission Class**:
```python
from api.permissions import CanManageAnnouncements
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/')
request.user = user
permission = CanManageAnnouncements()
print(permission.has_permission(request, None))
```

## Best Practices

1. **Use Descriptive Group Names**: Make AD group names clear and self-documenting
2. **Document Group Purpose**: Keep this file updated when adding new groups
3. **Test Permissions**: Always test new permission classes with unit tests
4. **Audit Group Membership**: Regularly review who has access to what
5. **Use Object-Level Permissions**: Allow users to manage their own resources
6. **Consistent Naming**: Use consistent patterns for group names (English primary, Spanish mapped)

## Related Documentation

- [Active Directory Setup](ACTIVE_DIRECTORY_SETUP.md) - How to configure LDAP connection
- [Module Documentation](../MODULES.md) - Full list of modules and endpoints
- [API Documentation](../README.md) - General API usage guide
