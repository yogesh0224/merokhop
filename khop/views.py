from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.core.mail import send_mail
from .models import Vaccine, News
from .forms import RegistrationForm, LoginForm, ForgotPasswordForm

def home(request):
    child_vaccines = Vaccine.objects.filter(category='child')
    maternal_vaccines = Vaccine.objects.filter(category='maternal')
    news_items = News.objects.order_by('-date')[:3]  # Latest 3
    context = {
        'child_vaccines': child_vaccines,
        'maternal_vaccines': maternal_vaccines,
        'news_items': news_items,
    }
    return render(request, 'index.html', context)

def auth_view(request):
    if request.method == 'POST':
        if 'login' in request.POST:
            form = LoginForm(request.POST)
            if form.is_valid():
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                user = authenticate(username=username, password=password)
                if user:
                    login(request, user)
                    return redirect('home')
                else:
                    messages.error(request, 'Invalid credentials')
        elif 'register' in request.POST:
            form = RegistrationForm(request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, 'Registration successful. Please log in.')
        elif 'forgot' in request.POST:
            form = ForgotPasswordForm(request.POST)
            if form.is_valid():
                email = form.cleaned_data['email']
                # Simple reset logic (send email with dummy link for dev)
                send_mail(
                    'Password Reset',
                    'Click here to reset: http://example.com/reset',  # Replace with real logic in prod
                    'from@example.com',
                    [email]
                )
                messages.success(request, 'Reset link sent to email.')
    login_form = LoginForm()
    register_form = RegistrationForm()
    forgot_form = ForgotPasswordForm()
    context = {
        'login_form': login_form,
        'register_form': register_form,
        'forgot_form': forgot_form,
    }
    return render(request, 'auth.html', context)

def logout_view(request):
    logout(request)
    return redirect('home')

# Add scheduler view as before if needed, fetching from DB