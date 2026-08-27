import { uid } from './utils'

// Generates demo data for August 2026 so the dashboard looks alive on first run.
export function buildSeed() {
  const year = 2026
  const month = 8 // August (1-based for string building)
  const pad = (n) => String(n).padStart(2, '0')
  const iso = (d) => `${year}-${pad(month)}-${pad(d)}`

  const vehicleId = 'veh_demo'

  const platforms = ['UberX', 'Uber Comfort', '99', 'UberX', 'UberX']
  const earnings = []
  const expenses = []

  // 24 worked days in August (skip some days off)
  const daysOff = new Set([3, 10, 11, 17, 24, 25, 31])
  for (let d = 1; d <= 31; d++) {
    if (daysOff.has(d)) continue
    const trips = 14 + Math.round(Math.random() * 8) // ~14-22
    const hours = 7 + Math.random() * 3
    const km = Math.round(trips * (9 + Math.random() * 4))
    const gross = Math.round(trips * (11 + Math.random() * 5))
    earnings.push({
      id: uid(),
      date: iso(d),
      platform: platforms[d % platforms.length],
      gross,
      trips,
      km,
      hours: Number(hours.toFixed(1)),
      vehicleId,
      note: ''
    })
  }

  // Expenses across the month
  const fuelDays = [1, 6, 9, 13, 16, 20, 23, 27, 30]
  fuelDays.forEach((d, i) => {
    const liters = 30 + Math.round(Math.random() * 10)
    expenses.push({
      id: uid(),
      date: iso(d),
      category: 'Combustível',
      description: i % 2 ? 'Posto Shell' : 'Posto Ipiranga',
      amount: Number((liters * 5.89).toFixed(2)),
      liters,
      vehicleId,
      note: ''
    })
  })
  expenses.push({ id: uid(), date: iso(8), category: 'Manutenção', description: 'Troca de óleo', amount: 400, vehicleId, note: '' })
  expenses.push({ id: uid(), date: iso(5), category: 'Seguro', description: 'Parcela mensal', amount: 180, vehicleId, note: '' })
  expenses.push({ id: uid(), date: iso(12), category: 'Lavagem', description: 'Lava-rápido', amount: 60, vehicleId, note: '' })
  expenses.push({ id: uid(), date: iso(26), category: 'Lavagem', description: 'Lava-rápido', amount: 60, vehicleId, note: '' })
  expenses.push({ id: uid(), date: iso(14), category: 'Outros', description: 'Pedágio / estacionamento', amount: 150, vehicleId, note: '' })

  return {
    profile: {
      name: 'Marcello Matos',
      role: 'Motorista',
      avatar: ''
    },
    settings: {
      theme: 'dark',
      currency: 'BRL',
      currentMonth: `${year}-${pad(month)}`
    },
    goals: {
      monthly: 5000
    },
    vehicles: [
      {
        id: vehicleId,
        name: 'Onix Plus',
        brand: 'Chevrolet',
        model: 'Onix Plus 1.0 Turbo',
        plate: 'ABC-1D23',
        year: 2022,
        color: 'Prata',
        odometer: 78450
      }
    ],
    earnings,
    expenses
  }
}
