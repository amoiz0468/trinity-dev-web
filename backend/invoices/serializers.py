from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from decimal import Decimal
from .models import Invoice, InvoiceItem
from users.serializers import CustomerSerializer
from products.serializers import ProductListSerializer


class InvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer for Invoice Items"""
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'product', 'product_details', 'quantity',
            'unit_price', 'total_price', 'product_name', 'product_brand'
        ]
        read_only_fields = ['id', 'total_price', 'product_name', 'product_brand']


class InvoiceItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoice items"""
    class Meta:
        model = InvoiceItem
        fields = ['product', 'quantity', 'unit_price']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model"""
    customer_details = CustomerSerializer(source='customer', read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_details',
            'status', 'payment_method', 'subtotal', 'tax_rate',
            'tax_amount', 'total_amount', 'total_items',
            'paypal_transaction_id', 'paypal_payer_email',
            'notes', 'created_at', 'updated_at', 'paid_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    @extend_schema_field(serializers.IntegerField())
    def get_total_items(self, obj):
        return obj.total_items


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices"""
    items = InvoiceItemCreateSerializer(many=True, write_only=True)
    invoice_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Invoice
        fields = [
            'customer', 'invoice_number', 'payment_method',
            'tax_rate', 'notes', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate subtotal from items
        subtotal = sum(
            item_data['unit_price'] * item_data['quantity']
            for item_data in items_data
        )
        
        # Calculate tax and total
        tax_rate = validated_data.get('tax_rate', Decimal('20.00'))
        tax_amount = (subtotal * tax_rate) / 100
        total_amount = subtotal + tax_amount
        
        # Add calculated fields to validated_data
        validated_data['subtotal'] = subtotal
        validated_data['tax_amount'] = tax_amount
        validated_data['total_amount'] = total_amount
        
        # Create invoice
        invoice = Invoice.objects.create(**validated_data)
        
        # Create invoice items
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        return invoice


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for invoice lists"""
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer_name', 'status',
            'total_amount', 'payment_method', 'total_items', 'created_at'
        ]

    @extend_schema_field(serializers.IntegerField())
    def get_total_items(self, obj):
        return obj.total_items
