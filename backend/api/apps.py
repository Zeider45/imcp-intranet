from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    def ready(self):
        # Import signals to ensure signal handlers are registered
        try:
            import api.signals  # noqa: F401
        except Exception:
            # Avoid crashing if signals fail during certain management commands
            pass
