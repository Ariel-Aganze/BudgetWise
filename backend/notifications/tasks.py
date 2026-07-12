from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import Notification, EmailLog

@shared_task
def send_email_notification_async(user_id, subject, message, notification_id=None):
    """
    Send email notification asynchronously.
    """
    from accounts.models import User
    try:
        user = User.objects.get(id=user_id)
        
        if not user.email_notifications_enabled:
            return False
        
        send_mail(
            subject=f"BudgetWise: {subject}",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        # Log successful email
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            content=message,
            status='sent',
            sent_at=timezone.now(),
            notification_id=notification_id
        )
        return True
        
    except Exception as e:
        # Log failed email
        EmailLog.objects.create(
            recipient=user.email if 'user' in locals() else 'unknown',
            subject=subject,
            content=message,
            status='failed',
            error_message=str(e),
            notification_id=notification_id
        )
        return False

@shared_task
def check_all_budgets_async():
    """
    Check all active budgets for alert thresholds.
    This task should run periodically (e.g., every hour).
    """
    from budgets.models import Category
    from notifications.services import check_budget_alert_and_notify
    
    categories = Category.objects.filter(is_active=True)
    alerts_sent = 0
    
    for category in categories:
        if check_budget_alert_and_notify(category):
            alerts_sent += 1
    
    return f"Checked {categories.count()} budgets. Sent {alerts_sent} alerts."