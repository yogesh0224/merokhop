from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('auth/', views.auth_view, name='auth'),
    path('logout/', views.logout_view, name='logout'),
    path('scheduler/', views.scheduler, name='scheduler'),
    path('mark-taken/<int:item_id>/', views.mark_taken, name='mark_taken'),
    path('export-schedule/', views.export_schedule, name='export_schedule'),
]