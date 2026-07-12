from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    """
    In-app notification model for storing user notifications.
    """
    NOTIFICATION_TYPES = [
        ('warning', 'Warning Alert'),
        ('critical', 'Critical Alert'),
        ('exceeded', 'Budget Exceeded'),
        ('info', 'Information'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    # Optional: link to related category
    category = models.ForeignKey('budgets.Category', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.save()
        return self

class EmailLog(models.Model):
    """
    Log of email notifications sent for monitoring and troubleshooting.
    """
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    
    recipient = models.EmailField()
    subject = models.CharField(max_length=255)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    notification = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True, blank=True, related_name='email_logs')
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'email_logs'
        verbose_name = 'Email Log'
        verbose_name_plural = 'Email Logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Email to {self.recipient} - {self.status} at {self.sent_at or self.created_at}"