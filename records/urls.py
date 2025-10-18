from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .api_views import PassengerViewSet
from .auth_views import register, login, logout, current_user

# Create a router for the API
router = DefaultRouter()
router.register(r'passengers', PassengerViewSet, basename='passenger')

urlpatterns = [
    # Authentication endpoints
    path("api/auth/register/", register, name='register'),
    path("api/auth/login/", login, name='login'),
    path("api/auth/logout/", logout, name='logout'),
    path("api/auth/me/", current_user, name='current_user'),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path("api/", include(router.urls)),
    
    # Original template views (optional)
    path("", views.passenger_list, name="passenger_list"),
    path("passenger/<int:pk>/", views.passenger_detail, name="passenger_detail"),
]