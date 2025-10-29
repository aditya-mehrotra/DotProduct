// Types for API responses

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  message: string
}

export interface ApiError {
  message: string
  code?: string
}

// Authentication types
export interface User {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

// Financial data types
export interface Category {
  id: number
  user: number
  name: string
  type: 'income' | 'expense'
  created_at: string
}

export interface Transaction {
  id: number
  user: number
  category: number | null
  category_name?: string
  amount: number
  description: string
  date: string
  type: 'income' | 'expense'
  created_at: string
}

export interface Budget {
  id: number
  user: number
  category: number
  category_name?: string
  category_type?: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  created_at: string
}

export interface TransactionFormData {
  category: number | ''
  amount: string
  description: string
  date: string
  type: 'income' | 'expense'
}

export interface BudgetFormData {
  category: number | ''
  amount: string
  period: 'weekly' | 'monthly' | 'yearly'
}

