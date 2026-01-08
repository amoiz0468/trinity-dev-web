from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg
from .models import Customer
from .serializers import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerPurchaseHistorySerializer
)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer/User CRUD operations.
    
    Manage customer database with full CRUD functionality, view purchase history,
    track spending patterns, and analyze customer behavior.
    
    **Features:**
    - Create and manage customer records
    - View complete purchase history
    - Track total spending and average order value
    - Get last purchase date and statistics
    - Search and filter customers
    """
    queryset = Customer.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CustomerCreateSerializer
        elif self.action == 'history':
            return CustomerPurchaseHistorySerializer
        return CustomerSerializer
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get customer purchase history with complete statistics.
        
        **Returns:**
        - total_purchases: Total number of invoices
        - total_spent: Sum of all paid invoices
        - average_order_value: Average spending per order
        - last_purchase_date: Date of most recent purchase
        - invoices: List of all customer invoices
        """
        customer = self.get_object()
        invoices = customer.invoices.all()
        
        # Calculate statistics
        total_purchases = invoices.count()
        total_spent = invoices.filter(status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        avg_order = invoices.filter(status='paid').aggregate(
            avg=Avg('total_amount')
        )['avg'] or 0
        
        last_purchase = invoices.order_by('-created_at').first()
        
        history_data = {
            'total_purchases': total_purchases,
            'total_spent': total_spent,
            'average_order_value': avg_order,
            'last_purchase_date': last_purchase.created_at if last_purchase else None,
            'invoices': [
                {
                    'id': inv.id,
                    'invoice_number': inv.invoice_number,
                    'total_amount': inv.total_amount,
                    'status': inv.status,
                    'created_at': inv.created_at,
                }
                for inv in invoices
            ]
        }
        
        serializer = CustomerPurchaseHistorySerializer(history_data)
        return Response(serializer.data)
