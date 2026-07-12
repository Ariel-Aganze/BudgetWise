from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-read/', views.MarkNotificationsReadView.as_view(), name='mark-read'),
    path('unread-count/', views.UnreadNotificationCountView.as_view(), name='unread-count'),
    path('delete-all-read/', views.DeleteAllReadNotificationsView.as_view(), name='delete-all-read'),
    path('email-logs/', views.EmailLogListView.as_view(), name='email-logs'),
]