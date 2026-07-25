from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    budget_limit = models.DecimalField(
        max_digits=12, 
        decimal_places=0,
        validators=[MinValueValidator(0)],
        help_text="Monthly budget limit in RWF"
    )
    alert_percentage = models.IntegerField(
        default=80,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Percentage at which to send warning alert (1-100)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']
        # Remove the unique_together constraint - we'll handle uniqueness in validation
        # unique_together = ['user', 'name']  # REMOVE THIS LINE
    
    def __str__(self):
        return f"{self.name} - {self.budget_limit:,.0f} RWF"
    
    def get_spent_for_current_month(self):
        """Calculate total spent in this category for the current calendar month"""
        from expenses.models import Expense
        
        now = timezone.localtime(timezone.now())
        # Get first day of current month at 00:00:00 (with timezone)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        total = Expense.objects.filter(
            category=self,
            expense_date__gte=start_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return total
    
    @property
    def total_spent_current_month(self):
        return self.get_spent_for_current_month()
    
    @property
    def remaining_budget(self):
        return self.budget_limit - self.total_spent_current_month
    
    @property
    def spending_percentage(self):
        if self.budget_limit == 0:
            return 0
        percentage = (self.total_spent_current_month / self.budget_limit) * 100
        return round(min(percentage, 100), 1)
    
    @property
    def alert_level(self):
        percentage = self.spending_percentage
        
        if percentage >= 100:
            return 'exceeded'
        elif percentage >= 95:
            return 'critical'
        elif percentage >= self.alert_percentage:
            return 'warning'
        return None
    
    def save(self, *args, **kwargs):
        if self.budget_limit < 0:
            raise ValueError("Budget limit cannot be negative")
        super().save(*args, **kwargs)