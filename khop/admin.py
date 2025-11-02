from django.contrib import admin
from .models import Vaccine, News, UserSchedule, ScheduleItem

admin.site.register(Vaccine)
admin.site.register(News)
admin.site.register(UserSchedule)
admin.site.register(ScheduleItem)