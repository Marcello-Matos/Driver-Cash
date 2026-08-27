export const CATEGORIES = [
  { key: 'Combustível', color: '#3b82f6' },
  { key: 'Manutenção', color: '#22c55e' },
  { key: 'Seguro', color: '#f59e0b' },
  { key: 'Lavagem', color: '#a855f7' },
  { key: 'Alimentação', color: '#ec4899' },
  { key: 'Aluguel do carro', color: '#14b8a6' },
  { key: 'Financiamento', color: '#6366f1' },
  { key: 'Outros', color: '#94a3b8' }
]

export const PLATFORMS = ['UberX', 'Uber Comfort', 'Uber Black', '99', '99 Pop', 'InDrive', 'Particular', 'Outros']

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function categoryColor(key) {
  return CATEGORIES.find((c) => c.key === key)?.color || '#94a3b8'
}

export const brl = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))

export const numberBR = (value, digits = 0) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Number(value || 0))

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

// date helpers -----------------------------------------------------
export const todayISO = () => new Date().toISOString().slice(0, 10)

export function ym(dateStr) {
  // returns { year, month } for an ISO date string (yyyy-mm-dd)
  const [y, m] = dateStr.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function isSameMonth(dateStr, year, month) {
  const d = ym(dateStr)
  return d.year === year && d.month === month
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function formatDateBR(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function shortDateBR(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

export function pct(part, total) {
  if (!total) return 0
  return (part / total) * 100
}
