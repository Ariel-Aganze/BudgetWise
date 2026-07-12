from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db import models
from django.utils import timezone
from datetime import timedelta
from budgets.models import Category
from expenses.models import Expense
from rest_framework import serializers

class DashboardSummarySerializer(serializers.Serializer):
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=0)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=0)
    remaining_balance = serializers.DecimalField(max_digits=15, decimal_places=0)
    spending_percentage = serializers.FloatField()
    currency = serializers.CharField()
    
class DashboardAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.localtime(timezone.now())
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        categories = Category.objects.filter(user=user, is_active=True)
        
        total_budget = 0
        total_expenses_month = 0
        
        for category in categories:
            total_budget += int(category.budget_limit)
            total_expenses_month += int(category.total_spent_current_month)
        
        remaining_balance = total_budget - total_expenses_month
        spending_percentage = (total_expenses_month / total_budget * 100) if total_budget > 0 else 0
        
        category_breakdown = []
        categories_with_alerts = []
        
        for category in categories:
            spent = category.total_spent_current_month
            percentage = category.spending_percentage
            alert_level = category.alert_level
            
            category_data = {
                'id': category.id,
                'name': category.name,
                'budget_limit': category.budget_limit,
                'spent': spent,
                'remaining': category.remaining_budget,
                'percentage': percentage,
                'alert_level': alert_level,
                'alert_percentage': category.alert_percentage,
            }
            category_breakdown.append(category_data)
            
            if alert_level:
                categories_with_alerts.append(category_data)
        
        recent_expenses = Expense.objects.filter(user=user).order_by('-expense_date')[:5]
        recent_expenses_data = [
            {
                'id': exp.id,
                'amount': exp.amount,
                'description': exp.description or 'No description',
                'category': exp.category.name,
                'date': exp.expense_date.strftime('%Y-%m-%d')
            }
            for exp in recent_expenses
        ]
        
        monthly_trend = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=30 * i)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(microseconds=1)
            
            month_expenses = Expense.objects.filter(
                user=user,
                expense_date__gte=month_start,
                expense_date__lte=month_end
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            
            monthly_trend.append({
                'month': month_start.strftime('%B %Y'),
                'total': month_expenses
            })
        
        top_categories = Expense.objects.filter(
            user=user,
            expense_date__gte=start_of_month
        ).values('category__name').annotate(
            total=models.Sum('amount')
        ).order_by('-total')[:5]
        
        unread_notifications = user.unread_notifications_count
        
        return Response({
            'summary': {
                'total_budget': total_budget,
                'total_expenses': total_expenses_month,
                'remaining_balance': remaining_balance,
                'spending_percentage': round(spending_percentage, 2),
                'currency': 'RWF'
            },
            'category_breakdown': category_breakdown,
            'categories_with_alerts': categories_with_alerts,
            'recent_expenses': recent_expenses_data,
            'monthly_trend': monthly_trend,
            'top_categories': list(top_categories),
            'unread_notifications': unread_notifications
        })
    
class MonthlyReportView(APIView):
    """
    Generate detailed monthly report for specified month.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        user = request.user
        
        # Create date range
        start_date = timezone.datetime(year, month, 1, 0, 0, 0)
        if month == 12:
            end_date = timezone.datetime(year + 1, 1, 1, 0, 0, 0) - timedelta(microseconds=1)
        else:
            end_date = timezone.datetime(year, month + 1, 1, 0, 0, 0) - timedelta(microseconds=1)
        
        # Get all expenses for the month
        expenses = Expense.objects.filter(
            user=user,
            expense_date__gte=start_date,
            expense_date__lte=end_date
        )
        
        total_expenses = expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        
        # Category breakdown
        category_report = []
        categories = Category.objects.filter(user=user, is_active=True)
        
        for category in categories:
            category_expenses = expenses.filter(category=category)
            spent = category_expenses.aggregate(total=models.Sum('amount'))['total'] or 0
            percentage = (spent / category.budget_limit * 100) if category.budget_limit > 0 else 0
            
            category_report.append({
                'category_name': category.name,
                'budget_limit': category.budget_limit,
                'spent': spent,
                'remaining': category.budget_limit - spent,
                'utilization_percentage': round(percentage, 2),
                'alert_percentage': category.alert_percentage,
                'transaction_count': category_expenses.count()
            })
        
        # Daily breakdown
        daily_breakdown = {}
        for day in range(1, end_date.day + 1):
            day_expenses = expenses.filter(expense_date__day=day)
            daily_breakdown[day] = day_expenses.aggregate(total=models.Sum('amount'))['total'] or 0
        
        return Response({
            'year': year,
            'month': month,
            'month_name': start_date.strftime('%B'),
            'total_expenses': total_expenses,
            'category_report': category_report,
            'daily_breakdown': daily_breakdown,
            'total_transactions': expenses.count(),
            'currency': 'RWF'
        })

class CategoryAnalyticsView(APIView):
    """
    Detailed analytics for a specific category.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, category_id):
        try:
            category = Category.objects.get(id=category_id, user=request.user)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)
        
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Current month stats
        current_month_spent = category.total_spent_current_month
        monthly_percentage = category.spending_percentage
        
        # Last 6 months trend for this category
        monthly_trend = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=30 * i)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(microseconds=1)
            
            month_expenses = Expense.objects.filter(
                user=request.user,
                category=category,
                expense_date__gte=month_start,
                expense_date__lte=month_end
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            
            monthly_trend.append({
                'month': month_start.strftime('%B %Y'),
                'spent': month_expenses,
                'budget_limit': category.budget_limit,
                'percentage': (month_expenses / category.budget_limit * 100) if category.budget_limit > 0 else 0
            })
        
        # Recent expenses for this category
        recent_expenses = Expense.objects.filter(category=category).order_by('-expense_date')[:10]
        recent_expenses_data = [
            {
                'id': exp.id,
                'amount': exp.amount,
                'description': exp.description or 'No description',
                'date': exp.expense_date.strftime('%Y-%m-%d')
            }
            for exp in recent_expenses
        ]
        
        return Response({
            'category': {
                'id': category.id,
                'name': category.name,
                'budget_limit': category.budget_limit,
                'alert_percentage': category.alert_percentage,
                'is_active': category.is_active
            },
            'current_month': {
                'spent': current_month_spent,
                'remaining': category.remaining_budget,
                'percentage': round(monthly_percentage, 2),
                'alert_level': category.alert_level
            },
            'monthly_trend': monthly_trend,
            'recent_expenses': recent_expenses_data,
            'currency': 'RWF'
        })