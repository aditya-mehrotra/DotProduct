# DotProduct Frontend

Next.js frontend application for the DotProduct application.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file (optional, defaults are provided):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
Frontend/
├── src/
│   ├── app/               # Next.js 14 App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.css    # Global styles
│   └── lib/               # Utilities
│       └── api.ts         # API client configuration
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Axios** for API calls
- **Health Check** integration with backend
- Responsive design with inline styles (can be upgraded to Tailwind CSS if needed)

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

