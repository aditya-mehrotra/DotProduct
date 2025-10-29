# DotProduct

Full-stack application with Django REST Framework backend and Next.js frontend.

## Project Structure

```
DotProduct/
├── Backend/              # Django REST Framework
│   ├── dotproduct_backend/  # Main Django project
│   ├── api/              # API application
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Backend setup instructions
├── Frontend/             # Next.js application
│   ├── src/              # Source code
│   ├── package.json      # Node dependencies
│   └── README.md         # Frontend setup instructions
└── README.md             # This file
```

## Quick Start

### Backend Setup

```bash
cd Backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/health/` - Health check endpoint
- `GET /admin/` - Django admin interface

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- Django CORS Headers
- Python Decouple

### Frontend
- Next.js 14
- React 18
- TypeScript
- Axios

## Development

### Running Both Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd Backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

Then visit `http://localhost:3000` in your browser.

## Environment Variables

### Backend (.env)
- `DEBUG` - Django debug mode (True/False)
- `SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS` - Frontend URLs for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Features

- ✅ Django REST Framework backend
- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ CORS configuration
- ✅ Health check integration
- ✅ Responsive UI

## License

This project is for the DotProduct technical assessment.

