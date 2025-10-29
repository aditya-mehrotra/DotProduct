from rest_framework import serializers
from .models import Category, Transaction, Budget


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'type', 'created_at']
        read_only_fields = ['user', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'category', 'category_name', 'amount', 'description', 'date', 'type', 'created_at']
        read_only_fields = ['user', 'created_at']
    
    def validate(self, data):
        """Validate that transaction type matches category type"""
        if 'category' in data and 'type' in data:
            category = data['category']
            transaction_type = data['type']
            
            if category.type != transaction_type:
                raise serializers.ValidationError(
                    f"Transaction type ({transaction_type}) must match category type ({category.type})"
                )
        return data


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)
    
    class Meta:
        model = Budget
        fields = ['id', 'user', 'category', 'category_name', 'category_type', 'amount', 
                  'period', 'start_date', 'created_at']
        read_only_fields = ['user', 'start_date', 'created_at']
