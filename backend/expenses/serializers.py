from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_budget_limit = serializers.DecimalField(
        source='category.budget_limit', max_digits=12, decimal_places=0, read_only=True
    )
    
    class Meta:
        model = Expense
        fields = (
            'id', 'category', 'category_name', 'category_budget_limit',
            'amount', 'description', 'expense_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_category(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("This category does not belong to you.")
        if not value.is_active:
            raise serializers.ValidationError("This category is inactive.")
        return value
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

class ExpenseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ('category', 'amount', 'description', 'expense_date')
    
    def validate_category(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("This category does not belong to you.")
        if not value.is_active:
            raise serializers.ValidationError("This category is inactive.")
        return value
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value