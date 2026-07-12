from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from django.utils import timezone

class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey('budgets.Category', on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=0,
        validators=[MinValueValidator(1)],
        help_text="Expense amount in RWF"
    )
    description = models.CharField(max_length=255, blank=True)
    expense_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expenses'
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        ordering = ['-expense_date']
        indexes = [
            models.Index(fields=['user', 'expense_date']),
            models.Index(fields=['category', 'expense_date']),
        ]
    
    def __str__(self):
        return f"{self.category.name} - {self.amount:,.0f} RWF on {self.expense_date.strftime('%Y-%m-%d')}"
    
    def save(self, *args, **kwargs):
        if self.category.user != self.user:
            raise ValueError("Expense category does not belong to this user")
        super().save(*args, **kwargs)