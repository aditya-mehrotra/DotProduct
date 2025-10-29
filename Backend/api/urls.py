from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import auth_views

# Create a router and register our viewsets with it
router = DefaultRouter()
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
