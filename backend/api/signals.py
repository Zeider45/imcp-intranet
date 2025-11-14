from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile automatically when a new User is created.

    This ensures users that get created by LDAP authentication (or admin)
    have a corresponding profile row.
    """
    if created:
        try:
            UserProfile.objects.create(user=instance)
        except Exception:
            # Don't let profile creation break user creation in edge cases
            pass
