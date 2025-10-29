# DotProduct Backend

Django + Django REST Framework backend for the DotProduct application.

## Setup Instructions

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp env.example .env
```

Edit `.env` and update the configuration as needed.

### 4. Run Migrations

```bash
python manage.py makemigrations api
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Core Endpoints
- `GET /api/health/` - Health check endpoint
- `GET /admin/` - Django admin interface

### Categories API
- `GET /api/categories/` - List all categories for authenticated user
- `POST /api/categories/` - Create a new category
- `GET /api/categories/{id}/` - Get specific category
- `PUT/PATCH /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Transactions API
- `GET /api/transactions/` - List all transactions for authenticated user
- `POST /api/transactions/` - Create a new transaction
- `GET /api/transactions/{id}/` - Get specific transaction
- `PUT/PATCH /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction

**Query Filters:**
- `?type=income` - Filter by income transactions
- `?type=expense` - Filter by expense transactions
- `?category=1` - Filter by category ID
- `?start_date=2024-01-01` - Filter from date
- `?end_date=2024-12-31` - Filter until date

### Budgets API
- `GET /api/budgets/` - List all budgets for authenticated user
- `POST /api/budgets/` - Create a new budget
- `GET /api/budgets/{id}/` - Get specific budget
- `PUT/PATCH /api/budgets/{id}/` - Update budget
- `DELETE /api/budgets/{id}/` - Delete budget

### Summary Endpoints
- `GET /api/financial-summary/` - Get total income, expenses, and balance
- `GET /api/category-summary/` - Get summary grouped by category
- `GET /api/budget-status/` - Get budget vs actual spending status

## Project Structure

```
Backend/
├── dotproduct_backend/     # Main Django project
│   ├── settings.py        # Django settings
│   ├── urls.py           # URL configuration
│   ├── wsgi.py           # WSGI configuration
│   └── asgi.py           # ASGI configuration
├── api/                   # API application
│   ├── views.py          # API views and viewsets
│   ├── urls.py           # API URLs
│   ├── serializers.py    # DRF serializers
│   ├── models.py         # Database models (Category, Transaction, Budget)
│   └── admin.py          # Django admin configuration
├── requirements.txt      # Python dependencies
├── manage.py             # Django management script
└── README.md             # This file
```

## Environment Variables

- `DEBUG`: Set to False in production
- `SECRET_KEY`: Django secret key (keep this secure)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend URLs allowed for CORS

## Database Models

### Category
Stores user-defined categories for income and expenses.
- Fields: user, name, type (income/expense), created_at

### Transaction
Stores individual income or expense entries.
- Fields: user, category, amount, description, date, type, created_at

### Budget
Stores budget limits for categories over time periods.
- Fields: user, category, amount, period (weekly/monthly/yearly), start_date, created_at

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed information.

## Authentication

All endpoints (except health check) require authentication. Users must be logged in to access their own data. See the Django admin interface to create users.

