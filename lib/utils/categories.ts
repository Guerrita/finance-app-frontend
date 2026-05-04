export const CATEGORY_LABELS: Record<string, string> = {
  // Income
  salary: "Salario",
  freelance: "Freelance",
  business: "Negocios",
  investments: "Inversiones",
  rental: "Alquiler",
  bonus: "Bonificación",
  gift: "Regalo",
  other_income: "Otros Ingresos",
  
  // Expenses
  food: "Comida",
  transport: "Transporte",
  housing: "Vivienda",
  utilities: "Servicios",
  entertainment: "Entretenimiento",
  health: "Salud",
  education: "Educación",
  shopping: "Compras",
  subscriptions: "Suscripciones",
  insurance: "Seguros",
  debt: "Deudas",
  pets: "Mascotas",
  personal_care: "Cuidado Personal",
  gifts: "Regalos",
  savings: "Ahorro",
  other: "Otros",
}

export const CATEGORY_ICONS: Record<string, string> = {
  // Income
  salary: "💼",
  freelance: "💻",
  business: "🏢",
  investments: "📈",
  rental: "🏠",
  bonus: "🎊",
  gift: "🎁",
  other_income: "💰",
  
  // Expenses
  food: "🍔",
  transport: "🚗",
  housing: "🏠",
  utilities: "⚡",
  entertainment: "🎮",
  health: "🏥",
  education: "📚",
  shopping: "🛍️",
  subscriptions: "📱",
  insurance: "🛡️",
  debt: "💸",
  pets: "🐾",
  personal_care: "✨",
  gifts: "🎁",
  savings: "🏦",
  other: "📁",
}

export function getCategoryLabel(id: string): string {
  return CATEGORY_LABELS[id] || id
}

export function getCategoryIcon(id: string): string {
  return CATEGORY_ICONS[id] || "❓"
}
