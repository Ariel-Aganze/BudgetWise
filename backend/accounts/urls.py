from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset-password'),
    
    # Admin URLs
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/create/', views.AdminCreateUserView.as_view(), name='admin-create-user'),
    path('admin/users/<int:user_id>/', views.AdminUpdateUserView.as_view(), name='admin-update-user'),
    path('admin/stats/', views.AdminSystemStatsView.as_view(), name='admin-stats'),
    path('admin/logs/', views.AdminSystemLogsView.as_view(), name='admin-logs'),
    path('admin/smtp/', views.AdminSMTPConfigView.as_view(), name='admin-smtp'),
    path('admin/backup/', views.AdminBackupView.as_view(), name='admin-backup'),
]