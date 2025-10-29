from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def index(request):
    return render(request, 'index.html')

def auth_view(request):
    return render(request, 'auth.html')

def login_view(request):
    if request.method == 'POST':
        email = request.POST['login-email']
        password = request.POST['login-password']
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Login successful!')
            return redirect('index')
        else:
            messages.error(request, 'Invalid credentials.')
    return redirect('auth')

def register_view(request):
    if request.method == 'POST':
        name = request.POST['register-name']
        email = request.POST['register-email']
        password = request.POST['register-password']
        confirm_password = request.POST['confirm-password']
        if password == confirm_password:
            if User.objects.filter(username=email).exists():
                messages.error(request, 'Email already exists.')
            else:
                user = User.objects.create_user(username=email, email=email, password=password)
                user.first_name = name
                user.save()
                messages.success(request, 'Registration successful! Please login.')
                return redirect('auth')
        else:
            messages.error(request, 'Passwords do not match.')
    return redirect('auth')

def logout_view(request):
    logout(request)
    messages.success(request, 'Logged out successfully.')
    return redirect('index')

def forgot_password(request):
    # Implement password reset logic here (use Django's built-in password reset views for production)
    messages.info(request, 'Password reset link sent to your email.')
    return redirect('auth')