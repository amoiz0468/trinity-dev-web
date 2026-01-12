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
    ViewSet for Invoice management.
    
    Create, retrieve, update, and manage invoices with full control over
    invoice items, payment status, and payment methods.
    
    **Features:**
    - Create new invoices with multiple items
    - Track invoice status (pending, paid, cancelled, refunded)
    - Support multiple payment methods (cash, card, PayPal, other)
    - Calculate tax and totals automatically
    - Filter by status, payment method, and customer
    - Search by invoice number or customer name
    - Sort by creation date or total amount
    
    **Status Options:** pending, paid, cancelled, refunded
    **Payment Methods:** cash, card, paypal, other
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
    ViewSet for viewing Invoice Items (read-only).
    
    View individual line items within invoices. Items are created/updated
    through the Invoice endpoint.
    
    **Properties:**
    - product: Product information
    - quantity: Number of units
    - unit_price: Price per unit
    - total_price: Calculated total (quantity × unit_price)
    """
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsAuthenticated]
