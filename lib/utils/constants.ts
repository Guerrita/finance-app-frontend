export const QUERY_KEYS = {
  dashboard:        (month: string) => ["dashboard", month],
  transactions:     (filters: object) => ["transactions", filters],
  income:           () => ["income"],
  fixedExpenses:    () => ["expenses", "fixed"],
  variableExpenses: () => ["expenses", "variable"],
  goals:            () => ["goals"],
  goal:             (id: string) => ["goals", id],
  sinkingFunds:     () => ["sinking-funds"],
  sinkingFund:      (id: string) => ["sinking-funds", id],
  budget:           () => ["budget"],
  monthlyReport:    (month: string) => ["reports", "monthly", month],
  ytdReport:        () => ["reports", "ytd"],
  categories:       () => ["categories"],
  currencies:       () => ["currencies"],
} as const

export const ROUTES = {
  login:          "/login",
  register:       "/register",
  forgotPassword: "/forgot-password",
  dashboard:      "/dashboard",
  transactions:   "/transactions",
  budget:         "/budget",
  goals:          "/goals",
  sinkingFunds:   "/sinking-funds",
  reports:        "/reports",
  settings:       "/settings",
} as const
