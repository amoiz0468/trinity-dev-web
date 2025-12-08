from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Invoice, InvoiceItem
from .serializers import (
    InvoiceSerializer,
    InvoiceCreateSerializer,
    InvoiceListSerializer,
    InvoiceItemSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Invoice CRUD operations.
    """
    queryset = Invoice.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'payment_method', 'customer']
    search_fields = ['invoice_number', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['created_at', 'total_amount']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        elif self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer


class InvoiceItemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Invoice Items.
    """
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsAuthenticated]
