from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.mail import send_mail
from django.http import HttpResponse
from .models import Vaccine, News, UserSchedule, ScheduleItem
from .forms import RegistrationForm, LoginForm, ForgotPasswordForm
from datetime import timedelta
from dateutil.relativedelta import relativedelta
import icalendar
from django.views.decorators.csrf import csrf_protect
import re

@csrf_protect
def home(request):
    child_vaccines = Vaccine.objects.filter(category='child')
    maternal_vaccines = Vaccine.objects.filter(category='maternal')
    news_items = News.objects.order_by('-date')[:3]
    context = {
        'child_vaccines': child_vaccines,
        'maternal_vaccines': maternal_vaccines,
        'news_items': news_items,
    }
    return render(request, 'index.html', context)

@csrf_protect
def auth_view(request):
    if request.method == 'POST':
        print("POST received for auth:", request.POST)  # Debug: Check incoming data
        if 'login' in request.POST:
            form = LoginForm(request.POST)
            print("Login form data:", form.data)  # Debug
            if form.is_valid():
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                print(f"Auth attempt for {username}")  # Debug
                user = authenticate(request, username=username, password=password)
                print(f"Auth result: {user}")  # Debug: None or User object
                if user is not None:
                    login(request, user)
                    messages.success(request, 'Login successful!')
                    return redirect('home')
                else:
                    messages.error(request, 'Invalid username or password.')
            else:
                print("Login form errors:", form.errors)  # Debug
                messages.error(request, 'Form validation failed. Check fields.')
        elif 'register' in request.POST:
            form = RegistrationForm(request.POST)
            print("Register form data:", form.data)  # Debug
            if form.is_valid():
                user = form.save()
                print(f"User registered: {user.username}, is_active: {user.is_active}")  # Debug
                messages.success(request, 'Registration successful. You can now log in.')
            else:
                print("Register form errors:", form.errors)  # Debug
                messages.error(request, 'Registration failed. Check errors below.')
        elif 'forgot' in request.POST:
            form = ForgotPasswordForm(request.POST)
            if form.is_valid():
                email = form.cleaned_data['email']
                print(f"Forgot password for email: {email}")  # Debug
                send_mail(
                    'Password Reset',
                    'Click here to reset: http://example.com/reset',  # Replace with real link
                    'noreply@merokhop.com',
                    [email],
                    fail_silently=False,
                )
                messages.success(request, 'Reset link sent to your email (check console for dev).')
            else:
                messages.error(request, 'Invalid email.')

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
    messages.success(request, 'Logged out successfully.')
    return redirect('home')

@login_required
@csrf_protect
def scheduler(request):
    if request.method == 'POST':
        schedule_type = request.POST.get('type')
        reference_date = request.POST.get('dob')
        if not reference_date:
            messages.error(request, 'Please enter a valid date.')
            return redirect('scheduler')
        user_schedule, created = UserSchedule.objects.get_or_create(
            user=request.user, type=schedule_type, defaults={'reference_date': reference_date}
        )
        if not created:
            user_schedule.reference_date = reference_date
            user_schedule.save()
            ScheduleItem.objects.filter(schedule=user_schedule).delete()

        vaccines = Vaccine.objects.filter(category=schedule_type[:5])
        if not vaccines:
            messages.error(request, 'No vaccines found for this category. Add in admin.')
            return redirect('scheduler')

        schedule_details = []
        for vaccine in vaccines:
            # Parse all numbers from dose_schedule
            offsets = re.findall(r'\d+', vaccine.dose_schedule)
            if not offsets:
                offsets = [0]  # Default for "At birth"
            for offset_str in offsets:
                offset = int(offset_str)
                if schedule_type == 'child':
                    due_date = user_schedule.reference_date + relativedelta(months=offset)
                else:
                    due_date = user_schedule.reference_date - timedelta(weeks=offset)
                item = ScheduleItem.objects.create(schedule=user_schedule, vaccine=vaccine, due_date=due_date)
                schedule_details.append(f"{vaccine.name} due on {due_date}")

        # Send notification email
        email_body = "Your schedule has been saved. Upcoming vaccines:\n" + "\n".join(schedule_details)
        send_mail(
            'Your Vaccine Schedule - Mero Khop',
            email_body,
            'noreply@merokhop.com',
            [request.user.email],
            fail_silently=False,
        )
        messages.success(request, 'Schedule saved and notification sent!')

        return redirect('scheduler')

    user_schedule = UserSchedule.objects.filter(user=request.user).first()
    schedule_items = ScheduleItem.objects.filter(schedule=user_schedule) if user_schedule else []
    context = {'schedule_items': schedule_items, 'user_schedule': user_schedule}
    return render(request, 'index.html', context)  # Or 'scheduler.html' if separate

@login_required
def mark_taken(request, item_id):
    item = ScheduleItem.objects.get(id=item_id, schedule__user=request.user)
    item.taken = not item.taken
    item.save()
    return redirect('scheduler')

@login_required
def export_schedule(request):
    user_schedule = UserSchedule.objects.filter(user=request.user).first()
    if not user_schedule:
        return HttpResponse("No schedule found", status=404)

    cal = icalendar.Calendar()
    cal.add('prodid', '-//MeroKhop//EN')
    cal.add('version', '2.0')

    for item in ScheduleItem.objects.filter(schedule=user_schedule):
        event = icalendar.Event()
        event.add('summary', f"{item.vaccine.name} Due")
        event.add('dtstart', item.due_date)
        cal.add_component(event)

    response = HttpResponse(cal.to_ical(), content_type='text/calendar')
    response['Content-Disposition'] = 'attachment; filename="schedule.ics"'
    return response