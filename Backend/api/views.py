from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Sum, Q
from django.utils import timezone
from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check

    Returns a simple status payload so platforms like Render can verify
    the API service is alive.

    Response:
    - 200 OK: { "status": "healthy", "message": "..." }
    """
    return Response({
        'status': 'healthy',
        'message': 'DotProduct API is running successfully',
    }, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Categories

    CRUD operations for the authenticated user's categories.

    Fields:
    - name (string, required)
    - type (string, required: "income" | "expense")

    Authentication: Requires an authenticated session.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return categories belonging to the authenticated user only."""
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Assign the authenticated user when creating a category."""
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    Transactions

    CRUD operations for the authenticated user's transactions.

    Fields:
    - amount (decimal, required)
    - type (string, required: "income" | "expense")
    - category (fk to Category, required)
    - date (date, defaults to today)
    - notes (string, optional)

    Filtering via query params:
    - type: income | expense
    - category: category id
    - start_date: YYYY-MM-DD (inclusive)
    - end_date: YYYY-MM-DD (inclusive)

    Authentication: Requires an authenticated session.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return the user's transactions with optional filters applied."""
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # Filter by type
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        """Assign the authenticated user when creating a transaction."""
        serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
    """
    Budgets

    CRUD operations for the authenticated user's budgets.

    Fields:
    - category (fk to Category, required)
    - amount (decimal, required)
    - period (string, required: e.g., monthly)
    - start_date (date, required)

    Authentication: Requires an authenticated session.
    """
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return budgets belonging to the authenticated user only."""
        return Budget.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Assign the authenticated user when creating a budget."""
        serializer.save(user=self.request.user)


# Financial Summary Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_summary(request):
    """
    Financial summary

    Returns totals for income, expenses, and current balance for
    the authenticated user.

    Response:
    - total_income (number)
    - total_expenses (number)
    - balance (number)
    """
    user = request.user
    
    # Get all transactions for the user
    transactions = Transaction.objects.filter(user=user)
    
    # Calculate totals
    total_income = transactions.filter(type='income').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    total_expenses = transactions.filter(type='expense').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    balance = total_income - total_expenses
    
    return Response({
        'total_income': float(total_income),
        'total_expenses': float(total_expenses),
        'balance': float(balance),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_summary(request):
    """
    Category summary

    Aggregated totals grouped by category name and type for the
    authenticated user.

    Response:
    - category_summary: [ { category__name, category__type, type, total } ]
    """
    user = request.user
    
    # Get transactions grouped by category
    transactions = Transaction.objects.filter(user=user).values(
        'category__name', 'category__type', 'type'
    ).annotate(
        total=Sum('amount')
    ).order_by('-total')
    
    return Response({
        'category_summary': list(transactions)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def budget_status(request):
    """
    Budget status

    For each budget, returns budgeted amount, actual spend, and remaining
    for the current period.

    Response item fields:
    - category (string)
    - budgeted_amount (number)
    - actual_amount (number)
    - remaining (number)
    - period (string)
    """
    user = request.user
    
    budgets = Budget.objects.filter(user=user)
    budget_data = []
    
    for budget in budgets:
        # Get transactions for this budget's category in the current period
        transactions = Transaction.objects.filter(
            user=user,
            category=budget.category,
            date__gte=budget.start_date
        )
        
        actual_amount = transactions.aggregate(total=Sum('amount'))['total'] or 0
        
        budget_data.append({
            'category': budget.category.name,
            'budgeted_amount': float(budget.amount),
            'actual_amount': float(actual_amount),
            'remaining': float(budget.amount - actual_amount),
            'period': budget.get_period_display(),
        })
    
    return Response({
        'budget_status': budget_data
    }, status=status.HTTP_200_OK)
