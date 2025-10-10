from django.urls import path
from . import views

urlpatterns = [
    path("", views.passenger_list, name="passenger_list"),
    path("passenger/<int:pk>/", views.passenger_detail, name="passenger_detail"),
]
