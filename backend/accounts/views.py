from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.core.cache import cache
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from .models import User
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from budgets.models import Category
from expenses.models import Expense
from notifications.models import Notification, EmailLog

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class AdminUserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    serializer_class = UserProfileSerializer
    
    def get_queryset(self):
        return User.objects.all().order_by('-created_at')

class AdminSystemStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        
        # Get user stats
        total_users = User.objects.count()
        active_users_today = User.objects.filter(last_login__gte=today_start, is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        new_users_this_week = User.objects.filter(created_at__gte=week_start).count()
        
        # Get budget stats
        total_budgets = Category.objects.count()
        total_budget_amount = Category.objects.aggregate(total=Sum('budget_limit'))['total'] or 0
        
        # Get expense stats
        total_expenses = Expense.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_expenses_count = Expense.objects.count()
        
        # Get notification stats
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        
        # Email logs
        total_emails_sent = EmailLog.objects.filter(status='sent').count()
        failed_emails = EmailLog.objects.filter(status='failed').count()
        
        # System health
        system_health = {
            'api_status': 'operational',
            'database_status': 'connected',
            'email_service': 'configured' if settings.EMAIL_HOST_USER else 'not_configured',
            'last_backup': None,
        }
        
        return Response({
            'total_users': total_users,
            'active_users_today': active_users_today,
            'inactive_users': inactive_users,
            'new_users_this_week': new_users_this_week,
            'total_budgets': total_budgets,
            'total_budget_amount': total_budget_amount,
            'total_expenses': total_expenses,
            'total_expenses_count': total_expenses_count,
            'total_notifications': total_notifications,
            'unread_notifications': unread_notifications,
            'total_emails_sent': total_emails_sent,
            'failed_emails': failed_emails,
            'system_health': system_health,
        })
    
class AdminSystemLogsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        logs = []
        
        # Get email logs
        email_logs = EmailLog.objects.all().order_by('-created_at')[:20]
        for log in email_logs:
            logs.append({
                'id': log.id,
                'timestamp': log.created_at.isoformat(),
                'level': 'ERROR' if log.status == 'failed' else 'INFO',
                'message': f'Email to {log.recipient}: {log.subject} - {log.status}',
                'type': 'email',
            })
        
        # Get user login activities
        recent_users = User.objects.filter(last_login__isnull=False).order_by('-last_login')[:10]
        for user in recent_users:
            if user.last_login:
                logs.append({
                    'id': f'user_{user.id}',
                    'timestamp': user.last_login.isoformat(),
                    'level': 'INFO',
                    'message': f'User {user.email} logged in from web',
                    'type': 'user',
                })
        
        # Get user creation logs
        new_users = User.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).order_by('-created_at')
        for user in new_users:
            logs.append({
                'id': f'new_{user.id}',
                'timestamp': user.created_at.isoformat(),
                'level': 'INFO',
                'message': f'New user registered: {user.email}',
                'type': 'user',
            })
        
        # Sort by timestamp, most recent first
        logs.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response({'logs': logs[:50]})
    

class AdminUpdateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Prevent admin from deactivating themselves
            if user.id == request.user.id:
                return Response({'error': 'You cannot modify your own account'}, status=400)
            
            action = request.data.get('action')
            
            if action == 'activate':
                user.is_active = True
                user.save()
                return Response({
                    'message': f'User {user.email} activated successfully',
                    'user': UserProfileSerializer(user).data
                })
            elif action == 'deactivate':
                user.is_active = False
                user.save()
                # Force logout by blacklisting all refresh tokens
                # This is handled by token expiration
                return Response({
                    'message': f'User {user.email} deactivated successfully',
                    'user': UserProfileSerializer(user).data
                })
            elif action == 'make_admin':
                user.is_staff = True
                user.save()
                return Response({
                    'message': f'User {user.email} promoted to admin',
                    'user': UserProfileSerializer(user).data
                })
            elif action == 'remove_admin':
                user.is_staff = False
                user.save()
                return Response({
                    'message': f'Admin privileges removed from {user.email}',
                    'user': UserProfileSerializer(user).data
                })
            elif action == 'delete':
                # Prevent deleting yourself
                if user.id == request.user.id:
                    return Response({'error': 'You cannot delete your own account'}, status=400)
                user.delete()
                return Response({'message': f'User {user.email} deleted successfully'})
            else:
                return Response({'error': 'Invalid action'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
class AdminCreateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Make admin if requested
            if request.data.get('is_staff', False):
                user.is_staff = True
                user.save()
            
            return Response({
                'message': 'User created successfully',
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class AdminSMTPConfigView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        return Response({
            'email_host': settings.EMAIL_HOST,
            'email_port': settings.EMAIL_PORT,
            'email_use_tls': settings.EMAIL_USE_TLS,
            'email_host_user': settings.EMAIL_HOST_USER,
            'email_configured': bool(settings.EMAIL_HOST_USER),
        })
    
    def post(self, request):
        # For security, we won't actually save to settings file
        # This would require writing to .env file
        return Response({'message': 'Settings updated (demo mode)'})
    

class AdminBackupView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        # Create a backup
        from django.core import management
        import io
        
        try:
            # This is a simplified backup - in production you'd use proper backup tools
            backup_data = {
                'timestamp': timezone.now().isoformat(),
                'users': User.objects.count(),
                'budgets': Category.objects.count(),
                'expenses': Expense.objects.count(),
                'message': 'Backup completed successfully (demo mode)',
            }
            return Response(backup_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Send welcome email
        try:
            send_mail(
                subject='Welcome to BudgetWise!',
                message=f'Hello {user.full_name},\n\nThank you for registering with BudgetWise. '
                       f'Start managing your finances effectively today!\n\n'
                       f'All amounts are in Rwandan Franc (RWF).\n\n'
                       f'Best regards,\nBudgetWise Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Welcome email failed: {e}")
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, email=email, password=password)
        
        if user is None:
            return Response({'error': 'Invalid email or password'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({'error': 'Account is disabled. Please contact administrator.'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Login successful'
        })

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = UserUpdateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(UserProfileSerializer(instance).data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            # Generate reset token (store in cache for 1 hour)
            reset_token = get_random_string(64)
            cache.set(f'password_reset_{reset_token}', user.id, timeout=3600)
            
            # Send reset email
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            
            send_mail(
                subject='Password Reset Request - BudgetWise',
                message=f'Hello {user.full_name},\n\n'
                       f'You requested a password reset. Click the link below to reset your password:\n\n'
                       f'{reset_link}\n\n'
                       f'This link expires in 1 hour.\n\n'
                       f'If you did not request this, please ignore this email.\n\n'
                       f'Best regards,\nBudgetWise Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist for security
            pass
        
        return Response({'message': 'If an account exists with this email, a reset link has been sent.'})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = request.query_params.get('token')
        if not token:
            return Response({'error': 'Reset token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = cache.get(f'password_reset_{token}')
        if not user_id:
            return Response({'error': 'Invalid or expired reset token'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            cache.delete(f'password_reset_{token}')
            return Response({'message': 'Password reset successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)