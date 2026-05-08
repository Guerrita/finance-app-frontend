const CATEGORY_MAP: Record<string, { name: string; icon: string }> = {
  food:          { name: "Comida",           icon: "🍔" },
  transport:     { name: "Transporte",       icon: "🚗" },
  housing:       { name: "Vivienda",         icon: "🏠" },
  utilities:     { name: "Servicios",        icon: "💡" },
  entertainment: { name: "Entretenimiento",  icon: "🎬" },
  health:        { name: "Salud",            icon: "🏥" },
  education:     { name: "Educación",        icon: "📚" },
  shopping:      { name: "Compras",          icon: "🛍️" },
  subscriptions: { name: "Suscripciones",   icon: "📱" },
  insurance:     { name: "Seguros",          icon: "🛡️" },
  debt:          { name: "Deudas",           icon: "💳" },
  pets:          { name: "Mascotas",         icon: "🐾" },
  personal_care: { name: "Cuidado Personal", icon: "💆" },
  gifts:         { name: "Regalos",          icon: "🎁" },
  savings:       { name: "Ahorros",          icon: "💰" },
  other:         { name: "Otros Gastos",     icon: "📦" },
  salary:        { name: "Salario",          icon: "💼" },
  freelance:     { name: "Freelance",        icon: "💻" },
  business:      { name: "Negocio",          icon: "🏢" },
  investments:   { name: "Inversiones",      icon: "📈" },
  rental:        { name: "Arriendos",        icon: "🏘️" },
  bonus:         { name: "Bonos",            icon: "🎯" },
  gift:          { name: "Regalo",           icon: "🎀" },
  other_income:  { name: "Otros Ingresos",   icon: "💹" },
}

export function getCategoryName(id: string): string {
  if (id.startsWith("custom_")) return id.replace("custom_", "").replace(/_/g, " ")
  return CATEGORY_MAP[id]?.name ?? id
}

export function getCategoryIcon(id: string): string {
  if (id.startsWith("custom_")) return "✏️"
  return CATEGORY_MAP[id]?.icon ?? "❓"
}

export function getCategoryLabel(id: string): string {
  return `${getCategoryIcon(id)} ${getCategoryName(id)}`
}
