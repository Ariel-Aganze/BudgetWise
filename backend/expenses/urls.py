from django.urls import path
from . import views

urlpatterns = [
    path('', views.ExpenseListView.as_view(), name='expense-list'),
    path('<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
    path('recent/', views.RecentExpensesView.as_view(), name='recent-expenses'),
    path('monthly-summary/', views.MonthlyExpenseSummaryView.as_view(), name='monthly-summary'),
]