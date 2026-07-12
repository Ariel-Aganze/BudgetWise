from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category
from .serializers import CategorySerializer, CategoryCreateUpdateSerializer
from notifications.services import check_budget_alert_and_notify

class CategoryListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategoryCreateUpdateSerializer
        return CategorySerializer
    
    def perform_create(self, serializer):
        category = serializer.save(user=self.request.user)
        check_budget_alert_and_notify(category)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CategoryCreateUpdateSerializer
        return CategorySerializer
    
    def perform_update(self, serializer):
        category = serializer.save()
        check_budget_alert_and_notify(category)
    
    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        category.is_active = False
        category.save()
        return Response(
            {'message': 'Category deleted successfully'},
            status=status.HTTP_200_OK
        )

class CategorySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        categories = Category.objects.filter(user=request.user, is_active=True)
        
        total_budget = 0
        total_spent = 0
        
        category_data = []
        
        for category in categories:
            spent = category.total_spent_current_month
            total_budget += int(category.budget_limit)
            total_spent += int(spent)
            
            category_data.append({
                'id': category.id,
                'name': category.name,
                'budget_limit': category.budget_limit,
                'total_spent_current_month': spent,
                'spending_percentage': category.spending_percentage,
            })
        
        remaining_balance = total_budget - total_spent
        spending_percentage = (total_spent / total_budget * 100) if total_budget > 0 else 0
        
        return Response({
            'categories': category_data,
            'summary': {
                'total_budget': total_budget,
                'total_spent': total_spent,
                'remaining_balance': remaining_balance,
                'spending_percentage': round(spending_percentage, 2)
            }
        })

class BudgetAlertCheckView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        categories = Category.objects.filter(user=request.user, is_active=True)
        alerts_triggered = []
        
        for category in categories:
            alert_sent = check_budget_alert_and_notify(category)
            if alert_sent:
                alerts_triggered.append({
                    'category_id': category.id,
                    'category_name': category.name,
                    'alert_level': category.alert_level,
                    'spending_percentage': category.spending_percentage
                })
        
        return Response({
            'message': f'Alert check completed. {len(alerts_triggered)} alerts triggered.',
            'alerts': alerts_triggered
        })