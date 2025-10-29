from django.contrib import admin
from .models import Category, Transaction, Budget


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'user', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['name', 'user__username']
    readonly_fields = ['created_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['type', 'amount', 'category', 'date', 'user', 'created_at']
    list_filter = ['type', 'date', 'created_at']
    search_fields = ['description', 'category__name', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'period', 'start_date', 'user', 'created_at']
    list_filter = ['period', 'start_date', 'created_at']
    search_fields = ['category__name', 'user__username']
    readonly_fields = ['start_date', 'created_at']

