# Database Setup Instructions

## Database Schema

The DotProduct application includes three main models:

1. **Category** - User-defined categories for income and expenses
2. **Transaction** - Individual income or expense entries
3. **Budget** - Budget limits set for categories over time periods

### Models Created

#### Category Model
- `user` - ForeignKey to User
- `name` - Category name (e.g., "Groceries", "Salary")
- `type` - Choice field: "income" or "expense"
- `created_at` - Auto-generated timestamp

#### Transaction Model
- `user` - ForeignKey to User
- `category` - ForeignKey to Category (can be null)
- `amount` - Decimal field for transaction amount
- `description` - Transaction description
- `date` - Date of the transaction
- `type` - Choice field: "income" or "expense"
- `created_at` - Auto-generated timestamp

#### Budget Model
- `user` - ForeignKey to User
- `category` - ForeignKey to Category
- `amount` - Budget amount limit
- `period` - Choice field: "weekly", "monthly", "yearly"
- `start_date` - When the budget period starts
- `created_at` - Auto-generated timestamp

## Setup Steps

### 1. Create and Activate Virtual Environment

```bash
cd Backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
# Create migration files
python manage.py makemigrations api

# Apply migrations to database
python manage.py migrate
```

This will create the database tables in `db.sqlite3`.

### 4. (Optional) Create Admin User

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 5. Start the Server

```bash
python manage.py runserver
```

## API Endpoints

Once the server is running, the following endpoints are available:

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create a category
- `GET /api/categories/{id}/` - Get specific category
- `PUT /api/categories/{id}/` - Update category
- `PATCH /api/categories/{id}/` - Partially update category
- `DELETE /api/categories/{id}/` - Delete category

### Transactions
- `GET /api/transactions/` - List all transactions
- `POST /api/transactions/` - Create a transaction
- `GET /api/transactions/{id}/` - Get specific transaction
- `PUT /api/transactions/{id}/` - Update transaction
- `PATCH /api/transactions/{id}/` - Partially update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction

**Transaction Filters:**
- `?type=income` - Filter by income
- `?type=expense` - Filter by expenses
- `?category=1` - Filter by category ID
- `?start_date=2024-01-01` - Filter from date
- `?end_date=2024-12-31` - Filter until date

### Budgets
- `GET /api/budgets/` - List all budgets
- `POST /api/budgets/` - Create a budget
- `GET /api/budgets/{id}/` - Get specific budget
- `PUT /api/budgets/{id}/` - Update budget
- `PATCH /api/budgets/{id}/` - Partially update budget
- `DELETE /api/budgets/{id}/` - Delete budget

### Summary Endpoints
- `GET /api/financial-summary/` - Get total income, expenses, and balance
- `GET /api/category-summary/` - Get summary grouped by category
- `GET /api/budget-status/` - Get budget vs actual spending

## Authentication

All endpoints (except health check) require authentication. Use Django REST Framework authentication.

### Obtaining Authentication

1. Create a user via admin panel or API
2. Use DRF session authentication or token authentication
3. For testing, you can use the browsable API at `/api/categories/` after logging in

## Django Admin Interface

Visit `http://localhost:8000/admin/` to access the admin interface where you can:
- View and manage categories, transactions, and budgets
- Create, edit, and delete records
- View user data

