from django.shortcuts import render, get_object_or_404
from .models import Passenger

def passenger_list(request):
    passengers = Passenger.objects.all().order_by("arrival_date")
    return render(request, "records/passenger_list.html", {"passengers": passengers})

def passenger_detail(request, pk):
    passenger = get_object_or_404(Passenger, pk=pk)
    return render(request, "records/passenger_detail.html", {"passenger": passenger})
