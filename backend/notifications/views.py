from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from .models import Notification, EmailLog
from .serializers import NotificationSerializer, NotificationMarkReadSerializer, EmailLogSerializer

class NotificationListView(generics.ListAPIView):
    """
    List all notifications for the authenticated user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Filter by read/unread
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update (mark as read), or delete a specific notification.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(is_read=True)

class MarkNotificationsReadView(APIView):
    """
    Mark one or multiple notifications as read.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if serializer.validated_data.get('mark_all', False):
            # Mark all as read
            count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({
                'message': f'Marked {count} notifications as read',
                'marked_count': count
            })
        
        notification_ids = serializer.validated_data.get('notification_ids', [])
        if notification_ids:
            count = Notification.objects.filter(
                user=request.user, 
                id__in=notification_ids, 
                is_read=False
            ).update(is_read=True)
            return Response({
                'message': f'Marked {count} notifications as read',
                'marked_count': count
            })
        
        return Response(
            {'error': 'No notification IDs provided and mark_all is false'},
            status=status.HTTP_400_BAD_REQUEST
        )

class UnreadNotificationCountView(APIView):
    """
    Get the count of unread notifications for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})

class DeleteAllReadNotificationsView(APIView):
    """
    Delete all read notifications for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        count, _ = Notification.objects.filter(user=request.user, is_read=True).delete()
        return Response({
            'message': f'Deleted {count} read notifications',
            'deleted_count': count
        })

class EmailLogListView(generics.ListAPIView):
    """
    List email logs (admin only for monitoring).
    """
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only allow admin users to view email logs
        if self.request.user.is_staff:
            return EmailLog.objects.all()
        return EmailLog.objects.none()