from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardAnalyticsView.as_view(), name='dashboard'),
    path('monthly-report/', views.MonthlyReportView.as_view(), name='monthly-report'),
    path('category/<int:category_id>/', views.CategoryAnalyticsView.as_view(), name='category-analytics'),
]