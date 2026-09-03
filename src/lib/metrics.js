import { CATEGORIES, daysInMonth, isSameMonth } from './utils'

function sum(arr, sel) {
  return arr.reduce((acc, x) => acc + Number(sel(x) || 0), 0)
}

export function monthEarnings(earnings, year, month) {
  return earnings.filter((e) => isSameMonth(e.date, year, month))
}
export function monthExpenses(expenses, year, month) {
  return expenses.filter((e) => isSameMonth(e.date, year, month))
}

export function computeMonth(data, year, month) {
  const earns = monthEarnings(data.earnings, year, month)
  const exps = monthExpenses(data.expenses, year, month)

  const totalGross = sum(earns, (e) => e.gross)
  const totalExpenses = sum(exps, (e) => e.amount)
  const netProfit = totalGross - totalExpenses

  const trips = sum(earns, (e) => e.trips)
  const km = sum(earns, (e) => e.km)
  const hours = sum(earns, (e) => e.hours)
  const workedDays = new Set(earns.map((e) => e.date)).size

  const perDay = workedDays ? netProfit / workedDays : 0
  const perHour = hours ? netProfit / hours : 0
  const perKm = km ? totalGross / km : 0
  const costPerKm = km ? totalExpenses / km : 0

  // daily series
  const totalDays = daysInMonth(year, month)
  const daily = []
  for (let d = 1; d <= totalDays; d++) {
    const dayEarns = earns.filter((e) => Number(e.date.split('-')[2]) === d)
    const dayExps = exps.filter((e) => Number(e.date.split('-')[2]) === d)
    daily.push({
      day: d,
      ganhos: sum(dayEarns, (e) => e.gross),
      despesas: sum(dayExps, (e) => e.amount)
    })
  }

  // category breakdown
  const byCat = CATEGORIES.map((c) => {
    const value = sum(exps.filter((e) => e.category === c.key), (e) => e.amount)
    return { key: c.key, color: c.color, value }
  })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)

  const categories = byCat.map((c) => ({
    ...c,
    pct: totalExpenses ? (c.value / totalExpenses) * 100 : 0
  }))

  // recent mixed entries
  const recent = [
    ...earns.map((e) => ({
      id: e.id,
      type: 'ganho',
      date: e.date,
      title: `Ganho - ${e.platform}`,
      amount: e.gross,
      meta: e.trips ? `${e.trips} corridas` : ''
    })),
    ...exps.map((e) => ({
      id: e.id,
      type: 'despesa',
      date: e.date,
      title: `${e.category}${e.description ? ' - ' + e.description : ''}`,
      amount: -e.amount,
      meta: e.liters ? `${e.liters} L` : ''
    }))
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const goal = data.goals?.monthly || 0
  const goalPct = goal ? Math.min(100, (netProfit / goal) * 100) : 0
  const goalRemaining = Math.max(0, goal - netProfit)

  return {
    totalGross,
    totalExpenses,
    netProfit,
    trips,
    km,
    hours,
    workedDays,
    totalDays,
    perDay,
    perHour,
    perKm,
    costPerKm,
    daily,
    categories,
    recent,
    goal,
    goalPct,
    goalRemaining,
    count: earns.length + exps.length
  }
}

export function prevMonth(year, month) {
  if (month === 0) return { year: year - 1, month: 11 }
  return { year, month: month - 1 }
}

export function delta(current, previous) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

// -------------------------------------------------------------------
// Métricas diárias (usadas no Resumo Diário)
// -------------------------------------------------------------------
export function shiftDateISO(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function computeDay(data, dateStr) {
  const earns = (data.earnings || []).filter((e) => e.date === dateStr)
  const exps = (data.expenses || []).filter((e) => e.date === dateStr)

  const gross = sum(earns, (e) => e.gross)
  const expensesTotal = sum(exps, (e) => e.amount)
  const net = gross - expensesTotal
  const trips = sum(earns, (e) => e.trips)
  const km = sum(earns, (e) => e.km)
  const hours = sum(earns, (e) => e.hours)
  const costPerKm = km ? expensesTotal / km : 0
  const grossPerKm = km ? gross / km : 0

  const recent = [...earns].sort((a, b) => (a.id < b.id ? 1 : -1))

  return { date: dateStr, gross, expensesTotal, net, trips, km, hours, costPerKm, grossPerKm, recent }
}

export function dailySeries(data, days, endDateStr) {
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftDateISO(endDateStr, -i)
    const c = computeDay(data, date)
    out.push({ label: shortDay(date), ganhos: c.gross, despesas: c.expensesTotal })
  }
  return out
}

export function weeklySeries(data, weeks, endDateStr) {
  const out = []
  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = shiftDateISO(endDateStr, -w * 7)
    let ganhos = 0
    let despesas = 0
    for (let i = 0; i < 7; i++) {
      const date = shiftDateISO(weekEnd, -i)
      const c = computeDay(data, date)
      ganhos += c.gross
      despesas += c.expensesTotal
    }
    out.push({ label: shortDay(weekEnd), ganhos, despesas })
  }
  return out
}

function shortDay(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}
