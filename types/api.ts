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
  date: number
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
  category: string
  currency: string
  recurrence_day?: number | null
  start_month?: string
  end_month?: string | null
  is_recurring?: boolean
  created_at: number
  updated_at: number
}

export interface IncomeVariable {
  id: string
  name: string
  amount: number
  category: string
  currency: string
  created_at: number
  updated_at: number
}

// Expense
export interface Expense {
  id: string
  name: string
  amount?: number
  estimated_amount?: number
  category: string
  currency: string
  recurrence_day?: number | null
  start_month?: string
  end_month?: string | null
  is_recurring?: boolean
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

export interface ContributionInput {
  amount: number
  date: string
  notes?: string
  type?: ContributionType
}

export interface Contribution {
  id: string
  amount: number
  type: ContributionType
  date: number
  notes?: string
  created_at: number
}

export interface GoalContribution {
  contrib_id: string
  goal_id: string
  month: string
  date: number
  amount: number
  transaction_type: string
  contribution_type: string
  notes?: string
  total_saved: number
  created_at: number
  updated_at: number
}

export interface GoalContributionsResponse {
  goal_id: string
  contributions: Omit<GoalContribution, "goal_id" | "total_saved">[]
  total: number
}

export interface SinkingFundContribution {
  contrib_id: string
  month: string
  date: number
  amount: number
  notes?: string
  created_at: number
  updated_at: number
}

export interface SinkingFundContributionsResponse {
  contributions: SinkingFundContribution[]
  total: number
}

export interface GoalHistoryEntry {
  contrib_id: string
  month: string
  date: number
  amount: number
  transaction_type: string
  contribution_type: string
  total_saved: number
  percentage: number
  notes?: string
}

export interface Goal {
  id: string
  name: string
  type: GoalType
  target_amount: number
  target_date: number
  monthly_contribution: number
  current_saved: number
  currency: string
  status: "active" | "completed" | "paused"
  progress_percentage?: number
  progress?: number
  created_at: number
}

export interface GoalProgress {
  progress_percentage?: number
  progress?: number
  current_saved: number
  months_remaining: number
  on_track: boolean
  projected_completion_date: string
  monthly_history?: GoalHistoryEntry[]
}

// SinkingFund
export type SinkingFundRecurrence = "one-time" | "monthly" | "quarterly" | "yearly"

export interface SinkingFund {
  id: string
  name: string
  description?: string
  expected_amount: number
  expected_date: number
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
  progress_percentage?: number
  progress?: number
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
  type?: string
  amount_over?: number
}

export interface DashboardRecommendation {
  type: string
  message: string
  potential_savings?: number
  suggested_amount?: number
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
  total_planned_income: number
  total_actual_income: number
  total_planned_expenses: number
  total_actual_expenses: number
  total_balance: number
}

export interface YtdMonthlyTrend {
  month: string
  actual_income: number
  actual_expenses: number
  balance: number
}

export interface YtdReport {
  year: number
  months_included: string[]
  summary: YtdSummary
  monthly_trend: YtdMonthlyTrend[]
}

// Plan
export interface IncomePlanSource {
  id: string
  name: string
  amount: number
  category: string
  currency: string
  type?: "fixed" | "variable"
  recurrence_day?: number | null
  start_month?: string
  end_month?: string | null
  is_recurring?: boolean
}

export interface MonthPlan {
  month: string;
  year: number;
  currency: string;
  income: { sources: IncomePlanSource[]; total: number };
  fixed_expenses: { items: Expense[]; total: number };
  variable_expenses: { items: Expense[]; total: number };
  savings_goals: { items: Goal[]; total: number };
  sinking_funds: { items: SinkingFund[]; total: number };
  summary: {
    total_income: number;
    total_expenses: number;
    total_savings: number;
    available: number;
    savings_rate: number;
    is_deficit: boolean;
  };
}

export interface MonthProjection {
  month: string;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  available: number;
  cumulative_savings: number;
  events: string[];
}

export interface GoalProjection {
  id: string;
  name: string;
  target_amount: number;
  monthly_contribution: number;
  projected_completion_month: string;
  will_complete_on_time: boolean;
}

export interface FundProjection {
  id: string;
  name: string;
  expected_amount: number;
  monthly_contribution: number;
  projected_completion_month: string;
  will_complete_on_time: boolean;
}

export interface Projection {
  projection_months: number;
  currency: string;
  months: MonthProjection[];
  goals_projection: GoalProjection[];
  funds_projection: FundProjection[];
  summary: {
    total_income_projected: number;
    total_expenses_projected: number;
    total_savings_projected: number;
    average_monthly_available: number;
  };
}

// Dashboard Overview (lightweight endpoint)
export interface DashboardOverview {
  balance: number;
  total_income: number;
  total_expenses: number;
  budget_status: "on_track" | "over_budget" | "under_budget";
  goals_progress: number;
  active_alerts: number;
}

// Trends
export type TrendDirection = "increasing" | "decreasing" | "stable"

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savings_rate: number;
}

export interface TrendsData {
  months_analyzed: number;
  period: { start: string; end: string };
  monthly_data: MonthlyTrendPoint[];
  averages: { avg_income: number; avg_expenses: number; avg_balance: number; avg_savings_rate: number };
  trends: { income_trend: TrendDirection; expenses_trend: TrendDirection; savings_trend: TrendDirection };
  top_categories: Array<{
    category: string; category_name: string; total_spent: number; avg_monthly: number; percentage_of_total: number;
  }>;
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
