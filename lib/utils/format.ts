import { format, fromUnixTime } from "date-fns"
import { es } from "date-fns/locale"

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

export function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  return format(new Date(Number(year), Number(m) - 1, 1), "MMMM yyyy", {
    locale: es,
  })
}

export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM")
}

export function getMonthProgress(month: string): number {
  const [year, m] = month.split("-").map(Number)
  const now = new Date()
  if (now.getFullYear() !== year || now.getMonth() + 1 !== m) {
    return now > new Date(year, m - 1, 1) ? 100 : 0
  }
  const daysInMonth = new Date(year, m, 0).getDate()
  return Math.round((now.getDate() / daysInMonth) * 100)
}
