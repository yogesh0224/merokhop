from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def auth(request):
    return render(request, 'auth.html')