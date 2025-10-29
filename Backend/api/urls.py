from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views

class DocumentedRouter(DefaultRouter):
    class APIRootView(DefaultRouter.APIRootView):
        """
        DotProduct API

        Authentication: Session-based (login/logout endpoints) or CSRF-protected requests.

        Core resources:
        - categories: CRUD for user categories.
        - transactions: CRUD with filtering by type, category, and date range.
        - budgets: CRUD and summary of budget vs actuals.

        Additional endpoints:
        - financial-summary: Income, expenses, and balance totals for the user.
        - category-summary: Aggregated totals grouped by category.
        - budget-status: Budget vs actuals for current period.

        Use the Browsable API to explore, or send JSON using your client.
        """
        pass

# Create a router and register our viewsets with it
router = DocumentedRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'budgets', views.BudgetViewSet, basename='budget')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check, name='health-check'),
    path('financial-summary/', views.financial_summary, name='financial-summary'),
    path('category-summary/', views.category_summary, name='category-summary'),
    path('budget-status/', views.budget_status, name='budget-status'),
    
    # Authentication endpoints
    path('auth/login/', auth_views.login_view, name='login'),
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
    path('auth/user/', auth_views.user_view, name='user'),
]
