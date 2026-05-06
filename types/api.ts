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
export type GoalType = 
  | "travel" | "emergency" | "investment" | "housing" | "vehicle" 
  | "education" | "wedding" | "business" | "retirement" | "health" 
  | "electronics" | "celebration" | "debt_payoff" | "furniture" | "pet" | "other"

export type ContributionType = 
  | "regular" | "extra" | "initial" | "bonus" | "gift" | "adjustment" | "other"

export interface Contribution {
  id: string
  amount: number
  type: ContributionType
  date: string
  notes?: string
  created_at: number
}

export interface Goal {
  id: string
  name: string
  type: GoalType
  target_amount: number
  target_date: string
  monthly_contribution: number
  current_saved: number
  currency: string
  status: "active" | "completed" | "paused"
  progress_percentage: number
  created_at: number
}

export interface GoalProgress {
  progress_percentage: number
  current_saved: number
  months_remaining: number
  on_track: boolean
  projected_completion_date: string
}

// SinkingFund
export type SinkingFundRecurrence = "one-time" | "monthly" | "quarterly" | "yearly"

export interface SinkingFund {
  id: string
  name: string
  description?: string
  expected_amount: number
  expected_date: string
  monthly_contribution: number
  current_saved: number
  currency: string
  recurrence: SinkingFundRecurrence
  category?: string
  status: "active" | "completed"
  created_at: number
  updated_at: number
}

// Dashboard
export interface DashboardFinancialSummary {
  total_planned_income: number
  total_actual_income: number
  income_progress: number
  total_planned_expenses: number
  total_actual_expenses: number
  expense_progress: number
  planned_balance: number
  actual_balance: number
  available_to_spend: number
  projected_end_balance: number
}

export interface DashboardCategoryExpense {
  category: string
  category_name: string
  planned: number
  actual: number
  remaining: number
  progress: number
  status: string
}

export interface DashboardGoal {
  id: string
  name: string
  type: string
  current_saved: number
  target_amount: number
  progress_percentage: number
  monthly_contribution: number
}

export interface DashboardGoalsSummary {
  total_goals: number
  active_goals: number
  total_saved: number
  total_target: number
  overall_progress: number
  monthly_contribution_planned: number
  monthly_contribution_actual: number
  goals: DashboardGoal[]
}

export interface DashboardFund {
  id: string
  name: string
  current_saved: number
  expected_amount: number
  monthly_contribution: number
}

export interface DashboardSinkingFundsSummary {
  total_funds: number
  total_saved: number
  total_expected: number
  overall_progress: number
  funds: DashboardFund[]
}

export interface DashboardAlert {
  severity: "warning" | "critical"
  category: string
  message: string
  action: string
}

export interface DashboardRecommendation {
  type: string
  message: string
  potential_savings?: number
}

export interface DashboardData {
  month: string
  current_date: string
  days_in_month: number
  days_elapsed: number
  progress_percentage: number
  financial_summary: DashboardFinancialSummary
  expenses_by_category: DashboardCategoryExpense[]
  goals_summary: DashboardGoalsSummary
  sinking_funds_summary: DashboardSinkingFundsSummary
  alerts: DashboardAlert[]
  recent_transactions: Transaction[]
  recommendations: DashboardRecommendation[] | string[]
}

// Monthly Report
export interface MonthlyReportSummary {
  planned_income: number
  actual_income: number
  income_variance: number
  income_variance_percentage: number
  planned_expenses: number
  actual_expenses: number
  expense_variance: number
  expense_variance_percentage: number
  planned_balance: number
  actual_balance: number
  balance_variance: number
}

export interface IncomeBreakdownItem {
  income_id: string
  name: string
  category: string
  planned: number
  actual: number
  variance: number
  transactions_count: number
}

export interface ExpenseBreakdownItem {
  expense_id: string
  name: string
  category: string
  type: string
  planned: number
  actual: number
  variance: number
  variance_percentage: number
  transactions_count: number
}

export interface CategorySummaryItem {
  category: string
  planned: number
  actual: number
  variance: number
}

export interface MonthlyReport {
  month: string
  period: { start_date: string; end_date: string }
  summary: MonthlyReportSummary
  income_breakdown: IncomeBreakdownItem[]
  expense_breakdown: ExpenseBreakdownItem[]
  categories_summary: CategorySummaryItem[]
}

// YTD Report
export interface YtdSummary {
  total_income: number
  total_expenses: number
  total_balance: number
  avg_monthly_income: number
  avg_monthly_expenses: number
}

export interface YtdMonthlyBreakdown {
  month: string
  income: number
  expenses: number
  balance: number
  savings_rate: number
}

export interface YtdTopExpenseCategory {
  category: string
  total: number
  percentage: number
}

export interface YtdGoalProgress {
  name: string
  type: string
  progress_percentage: number
  current_saved: number
  target_amount: number
}

export interface YtdReport {
  year: number
  months_elapsed: number
  summary: YtdSummary
  monthly_breakdown: YtdMonthlyBreakdown[]
  top_expense_categories: YtdTopExpenseCategory[]
  goals_progress: YtdGoalProgress[]
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
