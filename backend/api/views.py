from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import HealthCheckSerializer


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint to verify API is working
    """
    data = {
        'status': 'ok',
        'message': 'API is running successfully'
    }
    serializer = HealthCheckSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def welcome(request):
    """
    Welcome endpoint for the intranet
    """
    return Response({
        'message': 'Bienvenido a la Intranet IMCP',
        'version': '1.0.0',
        'description': 'Sistema de intranet con Django y Next.js'
    }, status=status.HTTP_200_OK)

