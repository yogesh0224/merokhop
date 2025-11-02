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
        if 'login' in request.POST:
            form = LoginForm(request.POST)
            if form.is_valid():
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']
                user = authenticate(username=username, password=password)
                if user:
                    login(request, user)
                    messages.success(request, 'Login successful!')
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
                send_mail(
                    'Password Reset',
                    'Click here to reset: http://example.com/reset',  # Replace with token-based reset in prod
                    'noreply@merokhop.com',
                    [email],
                    fail_silently=False,
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
    messages.success(request, 'Logged out successfully.')
    return redirect('home')

@login_required
@csrf_protect
def scheduler(request):
    if request.method == 'POST':
        schedule_type = request.POST.get('type')
        reference_date = request.POST.get('dob')
        user_schedule, created = UserSchedule.objects.get_or_create(
            user=request.user, type=schedule_type, defaults={'reference_date': reference_date}
        )
        if not created:
            user_schedule.reference_date = reference_date
            user_schedule.save()
            ScheduleItem.objects.filter(schedule=user_schedule).delete()

        vaccines = Vaccine.objects.filter(category=schedule_type[:5])
        schedule_details = []
        for vaccine in vaccines:
            # Parse dose_schedule (assume format like "6" for months/weeks)
            try:
                offset = int(vaccine.dose_schedule.split()[0])
            except:
                offset = 0
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