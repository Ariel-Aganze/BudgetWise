from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from .models import Notification, EmailLog

def send_email_notification(user, subject, message, notification_instance=None):
    """
    Send email notification to user and log the result.
    Returns: bool indicating success or failure.
    """
    if not user.email_notifications_enabled:
        return False
    
    try:
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
            notification=notification_instance
        )
        return True
        
    except Exception as e:
        # Log failed email
        EmailLog.objects.create(
            recipient=user.email,
            subject=subject,
            content=message,
            status='failed',
            error_message=str(e),
            notification=notification_instance
        )
        print(f"Failed to send email to {user.email}: {str(e)}")
        return False

def create_in_app_notification(user, title, message, notification_type='info', category=None):
    """
    Create an in-app notification for the user.
    Returns: Notification instance
    """
    if not user.in_app_notifications_enabled:
        return None
    
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        category=category
    )
    return notification

def check_budget_alert_and_notify(category):
    """
    Check if a budget category has reached alert thresholds and send notifications.
    Returns: bool indicating if an alert was sent.
    """
    alert_level = category.alert_level
    
    if alert_level is None:
        return False
    
    spending_percentage = category.spending_percentage
    budget_limit = category.budget_limit
    spent_amount = category.total_spent_current_month
    
    # Prepare notification content based on alert level
    if alert_level == 'exceeded':
        title = f"Budget Exceeded: {category.name}"
        message = (f"You have exceeded your {category.name} budget. "
                  f"Budget: {budget_limit:,.0f} RWF | Spent: {spent_amount:,.0f} RWF | "
                  f"Over budget by: {spent_amount - budget_limit:,.0f} RWF")
        notification_type = 'exceeded'
        
    elif alert_level == 'critical':
        title = f"Critical Alert: {category.name}"
        message = (f"You have reached {spending_percentage:.1f}% of your {category.name} budget. "
                  f"Budget: {budget_limit:,.0f} RWF | Spent: {spent_amount:,.0f} RWF | "
                  f"Remaining: {category.remaining_budget:,.0f} RWF")
        notification_type = 'critical'
        
    elif alert_level == 'warning':
        title = f"Budget Warning: {category.name}"
        message = (f"You have reached {spending_percentage:.1f}% of your {category.name} budget. "
                  f"Budget: {budget_limit:,.0f} RWF | Spent: {spent_amount:,.0f} RWF | "
                  f"Remaining: {category.remaining_budget:,.0f} RWF")
        notification_type = 'warning'
    else:
        return False
    
    # Check if we already sent a notification for this alert level recently (last 24 hours)
    from .models import Notification
    existing_notification = Notification.objects.filter(
        user=category.user,
        category=category,
        notification_type=notification_type,
        created_at__gte=timezone.now() - timezone.timedelta(hours=24)
    ).exists()
    
    if existing_notification:
        return False
    
    # Create in-app notification
    in_app_notif = create_in_app_notification(
        user=category.user,
        title=title,
        message=message,
        notification_type=notification_type,
        category=category
    )
    
    # Send email notification
    email_sent = send_email_notification(
        user=category.user,
        subject=title,
        message=f"Hello {category.user.full_name},\n\n{message}\n\n"
                f"Log in to BudgetWise to manage your budget.\n\n"
                f"Best regards,\nBudgetWise Team",
        notification_instance=in_app_notif
    )
    
    return True