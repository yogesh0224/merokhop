from django.db import models
from django.contrib.auth.models import User
from datetime import date

class Vaccine(models.Model):
    CATEGORY_CHOICES = [
        ('child', 'Childhood'),
        ('maternal', 'Maternal'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    dose_schedule = models.TextField()  # e.g., "6, 10, 14" for months/weeks
    image = models.ImageField(upload_to='vaccines/', blank=True, null=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)

    def __str__(self):
        return self.name

class News(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField()
    date = models.DateField()
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    content = models.TextField()

    def __str__(self):
        return self.title

class UserSchedule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=[('child', 'Child'), ('maternal', 'Maternal')])
    reference_date = models.DateField()

    def __str__(self):
        return f"{self.user.username}'s {self.type} Schedule"

class ScheduleItem(models.Model):
    schedule = models.ForeignKey(UserSchedule, on_delete=models.CASCADE)
    vaccine = models.ForeignKey(Vaccine, on_delete=models.CASCADE)
    due_date = models.DateField()
    taken = models.BooleanField(default=False)

    def get_status(self):
        today = date.today()
        if self.due_date < today:
            return 'past'
        elif self.due_date == today:
            return 'due-today'
        else:
            return 'upcoming'