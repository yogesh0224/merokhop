from django.db import models

class Vaccine(models.Model):
    CATEGORY_CHOICES = [
        ('child', 'Childhood'),
        ('maternal', 'Maternal'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    dose_schedule = models.TextField()  # e.g., "Doses at 6, 10, 14 weeks"
    image = models.ImageField(upload_to='vaccines/', blank=True, null=True)
    video = models.FileField(upload_to='videos/', blank=True, null=True)  # If you have videos

    def __str__(self):
        return self.name

class News(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField()
    date = models.DateField()
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    content = models.TextField()  # Full details for modals

    def __str__(self):
        return self.title

