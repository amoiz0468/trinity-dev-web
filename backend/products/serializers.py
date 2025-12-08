from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'product_count']
        read_only_fields = ['id', 'created_at']
    
    def get_product_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_status = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'price', 'category', 'category_name',
            'picture', 'picture_url', 'quantity_in_stock',
            'energy_kcal', 'fat', 'saturated_fat', 'carbohydrates',
            'sugars', 'proteins', 'salt', 'fiber',
            'description', 'barcode', 'openfoodfacts_id',
            'last_synced', 'is_active', 'created_at', 'updated_at',
            'stock_status', 'is_in_stock'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_synced']


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating products"""
    class Meta:
        model = Product
        fields = [
            'name', 'brand', 'price', 'category',
            'picture', 'picture_url', 'quantity_in_stock',
            'energy_kcal', 'fat', 'saturated_fat', 'carbohydrates',
            'sugars', 'proteins', 'salt', 'fiber',
            'description', 'barcode', 'is_active'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    stock_status = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'price', 'category_name',
            'picture_url', 'quantity_in_stock', 'stock_status', 'is_active'
        ]
