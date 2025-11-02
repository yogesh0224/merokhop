from django.contrib import admin
from .models import Vaccine, News  # Add others if needed

admin.site.register(Vaccine)
admin.site.register(News)