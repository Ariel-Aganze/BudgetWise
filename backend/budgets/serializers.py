from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    total_spent_current_month = serializers.SerializerMethodField()
    remaining_budget = serializers.SerializerMethodField()
    spending_percentage = serializers.SerializerMethodField()
    alert_level = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = (
            'id', 'name', 'budget_limit', 'alert_percentage', 'is_active',
            'total_spent_current_month', 'remaining_budget', 
            'spending_percentage', 'alert_level', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_total_spent_current_month(self, obj):
        return obj.total_spent_current_month
    
    def get_remaining_budget(self, obj):
        return obj.remaining_budget
    
    def get_spending_percentage(self, obj):
        return obj.spending_percentage
    
    def get_alert_level(self, obj):
        return obj.alert_level
    
    def validate_name(self, value):
        user = self.context['request'].user
        if self.instance:
            if Category.objects.filter(user=user, name=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("You already have a category with this name.")
        else:
            if Category.objects.filter(user=user, name=value).exists():
                raise serializers.ValidationError("You already have a category with this name.")
        return value
    
    def validate_budget_limit(self, value):
        if value < 0:
            raise serializers.ValidationError("Budget limit cannot be negative.")
        return value
    
    def validate_alert_percentage(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Alert percentage must be between 1 and 100.")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('name', 'budget_limit', 'alert_percentage', 'is_active')
    
    def validate_name(self, value):
        user = self.context['request'].user
        if self.instance:
            if Category.objects.filter(user=user, name=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("You already have a category with this name.")
        else:
            if Category.objects.filter(user=user, name=value).exists():
                raise serializers.ValidationError("You already have a category with this name.")
        return value
    
    def validate_budget_limit(self, value):
        if value < 0:
            raise serializers.ValidationError("Budget limit cannot be negative.")
        return value
    
    def validate_alert_percentage(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Alert percentage must be between 1 and 100.")
        return value