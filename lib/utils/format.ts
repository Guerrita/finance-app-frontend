import { format, fromUnixTime, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"

export function safeParseDate(dateInput: string | number | null | undefined): Date {
  if (!dateInput) return new Date()

  if (typeof dateInput === "number") {
    // Assume seconds if < 10^12 (milliseconds), else milliseconds
    // 10^12 is approximately the year 2001 in milliseconds, so anything less is likely seconds
    const date = dateInput < 10000000000 ? fromUnixTime(dateInput) : new Date(dateInput)
    return isValid(date) ? date : new Date()
  }

  const parsed = parseISO(dateInput)
  if (isValid(parsed)) return parsed

  const date = new Date(dateInput)
  return isValid(date) ? date : new Date()
}

const CURRENCY_DECIMALS: Record<string, number> = {
  COP: 0, CLP: 0, ARS: 0, MXN: 0,
  BRL: 2, USD: 2, EUR: 2, PEN: 2,
}

export function formatCurrency(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
    maximumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
  }).format(amount)
}

export function formatAmount(amount: number, currency = "COP"): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
    maximumFractionDigits: CURRENCY_DECIMALS[currency] ?? 2,
  }).format(amount)
}

export function formatDate(timestamp: number): string {
  return format(fromUnixTime(timestamp), "d MMM yyyy", { locale: es })
}

export function formatDateShort(timestamp: number): string {
  return format(fromUnixTime(timestamp), "dd/MM/yy")
}

export function formatMonth(month: string | number): string {
  const date = safeParseDate(month)
  return format(date, "MMMM yyyy", { locale: es })
}

export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM")
}

export function getMonthProgress(month: string | number): number {
  const date = safeParseDate(month)
  const year = date.getFullYear()
  const m = date.getMonth() + 1
  const now = new Date()
  
  if (now.getFullYear() !== year || now.getMonth() + 1 !== m) {
    return now > date ? 100 : 0
  }
  
  const daysInMonth = new Date(year, m, 0).getDate()
  return Math.round((now.getDate() / daysInMonth) * 100)
}
