// Response wrappers
export interface ApiSuccess<T> { success: true; data: T }
export interface ApiError { success: false; error: { code: string; message: string } }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// Auth
export interface AuthUser {
  user_id: string
  email: string
  name: string
  preferred_currency: string
}
export interface LoginResponse {
  id_token: string
  access_token: string
  refresh_token: string
  user: AuthUser
}

// Transaction
export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  date: string
  currency: string
  expense_id?: string
  income_id?: string
  notes?: string
  created_at: number
  updated_at: number
}
export interface TransactionSummary {
  total_income: number
  total_expenses: number
  balance: number
}
export interface PaginationMeta {
  limit: number
  count: number
  cursor: string | null
  has_more: boolean
}
export interface TransactionListResponse {
  transactions: Transaction[]
  total: number
  summary: TransactionSummary
  meta: PaginationMeta
}

// Income
export interface Income {
  id: string
  name: string
  amount: number
  type: string
  category: string
  currency: string
  created_at: number
  updated_at: number
}

// Expense
export interface Expense {
  id: string
  name: string
  amount: number
  category: string
  currency: string
  created_at: number
  updated_at: number
}

// Goal
export interface Goal {
  id: string
  name: string
  type: string
  target_amount: number
  target_date: number
  monthly_contribution: number
  current_saved: number
  category: string
  currency: string
  status: "active" | "completed" | "paused"
  progress_percentage: number
  created_at: number
}

// SinkingFund
export interface SinkingFund {
  id: string
  name: string
  description?: string
  expected_amount: number
  expected_date: number
  monthly_contribution: number
  current_saved: number
  category: string
  currency: string
  recurrence: "one-time" | "monthly" | "quarterly" | "yearly"
  status: "active" | "completed"
  created_at: number
  updated_at: number
}

// Budget
export interface BudgetSetup {
  currency: string
  monthly_income_goal: number
  savings_rate_target: number
  configured: boolean
}

// Catalog
export interface Category {
  id: string
  name_en: string
  name_es: string
  icon: string
  type: string
}
export interface Currency {
  code: string
  name: string
  name_es: string
  symbol: string
  decimal_places: number
}
