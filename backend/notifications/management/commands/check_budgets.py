from django.core.management.base import BaseCommand
from notifications.tasks import check_all_budgets_async

class Command(BaseCommand):
    help = 'Check all budgets for alert thresholds and send notifications'
    
    def handle(self, *args, **options):
        self.stdout.write("Checking budgets for alerts...")
        result = check_all_budgets_async()
        self.stdout.write(self.style.SUCCESS(result))