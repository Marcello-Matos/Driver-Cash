import React, { useMemo } from 'react'
import { Fuel, Droplets, DollarSign, Gauge } from 'lucide-react'
import { useStore } from '../store'
import { useSelectedMonth } from '../components/Topbar'
import { monthExpenses, monthEarnings } from '../lib/metrics'
import { brl, numberBR } from '../lib/utils'
import Despesas from './Despesas'

export default function Combustivel() {
  const store = useStore()
  const { year, month } = useSelectedMonth()

  const stats = useMemo(() => {
    const fuel = monthExpenses(store.expenses, year, month).filter((e) => e.category === 'Combustível')
    const totalSpent = fuel.reduce((a, e) => a + Number(e.amount || 0), 0)
    const totalLiters = fuel.reduce((a, e) => a + Number(e.liters || 0), 0)
    const avgPrice = totalLiters ? totalSpent / totalLiters : 0
    const km = monthEarnings(store.earnings, year, month).reduce((a, e) => a + Number(e.km || 0), 0)
    const consumption = totalLiters ? km / totalLiters : 0
    const costPerKm = km ? totalSpent / km : 0
    return { totalSpent, totalLiters, avgPrice, consumption, costPerKm, km }
  }, [store.expenses, store.earnings, year, month])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={DollarSign} bg="bg-rose-500" label="Gasto com combustível" value={brl(stats.totalSpent)} />
        <Stat icon={Droplets} bg="bg-blue-500" label="Litros abastecidos" value={`${numberBR(stats.totalLiters, 1)} L`} />
        <Stat icon={Fuel} bg="bg-amber-500" label="Preço médio / litro" value={brl(stats.avgPrice)} />
        <Stat icon={Gauge} bg="bg-brand-500" label="Consumo médio" value={`${numberBR(stats.consumption, 1)} km/L`} />
      </div>
      <Despesas fixedCategory="Combustível" />
    </div>
  )
}

function Stat({ icon: Icon, bg, label, value }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${bg}`}><Icon size={20} /></div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-lg font-extrabold">{value}</div>
      </div>
    </div>
  )
}
