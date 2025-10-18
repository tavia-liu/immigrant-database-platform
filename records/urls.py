from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import PassengerViewSet

# Create a router for the API
router = DefaultRouter()
router.register(r'passengers', PassengerViewSet, basename='passenger')

urlpatterns = [
    # API endpoints
    path("api/", include(router.urls)),
    
    # Original template views (optional - can remove if only using React)
    path("", views.passenger_list, name="passenger_list"),
    path("passenger/<int:pk>/", views.passenger_detail, name="passenger_detail"),
]