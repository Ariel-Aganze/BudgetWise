from rest_framework import serializers
from .models import Notification, EmailLog

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'category')
        read_only_fields = ('id', 'created_at')

class NotificationMarkReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    mark_all = serializers.BooleanField(default=False, required=False)

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = ('id', 'recipient', 'subject', 'status', 'error_message', 'sent_at', 'created_at')
        read_only_fields = ('id', 'created_at', 'sent_at')  # Fixed: tuple instead of '__all__'