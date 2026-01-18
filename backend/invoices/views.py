from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from users.models import Customer
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

    def get_queryset(self):
        if self.request.user.is_staff:
            return Invoice.objects.all()
        customer = Customer.objects.filter(user=self.request.user).first()
        if not customer:
            return Invoice.objects.none()
        return Invoice.objects.filter(customer=customer)

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            customer = Customer.objects.filter(user=request.user).first()
            if not customer:
                return Response(
                    {'detail': 'Customer profile not found.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payload = request.data.copy()
            payload['customer'] = customer.id
        else:
            payload = request.data

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        invoice = serializer.save()
        if not request.user.is_staff and invoice.payment_method == 'card':
            invoice.status = 'paid'
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=['status', 'paid_at'])
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        invoice = serializer.save()
        if invoice.status == 'paid' and not invoice.paid_at:
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=['paid_at'])
        elif invoice.status != 'paid' and invoice.paid_at:
            invoice.paid_at = None
            invoice.save(update_fields=['paid_at'])
    
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

    def get_queryset(self):
        if self.request.user.is_staff:
            return InvoiceItem.objects.all()
        customer = Customer.objects.filter(user=self.request.user).first()
        if not customer:
            return InvoiceItem.objects.none()
        return InvoiceItem.objects.filter(invoice__customer=customer)
