import axios from 'axios'
import Cookies from 'js-cookie'
import { Category, Transaction, Budget, TransactionFormData, BudgetFormData } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for Django session cookies
})

// Add request interceptor to include CSRF token
apiClient.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrftoken2')
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  return config
})

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      Cookies.remove('sessionid')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health/')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

// Authentication API functions
export const login = async (credentials: { username: string; password: string }) => {
  const response = await apiClient.post('/auth/login/', credentials)
  return response.data
}

export const register = async (credentials: {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}) => {
  const response = await apiClient.post('/auth/register/', credentials)
  return response.data
}

export const logout = async () => {
  const response = await apiClient.post('/auth/logout/')
  return response.data
}

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/user/')
  return response.data
}

// Categories API functions
export const getCategories = async (type?: 'income' | 'expense'): Promise<Category[]> => {
  const params = type ? { type } : {}
  const response = await apiClient.get('/categories/', { params })
  return response.data.results || response.data
}

export const createCategory = async (categoryData: { name: string; type: 'income' | 'expense' }): Promise<Category> => {
  const response = await apiClient.post('/categories/', categoryData)
  return response.data
}

// Transactions API functions
export const getTransactions = async (params?: {
  type?: 'income' | 'expense'
  category?: number
  start_date?: string
  end_date?: string
}): Promise<Transaction[]> => {
  const response = await apiClient.get('/transactions/', { params })
  return response.data.results || response.data
}

export const createTransaction = async (transactionData: TransactionFormData): Promise<Transaction> => {
  const data = {
    ...transactionData,
    amount: parseFloat(transactionData.amount),
    category: transactionData.category || null,
  }
  const response = await apiClient.post('/transactions/', data)
  return response.data
}

export const updateTransaction = async (id: number, transactionData: TransactionFormData): Promise<Transaction> => {
  const data = {
    ...transactionData,
    amount: parseFloat(transactionData.amount),
    category: transactionData.category || null,
  }
  const response = await apiClient.put(`/transactions/${id}/`, data)
  return response.data
}

export const deleteTransaction = async (id: number): Promise<void> => {
  await apiClient.delete(`/transactions/${id}/`)
}

// Budgets API functions
export const getBudgets = async (): Promise<Budget[]> => {
  const response = await apiClient.get('/budgets/')
  return response.data.results || response.data
}

export const createBudget = async (budgetData: BudgetFormData): Promise<Budget> => {
  const data = {
    ...budgetData,
    amount: parseFloat(budgetData.amount),
    category: budgetData.category || null,
  }
  const response = await apiClient.post('/budgets/', data)
  return response.data
}

export const updateBudget = async (id: number, budgetData: BudgetFormData): Promise<Budget> => {
  const data = {
    ...budgetData,
    amount: parseFloat(budgetData.amount),
    category: budgetData.category || null,
  }
  const response = await apiClient.put(`/budgets/${id}/`, data)
  return response.data
}

export const deleteBudget = async (id: number): Promise<void> => {
  await apiClient.delete(`/budgets/${id}/`)
}

// Summary API functions
export const getFinancialSummary = async () => {
  const response = await apiClient.get('/financial-summary/')
  return response.data
}

export const getCategorySummary = async () => {
  const response = await apiClient.get('/category-summary/')
  return response.data
}

export const getBudgetStatus = async () => {
  const response = await apiClient.get('/budget-status/')
  return response.data
}

