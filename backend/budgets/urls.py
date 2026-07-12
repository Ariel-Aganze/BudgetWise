from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoryListView.as_view(), name='category-list'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('summary/', views.CategorySummaryView.as_view(), name='category-summary'),
    path('check-alerts/', views.BudgetAlertCheckView.as_view(), name='check-alerts'),
]