from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer


class UserSerializer(serializers.ModelSerializer):
    """Serializer for Django User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for Customer model"""
    full_name = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'first_name', 'last_name', 'phone_number', 'email',
            'address', 'zip_code', 'city', 'country',
            'is_active', 'created_at', 'updated_at',
            'full_name', 'full_address'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating customers"""
    class Meta:
        model = Customer
        fields = [
            'first_name', 'last_name', 'phone_number', 'email',
            'address', 'zip_code', 'city', 'country'
        ]


class CustomerPurchaseHistorySerializer(serializers.Serializer):
    """Serializer for customer purchase history"""
    total_purchases = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    last_purchase_date = serializers.DateTimeField()
    invoices = serializers.ListField()
