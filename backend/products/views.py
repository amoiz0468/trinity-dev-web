from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import requests
from django.conf import settings
from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductCreateUpdateSerializer,
    ProductListSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations.
    Includes integration with Open Food Facts API.
    """
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'brand', 'barcode', 'category__name']
    filterset_fields = ['category', 'is_active']
    ordering_fields = ['name', 'price', 'quantity_in_stock', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    @action(detail=False, methods=['post'])
    def sync_openfoodfacts(self, request):
        """
        Sync products with Open Food Facts API.
        Accepts barcode or product name for search.
        """
        barcode = request.data.get('barcode')
        
        if not barcode:
            return Response(
                {'error': 'Barcode is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Query Open Food Facts API
            url = f"{settings.OPEN_FOOD_FACTS_API_URL}/product/{barcode}"
            response = requests.get(url)
            
            if response.status_code != 200:
                return Response(
                    {'error': 'Failed to fetch from Open Food Facts'},
                    status=status.HTTP_502_BAD_GATEWAY
                )
            
            data = response.json()
            
            if data.get('status') != 1:
                return Response(
                    {'error': 'Product not found in Open Food Facts'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            product_data = data.get('product', {})
            
            # Extract nutritional information
            nutriments = product_data.get('nutriments', {})
            
            # Check if product exists
            product, created = Product.objects.update_or_create(
                barcode=barcode,
                defaults={
                    'name': product_data.get('product_name', 'Unknown'),
                    'brand': product_data.get('brands', ''),
                    'picture_url': product_data.get('image_url', ''),
                    'description': product_data.get('ingredients_text', ''),
                    'openfoodfacts_id': product_data.get('id', ''),
                    'energy_kcal': nutriments.get('energy-kcal_100g'),
                    'fat': nutriments.get('fat_100g'),
                    'saturated_fat': nutriments.get('saturated-fat_100g'),
                    'carbohydrates': nutriments.get('carbohydrates_100g'),
                    'sugars': nutriments.get('sugars_100g'),
                    'proteins': nutriments.get('proteins_100g'),
                    'salt': nutriments.get('salt_100g'),
                    'fiber': nutriments.get('fiber_100g'),
                    'last_synced': timezone.now(),
                }
            )
            
            serializer = ProductSerializer(product)
            return Response({
                'created': created,
                'product': serializer.data
            }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
            
        except requests.RequestException as e:
            return Response(
                {'error': f'API request failed: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """
        Update product stock quantity.
        """
        product = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is None:
            return Response(
                {'error': 'Quantity is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = int(quantity)
            if quantity < 0:
                return Response(
                    {'error': 'Quantity cannot be negative'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'Invalid quantity value'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.quantity_in_stock = quantity
        product.save()
        
        serializer = ProductSerializer(product)
        return Response(serializer.data)
