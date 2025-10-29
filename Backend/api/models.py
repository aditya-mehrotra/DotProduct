from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ['user', 'name', 'type']  # Prevents duplicate categories per user
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Transaction(models.Model):
    INCOME = 'income'
    EXPENSE = 'expense'
    
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.get_type_display()}: ${self.amount} - {self.category.name if self.category else 'Uncategorized'} on {self.date}"


class Budget(models.Model):
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'
    YEARLY = 'yearly'
    
    PERIOD_CHOICES = [
        (WEEKLY, 'Weekly'),
        (MONTHLY, 'Monthly'),
        (YEARLY, 'Yearly'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default=MONTHLY)
    start_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date', '-created_at']
    
    def __str__(self):
        return f"${self.amount} for {self.category.name} ({self.get_period_display()})"

