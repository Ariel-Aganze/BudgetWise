from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.utils import timezone
from .models import Expense
from .serializers import ExpenseSerializer, ExpenseCreateUpdateSerializer
from notifications.services import check_budget_alert_and_notify

class ExpenseListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['amount', 'expense_date', 'created_at']
    ordering = ['-expense_date']
    search_fields = ['description', 'category__name']
    
    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)
        
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(expense_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(expense_date__lte=end_date)
        
        month = self.request.query_params.get('month')
        if month:
            year, month = map(int, month.split('-'))
            queryset = queryset.filter(
                expense_date__year=year,
                expense_date__month=month
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ExpenseCreateUpdateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        check_budget_alert_and_notify(expense.category)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ExpenseCreateUpdateSerializer
        return ExpenseSerializer
    
    def perform_update(self, serializer):
        old_category = self.get_object().category
        expense = serializer.save()
        if old_category != expense.category:
            check_budget_alert_and_notify(old_category)
        check_budget_alert_and_notify(expense.category)
    
    def perform_destroy(self, instance):
        category = instance.category
        instance.delete()
        check_budget_alert_and_notify(category)

class RecentExpensesView(generics.ListAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        limit = int(self.request.query_params.get('limit', 10))
        return Expense.objects.filter(user=self.request.user)[:limit]

class MonthlyExpenseSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        now = timezone.localtime(timezone.now())
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        expenses = Expense.objects.filter(
            user=request.user,
            expense_date__gte=start_of_month
        )
        
        total_expenses = expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        
        category_breakdown = {}
        category_expenses = expenses.values('category__name').annotate(
            total=models.Sum('amount')
        )
        
        for item in category_expenses:
            category_breakdown[item['category__name']] = item['total']
        
        daily_trend = {}
        for day in range(1, now.day + 1):
            day_expenses = expenses.filter(expense_date__day=day)
            daily_trend[day] = day_expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        
        return Response({
            'total_expenses': total_expenses,
            'category_breakdown': category_breakdown,
            'daily_trend': daily_trend,
            'days_in_month': now.day
        })